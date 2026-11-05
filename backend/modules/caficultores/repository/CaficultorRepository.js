import BaseRepository from '../../baseRepository.js';
import Caficultor from '../Caficultor.js';
import { sequelize } from '../../../config/database.js';

class CaficultorRepository extends BaseRepository {
  constructor() {
    super(Caficultor);
  }

  async existeEmpresa(id, options = {}) {
    const [rows] = await sequelize.query(
      'SELECT id FROM personas.empresas_exportadoras WHERE id = :id',
      { replacements: { id }, transaction: options.transaction }
    );
    return rows.length > 0;
  }

  async findByUsuarioId(usuarioId) {
    return await this.model.findOne({
      where: { usuario_id: usuarioId }
    });
  }

  async findByNumeroDocumento(numeroDocumento) {
    return await this.model.findOne({
      where: { numero_documento: numeroDocumento }
    });
  }
}

export default CaficultorRepository;
