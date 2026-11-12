import { createHash, randomBytes, randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { EmailHelper } from '../../helpers/EmailHelper.js';
import { DomainError } from '../../utils/DomainError.js';
import { ERROR_CATALOG } from '../../utils/errorCatalog.js';
import UsuarioSistema from '../usuarios_sistema/UsuarioSistema.js';
import CaficultorRepository from '../caficultores/repository/CaficultorRepository.js';
import CaficultorService from '../caficultores/services/CaficultorService.js';
import OfertasExternasRepository from './OfertasExternasRepository.js';

const hashToken = (token) => createHash('sha256').update(token).digest('hex');
const newToken = () => randomBytes(32).toString('hex');
const unavailable = () => new DomainError(ERROR_CATALOG.NOT_FOUND.code,
  'Este enlace venció o ya fue utilizado.', null, 404);
const conflict = (message) => new DomainError(ERROR_CATALOG.DUPLICATE_RESOURCE.code, message, null, 409);
const mailError = () => new DomainError(ERROR_CATALOG.INTERNAL_ERROR.code,
  'No se pudo enviar el correo. Intenta nuevamente más tarde.', null, 503);

async function sendEmail(to, subject, message, path, label) {
  if (!process.env.RESEND) throw mailError();
  const url = new URL(path, process.env.FRONTEND_URL || 'http://localhost:5173');
  const result = await EmailHelper.sendEmail({ to, subject,
    html: `<p>${message}</p><p><a href="${url.href}">${label}</a></p>` });
  if (!result.success || result.simulated || result.data?.error) throw mailError();
}

async function verifyCaptcha(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // El frontend de desarrollo puede usar el widget configurado o el control simulado.
  if (!secret && ['development', 'test'].includes(process.env.NODE_ENV)) return;
  if (!secret) {
    throw new DomainError(ERROR_CATALOG.INTERNAL_ERROR.code,
      'La verificación de seguridad no está disponible.', null, 503);
  }

  let result;
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) }),
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) result = await response.json();
  } catch {
    // El proveedor puede estar temporalmente inaccesible.
  }
  if (!result?.success) {
    throw new DomainError(ERROR_CATALOG.VALIDATION_ERROR.code,
      'Completa nuevamente la verificación de seguridad.', null, 422);
  }
}

export default class OfertasExternasService {
  constructor(repository = new OfertasExternasRepository(), mailer = sendEmail, captcha = verifyCaptcha) {
    this.repository = repository;
    this.sendEmail = mailer;
    this.verifyCaptcha = captcha;
    this.caficultores = new CaficultorService(new CaficultorRepository());
  }

  async submit({ captcha, ...data }, ip) {
    await this.verifyCaptcha(captcha, ip);
    const { nombres, apellidos, correo_electronico, telefono_movil, departamento, municipio } = data;
    const contacto = { nombres, apellidos, correo_electronico, telefono_movil, departamento, municipio };
    const token = newToken();
    await this.repository.transaction(async (tx) => {
      await this.repository.save({ ...data, contacto, id: randomUUID(), productorId: randomUUID(),
        hash: hashToken(token) }, tx);
      await this.sendEmail(correo_electronico, 'Confirma tu oferta de café',
        'Confirma tu correo en las próximas 24 horas para publicar tu oferta. Estará disponible durante 15 días.',
        `/agregar-producto/confirmar#${token}`, 'Confirmar y publicar');
    });
  }

  async confirm(token) {
    const hash = hashToken(token);
    return this.repository.transaction(async (tx) => {
      const productor = await this.repository.productorForOffer('confirmacion_hash', hash, tx);
      if (!productor) throw unavailable();
      await this.requireNewAccount(productor, tx);
      const offer = await this.repository.publish(hash, productor.id, tx);
      if (!offer) throw unavailable();
      return offer;
    });
  }

  async requireNewAccount(productor, tx) {
    if (productor.caficultor_id || await this.repository.cuentaExistente(productor.correo_electronico, tx)) {
      throw conflict('Este correo ya tiene una cuenta en ConexCoffee. Ingresa con tu cuenta existente.');
    }
  }

