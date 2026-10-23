// ============================================
// Barrel exports — features/laboratorio
// ============================================

export { default as LaboratorioDashboardPage        } from './pages/LaboratorioDashboardPage';
export { default as LaboratorioCatadoresPage        } from './pages/LaboratorioCatadoresPage';
export { default as LaboratorioAnalisisFisicoPage    } from './pages/LaboratorioAnalisisFisicoPage';
export { default as LaboratorioAnalisisSensorialPage } from './pages/LaboratorioAnalisisSensorialPage';
export { default as LaboratorioResultadosPage       } from './pages/LaboratorioResultadosPage';
export { default as LaboratorioHojasCatacionPage    } from './pages/LaboratorioHojasCatacionPage';
export { default as LaboratorioMuestrasPage         } from './pages/LaboratorioMuestrasPage';

export { default as LaboratorioContext, LaboratorioProvider, useLaboratorio } from './context/LaboratorioContext';
export * from './api/laboratorioApi';
