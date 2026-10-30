import { useState } from 'react';
import ContactHero from '../components/ContactHero';
import ContactBannerCaficultor from '../components/ContactBannerCaficultor';
import ContactCanales from '../components/ContactCanales';
import ContactFaq from '../components/ContactFaq';
import ContactForm from '../components/ContactForm';
import ContactTecnicafe from '../components/ContactTecnicafe';
import EmpresasRegionalesModal from '../components/EmpresasRegionalesModal';

// ============================================
// ContactPage — Página Oficial de Contáctanos & PQRS
// ============================================

export default function ContactPage() {
  const [isEmpresasModalOpen, setIsEmpresasModalOpen] = useState(false);

  return (
    <div className="bg-surface-50 text-surface-900 min-h-screen">
      {/* 1. Hero Cabecera con Imagen Oficial y Efectos Anime.js */}
      <ContactHero />

      {/* 2. Cinta de Primer Plano: Atención al Caficultor */}
      <ContactBannerCaficultor onOpenModal={() => setIsEmpresasModalOpen(true)} />

      {/* 3. Tarjetas de Contacto Directo (3 Canales Oficiales) */}
      <ContactCanales />

      {/* 4. Sección Principal: Preguntas Frecuentes (FAQ) + Formulario */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          <ContactFaq />
          <ContactForm onOpenEmpresasModal={() => setIsEmpresasModalOpen(true)} />
        </div>
      </section>

      {/* 5. Sede Tecnicafé Institucional */}
      <ContactTecnicafe />

      {/* 6. Modal de Empresas Regionales & Formulario de Cosecha */}
      <EmpresasRegionalesModal
        isOpen={isEmpresasModalOpen}
        onClose={() => setIsEmpresasModalOpen(false)}
      />
    </div>
  );
}
