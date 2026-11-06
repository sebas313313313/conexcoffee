import BaseController from '../../baseController.js';
import TrazabilidadEscaneoRepository from '../repository/TrazabilidadEscaneoRepository.js';
import TrazabilidadEscaneoService from '../services/TrazabilidadEscaneoService.js';

class TrazabilidadEscaneoController extends BaseController {
  constructor(service = new TrazabilidadEscaneoService(new TrazabilidadEscaneoRepository())) {
    super(service);
  }

  obtenerTrazabilidadPublica = (req, res) =>
    this.execute(res, async () => {
      const { tokenQrExterno } = req.params;
      const metaInfo = {
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        latitud: req.query.latitud ? parseFloat(req.query.latitud) : null,
        longitud: req.query.longitud ? parseFloat(req.query.longitud) : null
      };

      return await this.service.obtenerTrazabilidadPublica(tokenQrExterno, metaInfo);
    });

  obtenerTrazabilidadTecnica = (req, res) =>
    this.execute(res, async () => {
      const { tokenQrExterno } = req.params;
      return await this.service.obtenerFlujo(tokenQrExterno, req.user);
    });
}

export default TrazabilidadEscaneoController;
