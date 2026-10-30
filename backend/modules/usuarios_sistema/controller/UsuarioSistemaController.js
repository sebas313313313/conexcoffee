import BaseController from '../../baseController.js';
import UsuarioSistemaRepository from '../repository/UsuarioSistemaRepository.js';
import UsuarioSistemaService from '../services/UsuarioSistemaService.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 24 * 60 * 60 * 1000, // 24 horas
  path: '/',
};

class UsuarioSistemaController extends BaseController {
  constructor(service = new UsuarioSistemaService(new UsuarioSistemaRepository())) {
    super(service);
  }

  register = (req, res) =>
    this.execute(res, async () => {
      const creado_por = req.user?.id || null;
      const {
        correo_electronico,
        email,
        correo,
        contrasena,
        password,
        rol_principal,
        role,
        nombre_empresa,
        company,
        firstName,
        lastName,
        tipo_entidad,
        identificacion_tributaria,
        taxId,
        pais_destino,
        country,
        ciudad,
        city,
        direccion_entrega,
        address,
        telefono_contacto,
        phone,
      } = req.body || {};

      return await this.service.register({
        correo_electronico,
        email,
        correo,
        contrasena,
        password,
        rol_principal,
        role,
        nombre_empresa,
        company,
        firstName,
        lastName,
        tipo_entidad,
        identificacion_tributaria,
        taxId,
        pais_destino,
        country,
        ciudad,
        city,
        direccion_entrega,
        address,
        telefono_contacto,
        phone,
        creado_por_usuario_id: creado_por,
      });
    }, 201);

  login = (req, res) =>
    this.execute(res, async () => {
      const correo_electronico = req.body.correo_electronico || req.body.email || req.body.correo;
      const contrasena = req.body.contrasena || req.body.password;
      const result = await this.service.login(correo_electronico, contrasena);

      if (result?.token) {
        res.cookie('token', result.token, COOKIE_OPTIONS);
      }

      return result;
    });

  logout = (req, res) =>
    this.execute(res, async () => {
      res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      });
      return { message: 'Sesión cerrada exitosamente' };
    });

  getProfile = (req, res) =>
    this.execute(res, async () => {
      return await this.service.getProfile(req.user.id);
    });

  changePassword = (req, res) =>
    this.execute(res, async () => {
      const { contrasenaActual, nuevaContrasena } = req.body;
      return await this.service.changePassword(req.user.id, contrasenaActual, nuevaContrasena);
    });
}

export default UsuarioSistemaController;
