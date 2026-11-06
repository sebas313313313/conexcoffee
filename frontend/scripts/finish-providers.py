from pathlib import Path
import re
import json

root = Path(__file__).resolve().parents[1] / 'src' / 'context'

def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding='utf-8', newline='\n')

def read(path):
    return path.read_text(encoding='utf-8')

# Mover el cálculo de humedad junto a los demás indicadores.
actions_path = root / 'laboratorio/actions.js'
actions = read(actions_path)
start = actions.index('  // ── DASHBOARD')
end = actions.index('  return {', start)
humidity = actions[start:end]
actions = actions[:start] + actions[end:]
actions = actions.replace(', avgHumedad };', ' };')
write(actions_path, actions)
summary_path = root / 'laboratorio/summary.js'
summary = read(summary_path).replace('  const stats =', humidity + '  const stats =')
write(summary_path, summary)

removals = {
 'superadmin/actions.js': ['catadores', 'tecnicos', 'brokers', 'compradores'],
 'empresa/actions.js': ['brokers', 'contenedores', 'tecnicos'],
 'empresa/summary.js': ['lotes'], 'catador/summary.js': ['lotes'],
 'caficultor/actions.js': ['preofertas'], 'comprador/actions.js': ['pedidos'],
 'laboratorio/actions.js': ['analisisFisicos'],
}
for file, names in removals.items():
    path = root / file
    text = read(path)
    match = re.search(r'  const \{ ([^}]+) \} = state;', text)
    fields = [n.strip() for n in match.group(1).split(',') if n.strip() not in names]
    text = text[:match.start()] + '  const { ' + ', '.join(fields) + ' } = state;' + text[match.end():]
    write(path, text)
path = root / 'comprador/summary.js'
write(path, read(path).replace('selectCompradorSummary(state)', 'selectCompradorSummary()'))
for path in root.glob('*Context.jsx'):
    if path.stem in ['BrokerContext', 'AuthContext', 'LandingContext']:
        continue
    text = read(path)
    if path.stem != 'CatadorContext':
        text = text.replace('}), [state, setters, actions,', '}), [state, actions,')
    text = text.replace('loading: loading,', 'loading,').replace('error: error,', 'error,').replace('refetch: refetch,', 'refetch,')
    write(path, text)

# Broker conserva sus datos locales actuales; se separan sus responsabilidades.
path = root / 'BrokerContext.jsx'
original = read(path)
folder = root / 'broker'
storage = original[original.index('const getStored ='):original.index('export const BrokerProvider')]
storage = storage.replace('const getStored =', 'export const getStored =').replace('const setStored =', 'export const setStored =')
write(folder / 'storage.js', storage)
seed_import = re.search(r'import \{\n  BROKER_CONTENEDORES_SEED,[\s\S]*?;', original).group()
seed_import = seed_import.replace("'@/features/broker/data/brokerData'", "'../../features/broker/data/brokerData.js'")
seed_import = seed_import.replace('  BROKER_PAISES_DESTINO,\n', '')

