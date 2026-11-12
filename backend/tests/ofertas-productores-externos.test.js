import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.js';
import Caficultor from '../modules/caficultores/Caficultor.js';
import EmpresaExportadora from '../modules/empresas_exportadoras/EmpresaExportadora.js';
import OfertasExternasRepository from '../modules/ofertas_productores_externos/OfertasExternasRepository.js';
import OfertasExternasService from '../modules/ofertas_productores_externos/OfertasExternasService.js';
import UsuarioSistema from '../modules/usuarios_sistema/UsuarioSistema.js';

test('una oferta externa se publica, expira o vincula al productor sin crear finca ni lote', {
  skip: process.env.TEST_OFERTAS_EXTERNAS_DB !== '1',
}, async () => {
  const rollback = new Error('Descartar los datos de la prueba');
  const migration = await readFile(new URL('../migrations/004_ofertas_productores_externos.sql', import.meta.url), 'utf8');
  const migrationBody = migration.replace(/^BEGIN;/, '').replace(/COMMIT;\s*$/, '');
  const messages = [];
  const repository = new OfertasExternasRepository();
  const service = new OfertasExternasService(repository, async (...email) => { messages.push(email); }, async () => {});
  const tokenFromLastEmail = () => messages.at(-1)[3].split('#')[1];
  const suffix = randomUUID();
  const correo = `prueba-${suffix}@example.com`;
  const offer = {
    nombres: 'Prueba', apellidos: 'Caficultura', correo_electronico: correo,
    telefono_movil: '3001234567', departamento: 'Cauca', municipio: 'Piendamó',
    variedad: 'Castillo', proceso: 'LAVADO', cantidad_sacos: 10,
    peso_total_kg: 600, precio_kg_cop: 17000, condiciones_version: '2026-11-11',
  };

  try {
    await assert.rejects(sequelize.transaction({ logging: false }, async (outer) => {
      const options = { transaction: outer, logging: false };
      await sequelize.query(migrationBody, options);
      await sequelize.query(migrationBody, options);
      repository.transaction = (work) => sequelize.transaction(options, work);
      const { empresa, list, invitation } = repository;
      repository.empresa = (id, tx = outer) => empresa.call(repository, id, tx);
      repository.list = (id, offset, tx = outer) => list.call(repository, id, offset, tx);
      repository.invitation = (hash, tx = outer) => invitation.call(repository, hash, tx);
      async function createCompany(label, index) {
        const user = await UsuarioSistema.create({ correo_electronico: `${label}-${suffix}@example.com`,
          hash_contrasena: 'solo-para-la-prueba', rol_principal: 'EMPRESA_EXPORTADORA' }, options);
        const company = await EmpresaExportadora.create({ usuario_id: user.id, razon_social: `Empresa ${label}`,
          nit: `${index}${Date.now()}`, representante_legal: 'Prueba', telefono_contacto: '3001234567',
          direccion: 'Dirección de prueba' }, options);
        return { company, user };
      }
      const a = await createCompany('primera', 1);
      const b = await createCompany('segunda', 2);
      const findUser = () => UsuarioSistema.findOne({ ...options, where: { correo_electronico: correo } });
      const listFor = (actor) => service.list(actor.user.id, 1);

      await service.submit(offer);
      const confirmToken = tokenFromLastEmail();
      const [pending] = await sequelize.query('SELECT id FROM cosechas.ofertas_productores_externos WHERE contacto_declarado->>\'correo_electronico\' = $email', { ...options, bind: { email: correo } });
      assert.equal((await listFor(a)).data.some((row) => row.id === pending[0].id), false);
      assert.equal(await findUser(), null);
      const published = await service.confirm(confirmToken);
      await assert.rejects(service.confirm(confirmToken), { statusCode: 404 });
      await service.submit({ ...offer, variedad: 'Caturra' });
      const secondOffer = await service.confirm(tokenFromLastEmail());
      for (const actor of [a, b]) {
        const row = (await listFor(actor)).data.find((record) => record.id === published.id);
        assert.equal(row.estado, 'DISPONIBLE');
        assert.equal(row.municipio, 'Piendamó');
        assert.equal(row.correo_electronico, undefined);
        assert.equal(row.telefono_movil, undefined);
      }

      await service.invite(a.user.id, published.id);
      const expiredInvite = tokenFromLastEmail();
      assert.equal((await service.preview(expiredInvite)).razon_social, 'Empresa primera');
      assert.equal(await findUser(), null);
      assert.equal((await listFor(b)).data.some((row) => row.id === published.id), false);
      await assert.rejects(service.invite(b.user.id, published.id), { statusCode: 409 });
      await assert.rejects(service.invite(b.user.id, secondOffer.id), { statusCode: 409 });
      const forceExpiry = (column, id) => sequelize.query(`UPDATE cosechas.ofertas_productores_externos
        SET ${column} = now() - interval '1 second' WHERE id = $id`, { ...options, bind: { id } });
      await forceExpiry('invitacion_vence_en', published.id);
      await assert.rejects(service.preview(expiredInvite), { statusCode: 404 });
      await service.invite(b.user.id, published.id);
      const invitationToken = tokenFromLastEmail();

      await service.submit({ ...offer, correo_electronico: `vence-${suffix}@example.com` });
      const expiredOffer = await service.confirm(tokenFromLastEmail());
      await forceExpiry('vence_en', expiredOffer.id);
      assert.equal((await listFor(a)).data.some((row) => row.id === expiredOffer.id), false);
      await assert.rejects(service.invite(a.user.id, expiredOffer.id), { statusCode: 409 });

      const activation = { token: invitationToken, contrasena: 'MiClaveDePrueba2026', tipo_documento: 'CC',
        numero_documento: String(Date.now()), genero: 'Femenino' };
      await service.accept(activation);
      const account = await findUser();
      assert.equal(account.rol_principal, 'CAFICULTOR');
      assert.equal(await bcrypt.compare(activation.contrasena, account.hash_contrasena), true);
      const profile = await Caficultor.findOne({ ...options, where: { usuario_id: account.id } });
      assert.equal(profile.empresa_exportadora_id, b.company.id);
      const linked = (await listFor(b)).data.find((row) => row.id === published.id);
      assert.equal(linked.estado, 'VINCULADA');
      assert.equal(linked.productor_vinculado, 'Prueba Caficultura');
      assert.equal((await listFor(a)).data.some((row) => row.id === published.id), false);
      assert.equal((await listFor(b)).data.some((row) => row.id === secondOffer.id), false);
      await assert.rejects(service.accept(activation), { statusCode: 404 });
      throw rollback;
    }), (error) => error === rollback);
  } finally {
    await sequelize.close();
  }
});