  async requireCompany(userId, tx) {
    const company = await this.repository.empresa(userId, tx);
    if (!company) throw new DomainError(ERROR_CATALOG.NOT_FOUND.code,
      'No existe una empresa asociada a esta sesión.', null, 404);
    return company;
  }

  async list(userId, page) {
    const company = await this.requireCompany(userId);
    const offers = await this.repository.list(company.id, (page - 1) * 20);
    return { data: offers.slice(0, 20), meta: { page, hasNext: offers.length > 20 } };
  }

  async invite(userId, id) {
    const token = newToken();
    return this.repository.transaction(async (tx) => {
      const company = await this.requireCompany(userId, tx);
      const productor = await this.repository.productorForOffer('id', id, tx);
      if (!productor || productor.caficultor_id || await this.repository.cuentaExistente(productor.correo_electronico, tx)) {
        throw conflict('Esta oferta ya no está disponible.');
      }
      const offer = await this.repository.reserve(id, productor.id, company.id, hashToken(token), tx);
      if (!offer) throw conflict('La oferta venció o ya hay una invitación vigente para este productor.');
      await this.sendEmail(productor.correo_electronico, 'Una empresa quiere vincularte a ConexCoffee',
        'Una empresa está interesada en tu oferta de café. Abre el enlace para conocerla y decidir si quieres vincularte.',
        `/agregar-producto/invitacion#${token}`, 'Revisar invitación');
      return offer;
    });
  }

  async preview(token) {
    const offer = await this.repository.invitation(hashToken(token));
    if (!offer) throw unavailable();
    const { empresa_id: _companyId, empresa_usuario_id: _userId, ...details } = offer;
    return details;
  }

  async accept({ token, captcha, contrasena, tipo_documento, numero_documento, genero }, ip) {
    await this.verifyCaptcha(captcha, ip);
    const hash = hashToken(token);
    const hash_contrasena = await bcrypt.hash(contrasena, 10);
    try {
      await this.repository.transaction(async (tx) => {
        const productor = await this.repository.productorForOffer('invitacion_hash', hash, tx);
        if (!productor) throw unavailable();
        const offer = await this.repository.invitation(hash, tx);
        if (!offer) throw unavailable();
        await this.requireNewAccount(productor, tx);

        const user = await UsuarioSistema.create({
          correo_electronico: productor.correo_electronico, hash_contrasena,
          rol_principal: 'CAFICULTOR', esta_activo: true, correo_verificado: true,
          creado_por_usuario_id: offer.empresa_usuario_id,
        }, { transaction: tx, logging: false });
        const { nombres, apellidos, telefono_movil, departamento, municipio } = productor;
        const caficultor = await this.caficultores.create({
          usuario_id: user.id, empresa_exportadora_id: offer.empresa_id,
          nombres, apellidos, telefono_movil, departamento, municipio, tipo_documento, numero_documento, genero,
        }, { transaction: tx, logging: false });
        await this.repository.link(offer.id, productor.id, caficultor.id, tx);
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw conflict('Ya existe un perfil con ese documento o una cuenta con ese correo.');
      }
      throw error;
    }
  }

  async notifyExpired() {
    if (!process.env.RESEND) return;
    const processedIds = [];
    for (let index = 0; index < 20; index++) {
      try {
        const hasOffer = await this.repository.transaction(async (tx) => {
          const offer = await this.repository.nextExpired(processedIds, tx);
          if (!offer) return false;
          processedIds.push(offer.id);
          await this.sendEmail(offer.correo_electronico, 'Tu oferta de café venció',
            'Tu oferta dejó de estar visible. Si todavía tienes café disponible, puedes publicar otra oferta.',
            '/agregar-producto', 'Publicar una oferta');
          await this.repository.markExpiredNotified(offer.id, tx);
          return true;
        });
        if (!hasOffer) break;
      } catch (error) {
        if (error.statusCode !== 503) throw error;
      }
    }
  }
}