state_section = original[original.index('export const BrokerProvider'):original.index('  const fetchAll =')]
states = re.findall(r'  const \[(\w+), (\w+)\] = useState\(([\s\S]*?)\);', state_section)
states = [(name, setter, re.sub(r'^\(\) =>\s*', '', initial).strip()) for name, setter, initial in states if name not in ['loading', 'error']]
raw_section = re.search(r'const \[\s*\n([\s\S]*?)\] = await Promise.all\(\[([\s\S]*?)\]\);', original).groups()
raw_names = [n.strip() for n in raw_section[0].split(',') if n.strip()]
endpoints = dict(zip(raw_names, re.findall(r"safeGet\('([^']+)'\)", raw_section[1])))
mapping_start = original.index('      const mappedContenedores')
mapping_end = original.index('      setNegociaciones', mapping_start)
mapping = original[mapping_start:mapping_end]
mapping = '\n'.join(line[4:] if line.startswith('    ') else line for line in mapping.splitlines())
mapping += '''
  const contenedores = mappedContenedores.length > 0
    ? [
        ...BROKER_CONTENEDORES_SEED,
        ...mappedContenedores.filter(
          (mc) => !BROKER_CONTENEDORES_SEED.some((bc) => bc.codigo === mc.codigo_contenedor)
        ),
      ]
    : previous.contenedores;
  return { negociaciones: mappedPedidos, contenedores };
'''
route_map = {f'/broker/{route}': [] for route in ['ofertas', 'muestras', 'ventas', 'compradores', 'eventos']}
route_map['/broker/contenedores'] = [key for key in raw_names if key not in ['rawPedidos', 'rawCompradores', 'rawBrokers']]
initials = ',\n'.join(f'    {name}: {initial}' for name, _, initial in states)
data = "import { mapContenedor, mapPedido } from '../mappers.js';\nimport { getStored, setStored } from './storage.js';\n" + seed_import
data += f'\n\nexport function selectBrokerData({{ {", ".join(raw_names)} }}, previous) {{\n{mapping}}}\n'
data += f'''
export const brokerData = {{
  createInitialState: () => ({{
{initials},
  }}),
  endpoints: {json.dumps(endpoints, indent=2)},
  routes: {json.dumps(route_map, indent=2)},
  allSources: {json.dumps(raw_names)},
  select: selectBrokerData,
  onLoaded(raw, mapped) {{
    if (raw.rawContenedores.length > 0) {{
      setStored('conexcoffee_broker_contenedores', mapped.contenedores);
    }}
  }},
}};
'''
write(folder / 'data.js', data)
action_body = original[original.index('  // Acciones de Eventos'):original.index('  const stats =')]
action_names = re.findall(r'^  const (\w+) =', action_body, re.M)
write(folder / 'actions.js', "import toast from 'react-hot-toast';\nimport { setStored } from './storage.js';\n\nexport function createBrokerActions(state, setters) {\n  const { eventos, muestras } = state;\n  const { setEventos, setMuestras } = setters;\n" + action_body + '\n  return { ' + ', '.join(action_names) + ' };\n}\n')
summary = original[original.index('  const stats ='):original.index('  return (\n    <BrokerContext.Provider')]
write(folder / 'summary.js', 'export function selectBrokerSummary(state) {\n  const { contenedores, ofertasLibres, muestras, compradores } = state;\n' + summary + '\n  return { stats };\n}\n')
value = original.split('      value={{', 1)[1].split('      }}', 1)[0]
fields = [name for name, _, _ in states]
value_lines = []
for line in value.strip().splitlines():
    item = line.strip().rstrip(',')
    key, val = item.split(':', 1) if ':' in item else (item, item)
    key, val = key.strip(), val.strip()
    val = 'refetch' if val == 'fetchAll' else f'state.{val}' if val in fields else f'actions.{val}' if val in action_names else 'summary.stats' if val == 'stats' else val
    value_lines.append('    ' + (key if key == val else f'{key}: {val}') + ',')
write(path, '''import { createContext, useMemo } from 'react';
import { useRoleData } from './shared/useRoleData';
import { brokerData } from './broker/data';
import { createBrokerActions } from './broker/actions';
import { selectBrokerSummary } from './broker/summary';
import { BROKER_PAISES_DESTINO } from '@/features/broker/data/brokerData';

export const BrokerContext = createContext(null);

export const BrokerProvider = ({ children }) => {
  const { state, setters, loading, error, refetch } = useRoleData(brokerData);
  const actions = useMemo(() => createBrokerActions(state, setters), [state, setters]);
  const summary = useMemo(() => selectBrokerSummary(state), [state]);
  const value = useMemo(() => ({
''' + '\n'.join(value_lines) + '''
  }), [state, actions, summary, loading, error, refetch]);

  return <BrokerContext.Provider value={value}>{children}</BrokerContext.Provider>;
};
''')

# Formato compacto para planes de carga e imports compatibles con pruebas Node.
for path in root.glob('*/data.js'):
    text = read(path).replace("from '../mappers'", "from '../mappers.js'")
    for key in ['endpoints', 'routes']:
        match = re.search(r'  ' + key + r': (\{[\s\S]*?\n\}),', text)
        parsed = json.loads(match.group(1))
        formatted = '  ' + key + ': {\n'
        for name, value in parsed.items():
            key_text = name if key == 'endpoints' else repr(name)
            value_text = repr(value)
            formatted += f'    {key_text}: {value_text},\n'
        formatted += '  },'
        text = text[:match.start()] + formatted + text[match.end():]
    text = re.sub(r'^  (\w+: \[\],?)$', r'    \1', text, flags=re.M)
    write(path, text)
print('Providers finalizados')
