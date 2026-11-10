/**
 * ============================================================
 * AUDITORÍA DE ARQUITECTURA — ConexCoffee Frontend
 * ============================================================
 * Script SOLO DE DIAGNÓSTICO. No modifica el código de la app.
 *
 *   node scripts/audit-arquitectura.mjs
 *
 * Solo incluye las reglas que hoy encuentran algo. Las reglas de
 * hallazgos ya resueltos se retiraron para que la salida sea accionable.
 * Exit code 1 si hay hallazgos de severidad ALTA.
 * ============================================================
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

const walk = (dir, acc = []) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
};

const files = walk(SRC);
const rel = (f) => relative(ROOT, f).replace(/\\/g, '/');
const read = (f) => readFileSync(f, 'utf8');
const codeFiles = files.filter((f) => /\.(js|jsx)$/.test(f));
const lineCount = (f) => read(f).split('\n').length;
const allSrc = codeFiles.map((f) => ({ f, src: read(f) }));

// Quita comentarios conservando el número de línea.
const stripComments = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ''))
    .split('\n')
    .map((l) => (/^\s*(\/\/|\*)/.test(l) ? '' : l))
    .join('\n');

const findings = [];
const add = (severity, rule, file, message, line) =>
  findings.push({ severity, rule, file: rel(file), line, message });

// ------------------------------------------------------------
// R11 / R12 · Tamaño de archivo
// ------------------------------------------------------------
for (const f of codeFiles) {
  const n = lineCount(f);
  const path = rel(f);
  if (/\/pages\//.test(path) && n > 300) {
    add(n > 600 ? 'ALTA' : 'MEDIA', 'R11 Tamaño de page', f, `${n} líneas (límite ~300). Deuda técnica declarada en AGENTS.md`);
  } else if (!/\/pages\//.test(path) && !/\/data\//.test(path) && n > 400) {
    add('MEDIA', 'R12 Tamaño de archivo', f, `${n} líneas en un archivo no-page`);
  }
}

// ------------------------------------------------------------
// R21 · Modales hechos a mano en vez de ModalBase
// ------------------------------------------------------------
for (const f of codeFiles) {
  if (rel(f).includes('components/modals/ModalBase.jsx')) continue;
  const n = (read(f).match(/fixed inset-0/g) || []).length;
  if (n > 0 && !/ModalBase/.test(read(f))) {
    add('MEDIA', 'R21 Modal accesible', f, `${n} modal(es) con "fixed inset-0" en vez de <ModalBase />: sin focus trap, ESC, aria-modal ni bloqueo de scroll`);
  }
}

// ------------------------------------------------------------
// R23 · Código muerto conocido
// ------------------------------------------------------------
for (const dead of ['src/hooks/useModal.js', 'src/hooks/useDebounce.js']) {
  const f = join(ROOT, dead);
  if (!existsSync(f)) continue;
  const used = allSrc.some(
    ({ f: other, src }) =>
      rel(other) !== dead && /use(Modal|Debounce)/.test(src) && /import .*(useModal|useDebounce)/.test(src)
  );
  if (!used) add('BAJA', 'R23 Código muerto', f, 'Archivo sin ningún import en el proyecto');
}
for (const dead of ['src/components/modals/FormModal.jsx', 'src/components/modals/ConfirmModal.jsx']) {
  const f = join(ROOT, dead);
  if (!existsSync(f)) continue;
  const name = dead.split('/').pop().replace('.jsx', '');
  const used = allSrc.some(({ f: other, src }) => rel(other) !== dead && new RegExp(`import[^\\n]*${name}[^\\n]*from`).test(src));
  if (!used) add('BAJA', 'R23 Código muerto', f, `${name} no se usa en ninguna parte; el barrel lo exporta igual`);
}

// ------------------------------------------------------------
// R28 · Contratos de datos: convención de nombres mezclada
// ------------------------------------------------------------
for (const f of codeFiles.filter((x) => rel(x).includes('/data/'))) {
  const src = read(f);
  const keys = [...src.matchAll(/^\s{4,}([a-zA-Z_][\w]*)\s*:/gm)].map((m) => m[1]);
  const snake = keys.filter((k) => /^[a-z]+(_[a-z]+)+$/.test(k));
  const camel = keys.filter((k) => /^[a-z]+([A-Z][a-z]+)+$/.test(k));
  if (snake.length >= 3 && camel.length >= 3) {
    add('MEDIA', 'R28 Convención de datos', f, `Mezcla snake_case (${snake.slice(0, 3).join(', ')}…) y camelCase (${camel.slice(0, 3).join(', ')}…) en el mismo modelo`);
  }
}

// ------------------------------------------------------------
// R29b · Misma entidad modelada en dos features (comparación por forma)
// ------------------------------------------------------------
const normalizeKey = (k) => k.replace(/_/g, '').toLowerCase();
const STOP_TOKENS = new Set([
  'INITIAL', 'MOCK', 'DATA', 'SEED', 'MIS', 'EMPRESA', 'SUPERADMIN', 'CAFICULTOR',
  'LABORATORIO', 'CATADOR', 'COMPRADOR', 'TECNICO', 'BROKER', 'DISPONIBLES', 'RESUMEN',
]);
const nameTokens = (name) =>
  name.split('_').filter((t) => t && !STOP_TOKENS.has(t)).map((t) => t.toLowerCase());

const shapes = [];
for (const f of codeFiles.filter((x) => rel(x).includes('/data/'))) {
  const src = read(f);
  const feature = rel(f).split('/')[2];
  for (const m of src.matchAll(/export const ([A-Z][A-Z0-9_]+)\s*=\s*\[\s*\{/g)) {
    const start = m.index + m[0].length;
    const body = `{` + src.slice(start, start + 4000);
    const firstObjEnd = body.indexOf('},');
    const firstObj = firstObjEnd > 0 ? body.slice(0, firstObjEnd) : body;
    const keys = [...firstObj.matchAll(/^\s{4,}([a-zA-Z_][\w]*)\s*:/gm)].map((k) => normalizeKey(k[1]));
    if (keys.length >= 4) shapes.push({ feature, name: m[1], file: rel(f), keys: new Set(keys), tokens: nameTokens(m[1]) });
  }
}

const shapePairs = new Set();
for (let i = 0; i < shapes.length; i += 1) {
  for (let j = i + 1; j < shapes.length; j += 1) {
    const a = shapes[i];
    const b = shapes[j];
    if (a.feature === b.feature) continue;
    // Solo comparar si el nombre sugiere la misma entidad (FINCAS vs FINCAS, PREOFERTAS vs PREOFERTAS).
    const sameFamily = a.tokens.some((t) => b.tokens.includes(t) && t.length > 3);
    if (!sameFamily) continue;
    const common = [...a.keys].filter((k) => b.keys.has(k));
    const ratio = common.length / Math.min(a.keys.size, b.keys.size);
    if (common.length >= 3) {
      const pairKey = [a.name, b.name].sort().join('|');
      if (shapePairs.has(pairKey)) continue;
      shapePairs.add(pairKey);
      add(
        'ALTA',
        'R29b Entidad duplicada (forma)',
        join(ROOT, a.file),
        `${a.name} (${a.feature}) y ${b.name} (${b.feature}) modelan la misma entidad: ${common.length} campos coinciden (${Math.round(ratio * 100)}% del modelo más pequeño: ${common.slice(0, 5).join(', ')})`
      );
    }
  }
}

// ------------------------------------------------------------
// R31 · Símbolos usados sin importar → ReferenceError en runtime
// ------------------------------------------------------------
const PROJECT_SYMBOLS = ['toast', 'useAuthStore', 'useUIStore', 'ROLES', 'IS_DEMO_MODE', 'HAS_API'];
for (const f of codeFiles) {
  const code = stripComments(read(f));
  for (const sym of PROJECT_SYMBOLS) {
    if (!new RegExp(`\\b${sym}\\b`).test(code)) continue;
    const declared = new RegExp(
      `(import[^;]*\\b${sym}\\b|(const|let|var|function)\\s+${sym}\\b|\\{[^}]*\\b${sym}\\b[^}]*\\}\\s*=)`
    ).test(code);
    if (declared) continue;
    const line = code.split('\n').findIndex((l) => new RegExp(`\\b${sym}\\b`).test(l)) + 1;
    add('ALTA', 'R31 Símbolo sin importar', f, `Se usa "${sym}" pero nunca se importa: ReferenceError al ejecutar ese camino`, line);
  }
}

// ------------------------------------------------------------
// R32 · Estado de servidor "sombreado" con useState (falsa migración)
// ------------------------------------------------------------
for (const f of codeFiles) {
  const src = read(f);
  if (
    /const \[\w+Override, set\w+Override\] = useState\(null\)/.test(src) &&
    /\w+\.data\s*\?\?\s*\[\]|\?\?\s*\(?\s*\w+Query\.data/.test(src)
  ) {
    add('ALTA', 'R32 Estado de servidor sombreado', f, 'Copia el resultado de TanStack Query a un useState ("...Override"): las escrituras no pasan por la mutación y se pierden al desmontar');
  }
}

// ------------------------------------------------------------
// R33 · Hooks exportados y nunca usados (abstracción muerta)
// ------------------------------------------------------------
const hookUsages = new Set();
for (const f of codeFiles) {
  if (/\/hooks\//.test(rel(f))) continue;
  for (const m of read(f).matchAll(/\b(use[A-Z]\w+)\b/g)) hookUsages.add(m[1]);
}
for (const f of codeFiles.filter((x) => rel(x).includes('/hooks/'))) {
  const src = read(f);
  const declared = [...src.matchAll(/^export const (use[A-Z]\w+)\s*=/gm)].map((m) => m[1]);
  const unused = declared.filter((n) => !hookUsages.has(n));
  if (unused.length >= 3) {
    add('BAJA', 'R33 Hook sin uso', f, `${unused.length} hooks exportados no se importan en ninguna page/componente (p. ej. ${unused.slice(0, 3).join(', ')})`);
  }
}

// ------------------------------------------------------------
// R34 · Barrel de feature importado estáticamente (rompe code splitting)
// ------------------------------------------------------------
const layoutFiles = codeFiles.filter((x) => rel(x).startsWith('src/layouts/') || rel(x).startsWith('src/components/'));
for (const f of layoutFiles) {
  for (const m of read(f).matchAll(/from ['"]@\/features\/([^'"]+)['"]/g)) {
    const feature = m[1].split('/')[0];
    const isBarrel = m[1] === feature || m[1] === `${feature}/index` || m[1] === `${feature}/index.js`;
    if (!isBarrel) continue;
    const barrel = join(SRC, 'features', feature, 'index.js');
    if (!existsSync(barrel)) continue;
    if (/\.\/pages\//.test(read(barrel))) {
      add('ALTA', 'R34 Barrel rompe code splitting', f, `Importa estáticamente el barrel de "${feature}", que re-exporta páginas: esas páginas entran al bundle inicial y el lazy del router deja de separar el chunk`);
    }
  }
}

// ------------------------------------------------------------
// R35 · Setter de estado usado sin declarar (ReferenceError al interactuar)
// ------------------------------------------------------------
const KNOWN_API = new Set(['setTimeout', 'setInterval', 'setState', 'setImmediate']);
for (const f of codeFiles) {
  const code = stripComments(read(f));
  const used = new Set([...code.matchAll(/(?<!\.)\b(set[A-Z]\w+)\s*\(/g)].map((m) => m[1]));
  for (const setter of used) {
    if (KNOWN_API.has(setter)) continue;
    const declared =
      new RegExp(`(import[^;]*\\b${setter}\\b|const\\s+\\[[^\\]]*\\b${setter}\\b|(const|let|var|function)\\s+${setter}\\b|\\{[^}]*\\b${setter}\\b[^}]*\\}\\s*=)`).test(code);
    if (declared) continue;
    const line = code.split('\n').findIndex((l) => new RegExp(`\\b${setter}\\s*\\(`).test(l)) + 1;
    add('ALTA', 'R35 Setter sin declarar', f, `Se llama "${setter}()" pero no existe en el archivo: ReferenceError al ejecutar ese camino (los datos vienen de TanStack Query, no de un useState local)`, line);
  }
}

// ------------------------------------------------------------
// RESUMEN
// ------------------------------------------------------------
const order = { ALTA: 0, MEDIA: 1, BAJA: 2 };
findings.sort((a, b) => order[a.severity] - order[b.severity] || a.rule.localeCompare(b.rule) || a.file.localeCompare(b.file));

const byRule = new Map();
for (const f of findings) {
  const key = `${f.severity} · ${f.rule}`;
  if (!byRule.has(key)) byRule.set(key, []);
  byRule.get(key).push(f);
}

console.log('\n=========== AUDITORÍA DE ARQUITECTURA — ConexCoffee ===========\n');
for (const [key, list] of byRule) {
  console.log(`\n### ${key}  (${list.length})`);
  for (const f of list) {
    console.log(`  - ${f.file}${f.line ? `:${f.line}` : ''}`);
    console.log(`      ${f.message}`);
  }
}

const altas = findings.filter((f) => f.severity === 'ALTA').length;
const medias = findings.filter((f) => f.severity === 'MEDIA').length;
const bajas = findings.filter((f) => f.severity === 'BAJA').length;

console.log('\n--------------------------------------------------------------');
console.log(`TOTAL: ${findings.length} hallazgos  →  ALTA: ${altas} · MEDIA: ${medias} · BAJA: ${bajas}`);
console.log('--------------------------------------------------------------\n');

process.exit(altas > 0 ? 1 : 0);
