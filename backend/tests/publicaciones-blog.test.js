import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import { Op } from 'sequelize';
import blogRouter from '../modules/publicaciones_blog/PublicacionBlog.js';
import { PublicacionBlog, validarPublicacion } from '../modules/publicaciones_blog/PublicacionBlog.js';

const payload = {
  titulo: 'Historia del café', slug: 'historia-del-cafe', extracto: 'Un extracto',
  contenido_markdown: '# Historia\nContenido', imagen_destacada_url: 'https://example.test/cafe.jpg',
  publicado: false, fecha_publicacion: '2026-11-04T12:00:00.000Z',
};
test('el modelo apunta a la tabla existente comunicacion.publicaciones_blog', () => {
  const table = PublicacionBlog.getTableName();
  assert.equal(table.schema, 'comunicacion');
  assert.equal(table.tableName, 'publicaciones_blog');
});
test('permite borradores y normaliza las referencias opcionales', () => {
  const result = validarPublicacion(payload);
  assert.equal(result.publicado, false);
  assert.equal(result.caficultor_destacado_id, null);
  assert.equal(result.url_video_youtube, null);
});
test('rechaza datos incompletos, enlaces inválidos y autoría enviada por el cliente', () => {
  for (const extra of [{ titulo: '' }, { slug: 'Slug inválido' },
    { imagen_destacada_url: 'javascript:alert(1)' },
    { url_video_youtube: 'https://example.test/video' }, { autor_id: 'otro-autor' }]) {
    assert.throws(() => validarPublicacion({ ...payload, ...extra }), error => error.statusCode === 422);
  }
});

test('el blog público funciona sin sesión y no permite consultar borradores ni publicaciones futuras', async () => {
  const original = PublicacionBlog.findAndCountAll;
  PublicacionBlog.findAndCountAll = async (options) => {
    assert.equal(options.where.publicado, true);
    assert.ok(options.where.fecha_publicacion[Op.lte] instanceof Date);
    assert.equal(Object.keys(options.where).length, 2);
    assert.equal(options.limit, 50);
    assert.equal(options.offset, 50);
    assert.equal(options.attributes.includes('autor_id'), false);
    return { rows: [{ titulo: 'Publicación real', contenido_markdown: '# Café' }], count: 51 };
  };
  const app = express();
  app.use('/api/publicaciones-blog', blogRouter);
  try {
    const response = await request(app).get('/api/publicaciones-blog/publicas')
      .query({ page: 2, limit: 999, publicado: false, fecha_publicacion: '2099-01-01' });
    assert.equal(response.status, 200);
    assert.equal(response.body.data[0].titulo, 'Publicación real');
    assert.equal(response.body.meta.totalPages, 2);
  } finally { PublicacionBlog.findAndCountAll = original; }
});

test('el blog público vacío responde sin artículos de respaldo', async () => {
  const original = PublicacionBlog.findAndCountAll;
  PublicacionBlog.findAndCountAll = async () => ({ rows: [], count: 0 });
  const app = express();
  app.use('/api/publicaciones-blog', blogRouter);
  try {
    const response = await request(app).get('/api/publicaciones-blog/publicas');
    assert.equal(response.status, 200);
    assert.deepEqual(response.body.data, []);
    assert.equal(response.body.meta.totalRecords, 0);
  } finally { PublicacionBlog.findAndCountAll = original; }
});
