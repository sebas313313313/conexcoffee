import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Coffee, MapPin, Ship } from 'lucide-react';

const DESTINOS_INFO = {
  'estados-unidos': {
    nombre: 'Estados Unidos',
    codigo: 'US',
    descripcion: 'Mercado norteamericano - Tostadores especializados',
    puertos: 'Miami, Long Beach, New York',
  },
  'arabia-saudita': {
    nombre: 'Arabia Saudita',
    codigo: 'SA',
    descripcion: 'Mercado del Golfo - Alta demanda de cafés especiales',
    puertos: 'Jeddah, Dammam',
  },
  'argentina': {
    nombre: 'Argentina',
    codigo: 'AR',
    descripcion: 'Mercado sudamericano - Creciente interés en specialty coffee',
    puertos: 'Buenos Aires, Rosario',
  },
};

export default function DestinoCompraPage() {
  const { paisId } = useParams();
  const navigate = useNavigate();
  const info = DESTINOS_INFO[paisId];

  if (!info) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-surface-900 mb-4">Destino no encontrado</h1>
          <Link to="/destinos" className="text-brand-orange hover:underline">
            Volver a destinos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <section className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate('/destinos')}
            className="flex items-center gap-2 text-surface-600 hover:text-brand-orange mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a destinos</span>
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
            <div className="bg-gradient-to-r from-brand-terracota to-brand-orange px-6 sm:px-10 py-8 text-white">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="h-6 w-6" />
                <h1 className="text-3xl sm:text-4xl font-extrabold">{info.nombre}</h1>
              </div>
              <p className="text-white/90 text-lg">{info.descripcion}</p>
            </div>

            <div className="p-6 sm:p-10">
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-brand-tint border border-brand-orange/20">
                  <Ship className="h-5 w-5 text-brand-orange mt-0.5" />
                  <div>
                    <div className="font-bold text-surface-900 mb-1">Puertos de destino</div>
                    <div className="text-surface-600 text-sm">{info.puertos}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-50 border border-surface-200">
                  <Coffee className="h-5 w-5 text-brand-terracota mt-0.5" />
                  <div>
                    <div className="font-bold text-surface-900 mb-1">Café de especialidad</div>
                    <div className="text-surface-600 text-sm">Lotes colombianos certificados SCA</div>
                  </div>
                </div>
              </div>

              <div className="text-center py-12 border-2 border-dashed border-surface-200 rounded-xl">
                <Coffee className="h-12 w-12 text-surface-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-surface-900 mb-2">
                  Catálogo en preparación
                </h2>
                <p className="text-surface-600 mb-6 max-w-md mx-auto">
                  Próximamente podrás ver y comprar los lotes de café asignados a {info.nombre}.
                  Regístrate para recibir notificaciones cuando estén disponibles.
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-terracota hover:bg-brand-terracota-dark text-white font-bold transition-colors"
                >
                  Registrarse para comprar
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
