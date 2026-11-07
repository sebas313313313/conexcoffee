import BaseRepository from '../../baseRepository.js';
import TransaccionPago from '../TransaccionPago.js';

class TransaccionPagoRepository extends BaseRepository {
  constructor() {
    super(TransaccionPago);
  }

  async findByExternalReference(referencia) {
    return await this.model.findOne({
      where: { identificador_transaccion_externo: referencia },
    });
  }

  async findByPedidoId(pedidoId) {
    return await this.model.findAll({
      where: { pedido_id: pedidoId },
      order: [['fecha_transaccion', 'DESC']],
    });
  }
}

export default TransaccionPagoRepository;

