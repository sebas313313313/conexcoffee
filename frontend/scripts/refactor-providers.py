from pathlib import Path
import re
import json

root = Path(__file__).resolve().parents[1] / 'src' / 'context'
roles = ['SuperAdmin', 'Empresa', 'Laboratorio', 'Caficultor', 'Catador', 'Comprador', 'Tecnico']
summary_starts = {
    'SuperAdmin': '  const stats =', 'Empresa': '  const totalVolumenKg =',
    'Laboratorio': '  const stats =', 'Catador': '  const avgSca =',
    'Comprador': '  const paisesDisponibles =', 'Tecnico': '  const stats =',
}

# Dependencias de los mappers y de los formularios de cada pantalla.
finca = ['rawCaficultores', 'rawFincas', 'rawLotes']
lote = finca + ['rawVariedades']
oferta = lote + ['rawPreofertas', 'rawSesionesCatacion']
muestra = oferta + ['rawEvaluacionesFisicas', 'rawLaboratorios']
contenedor = oferta + ['rawContenedores']
personas = ['rawUsuarios']
routes = {
 'SuperAdmin': {
  'users': personas,
  'caficultores': finca + personas + ['rawEmpresas'],
  'catadores': personas + ['rawCatadores', 'rawLaboratorios', 'rawSesionesCatacion'],
  'empresas': personas + ['rawEmpresas', 'rawCaficultores', 'rawPreofertas'],
  'tecnicos': personas + ['rawTecnicos', 'rawInspecciones'],
  'laboratorios': personas + ['rawLaboratorios', 'rawEvaluacionesFisicas', 'rawSesionesCatacion'],
  'brokers': personas + ['rawBrokers', 'rawPedidos'],
  'compradores': personas + ['rawCompradores', 'rawPedidos'],
  'fincas': lote,
  'ofertas': oferta,
  'muestras': muestra + personas,
  'contenedores': contenedor,
  'compras': contenedor + ['rawPedidos', 'rawCompradores', 'rawBrokers'],
  'blog': [], 'settings': [],
 },
 'Empresa': {
  'brokers': personas + ['rawBrokers', 'rawPedidos'],
  'caficultores': finca + personas + ['rawEmpresas'],
  'laboratorios': personas + ['rawLaboratorios', 'rawEvaluacionesFisicas', 'rawSesionesCatacion'],
  'tecnicos': personas + ['rawTecnicos', 'rawInspecciones'],
  'pre-ofertas': oferta,
  'ofertas-libres': oferta,
  'ofertas': contenedor + personas + ['rawTecnicos', 'rawInspecciones'],
  'muestras': muestra + personas,
  'contenedores': contenedor + personas + ['rawBrokers', 'rawPedidos'],
 },
 'Caficultor': {'fincas': finca, 'lotes': lote, 'pre-ofertas': oferta, 'ofertas': oferta},
 'Laboratorio': {
  'catadores': personas + ['rawCatadores', 'rawLaboratorios', 'rawSesionesCatacion'],
  'dashboard': muestra,
  'analisis-fisico': muestra,
  'muestras': muestra,
  'resultados': muestra,
  'analisis-sensorial': muestra + ['rawCatadores'],
  'hojas-catacion': muestra + ['rawCatadores'],
 },
}

def names_used(names, body):
    return [name for name in names if re.search(r'\b' + re.escape(name) + r'\b', body)]

def imports_for(original, body):
    imports = []
    for match in re.finditer(r'^import[\s\S]*?;\n', original, re.M):
        statement = match.group()
        if "from 'react'" in statement:
            continue
        if '{' in statement:
            names = [name.strip() for name in statement.split('{', 1)[1].split('}', 1)[0].split(',') if name.strip()]
            names = names_used(names, body)
            if not names:
                continue
            source = re.search(r"from '([^']+)'", statement).group(1)
            source = {'../lib/axios': '../../lib/axios', './mappers': '../mappers'}.get(source, source)
            imports.append(f"import {{ {', '.join(names)} }} from '{source}';")
        elif 'toast' in statement and re.search(r'\btoast\b', body):
            imports.append(statement.strip())
    return '\n'.join(imports)

def write(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding='utf-8', newline='\n')

