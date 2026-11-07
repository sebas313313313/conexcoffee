import BaseRepository from '../../baseRepository.js';
import SesionCatacion from '../SesionCatacion.js';

class SesionCatacionRepository extends BaseRepository {
  constructor() {
    super(SesionCatacion);
  }

  async findByCodigo(codigo) {
    return await this.model.findOne({
      where: { codigo_sesion: codigo }
    });
  }

  async findByCodigoWithQrDetails(codigo) {
    return await this.model.findOne({
      where: { codigo_sesion: codigo },
      include: [{ association: 'empresa_creadora' }, { association: 'evaluacion_fisica' }]
    });
  }

  async findByEvaluacionFisicaId(evaluacionFisicaId) {
    return await this.model.findAll({
      where: { evaluacion_fisica_id: evaluacionFisicaId }
    });
  }

  async findWithDetails(id) {
    return await this.model.findByPk(id, {
      include: [
        { association: 'evaluacion_fisica' },
        {
          association: 'hojas',
          include: [{ association: 'catador' }]
        }
      ]
    });
  }
}

export default SesionCatacionRepository;
