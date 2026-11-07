import BaseController from '../../baseController.js';
import SesionCatacionRepository from '../repository/SesionCatacionRepository.js';
import SesionCatacionService from '../services/SesionCatacionService.js';

class SesionCatacionController extends BaseController {
  constructor(service = new SesionCatacionService(new SesionCatacionRepository())) {
    super(service);
  }

  getWithDetails = (req, res) =>
    this.execute(res, async () => {
      const { id } = req.params;
      return await this.service.getWithDetails(id);
    });

  create = (req, res) =>
    this.execute(res, async () => this.service.createForUser(req.body, req.user), 201);

  getAll = (req, res) =>
    this.execute(res, async () => this.service.getAllForUser(req.query, req.user));

  getByCodigo = (req, res) =>
    this.execute(res, async () => {
      const { codigo } = req.params;
      const sesion = await this.service.repository.findByCodigo(codigo);
      if (!sesion) {
        return null;
      }
      return sesion;
    });

  getQrPreview = (req, res) =>
    this.execute(res, async () => this.service.getQrPreview(req.params.codigo));

  assignFromQr = (req, res) =>
    this.execute(res, async () => this.service.assignFromQr(req.params.codigo, req.user.id));

  getQrPayload = (req, res) =>
    this.execute(res, async () => this.service.createQrPayload(req.params.id, req.user));
}

export default SesionCatacionController;