for role in roles:
    path = root / f'{role}Context.jsx'
    original = path.read_text(encoding='utf-8')
    state_section = original[original.index(f'export const {role}Provider'):original.index('  const fetchAll =')]
    states = re.findall(r'  const \[(\w+), (\w+)\] = useState\(([\s\S]*?)\);', state_section)
    states = [(name, setter, initial) for name, setter, initial in states if name not in ('loading', 'error')]
    fields = [name for name, _, _ in states]
    setter_names = [setter for _, setter, _ in states]
    setter_fields = {setter: name for name, setter, _ in states}

    raw_section = re.search(r'const \[\s*\n([\s\S]*?)\] = await Promise.all\(\[([\s\S]*?)\]\);', original).groups()
    raw_names = [n.strip() for n in raw_section[0].split(',') if n.strip()]
    endpoints = re.findall(r"safeGet\('([^']+)'\)", raw_section[1])
    assert len(raw_names) == len(endpoints), role
    endpoint_map = dict(zip(raw_names, endpoints))

    start_mapping = original.index(']);', original.index('] = await Promise.all')) + 3
    end_mapping = original.index('    } catch (err)', start_mapping)
    mapping = original[start_mapping:end_mapping].strip('\n')
    assignments = re.findall(r'^      (set\w+)\((\w+)\);$', mapping, re.M)
    assert assignments, role
    mapping = re.sub(r'^      set\w+\(\w+\);\n?', '', mapping, flags=re.M).rstrip()
    mapping = '\n'.join(line[4:] if line.startswith('    ') else line for line in mapping.splitlines())
    returned = ',\n'.join(f'    {setter_fields[setter]}: {value}' for setter, value in assignments)
    map_body = f'export function select{role}Data({{ {", ".join(raw_names)} }}) {{\n{mapping}\n\n  return {{\n{returned},\n  }};\n}}\n'
    route_map = {}
    for route, sources in routes.get(role, {}).items():
        sources = sorted(set(sources))
        assert set(sources) <= set(raw_names), (role, route, sources)
        route_map[f'/{role.lower()}/{route}'] = sources

    initials = ',\n'.join(f'  {name}: {initial}' for name, _, initial in states)
    definition = f'''\nexport const {role[0].lower() + role[1:]}Data = {{
  createInitialState: () => ({{
{initials},
  }}),
  endpoints: {json.dumps(endpoint_map, indent=2)},
  routes: {json.dumps(route_map, indent=2)},
  allSources: {json.dumps(raw_names)},
  select: select{role}Data,
}};
'''
    folder = root / role.lower()
    write(folder / 'data.js', imports_for(original, map_body) + '\n\n' + map_body + definition)

    action_start = original.index('  }, [fetchAll]);') + len('  }, [fetchAll]);')
    return_start = original.index(f'  return (\n    <{role}Context.Provider')
    summary_start = original.index(summary_starts[role], action_start) if role in summary_starts else return_start
    action_body = original[action_start:summary_start].strip('\n')
    action_names = re.findall(r'^  const (\w+) =', action_body, re.M)
    # Los comentarios del siguiente bloque no pertenecen al módulo de operaciones.
    action_body = re.sub(r'\n\s*// ── DASHBOARD[^\n]*\s*$', '', action_body)
    used_fields = names_used(fields, action_body)
    used_setters = names_used(setter_names, action_body)
    action_function = f'export function create{role}Actions(state, setters) {{\n'
    if used_fields:
        action_function += f'  const {{ {", ".join(used_fields)} }} = state;\n'
    if used_setters:
        action_function += f'  const {{ {", ".join(used_setters)} }} = setters;\n'
    action_function += '\n' + action_body + f'\n\n  return {{ {", ".join(action_names)} }};\n}}\n'
    write(folder / 'actions.js', imports_for(original, action_body) + '\n\n' + action_function)

    summary_body = original[summary_start:return_start].rstrip()
    summary_names = re.findall(r'^  const (\w+) =', summary_body, re.M)
    summary_function = f'export function select{role}Summary(state) {{\n'
    used_fields = names_used(fields, summary_body)
    if used_fields:
        summary_function += f'  const {{ {", ".join(used_fields)} }} = state;\n'
    summary_function += summary_body + f'\n  return {{ {", ".join(summary_names)} }};\n}}\n'
    if summary_names:
        write(folder / 'summary.js', imports_for(original, summary_body) + '\n\n' + summary_function)

    # Mantener exactamente la API que consumen los hooks y páginas existentes.
    value_body = original.split('      value={{', 1)[1].split('      }}', 1)[0]
    value_lines = []
    for line in value_body.strip().splitlines():
        item = line.strip().rstrip(',')
        if not item:
            continue
        key, value = item.split(':', 1) if ':' in item else (item, item)
        key, value = key.strip(), value.strip()
        if value == 'fetchAll':
            value = 'refetch'
        elif value in fields:
            value = f'state.{value}'
        elif value in setter_names:
            value = f'setters.{value}'
        elif value in action_names:
            value = f'actions.{value}'
        elif value in summary_names:
            value = f'summary.{value}'
        value_lines.append(f'    {key}: {value},')

    prefix = role[0].lower() + role[1:]
    provider = f'''import {{ createContext, useMemo }} from 'react';
import {{ useRoleData }} from './shared/useRoleData';
import {{ {prefix}Data }} from './{role.lower()}/data';
import {{ create{role}Actions }} from './{role.lower()}/actions';
'''
    if summary_names:
        provider += f"import {{ select{role}Summary }} from './{role.lower()}/summary';\n"
    provider += f'''
export const {role}Context = createContext(null);

export const {role}Provider = ({{ children }}) => {{
  const {{ state, setters, loading, error, refetch }} = useRoleData({prefix}Data);
  const actions = useMemo(() => create{role}Actions(state, setters), [state, setters]);
'''
    if summary_names:
        provider += f'  const summary = useMemo(() => select{role}Summary(state), [state]);\n'
    deps = 'state, setters, actions, loading, error, refetch' + (', summary' if summary_names else '')
    provider += '  const value = useMemo(() => ({\n' + '\n'.join(value_lines) + f'\n  }}), [{deps}]);\n\n'
    provider += f'  return <{role}Context.Provider value={{value}}>{{children}}</{role}Context.Provider>;\n}};\n'
    write(path, provider)
    print(role, 'separado; rutas específicas:', len(route_map))
