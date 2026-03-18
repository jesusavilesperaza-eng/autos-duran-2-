import { Outlet, Link, useLocation } from 'react-router-dom';
import { Phone, Facebook, MapPin, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_3651b5ef-813f-4740-b776-2929f50f6f78/artifacts/xqk0140e_descarga.png";
const WHATSAPP_NUMBER = "9991524005";
const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=100063566079495";

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/solicitud-credito', label: 'Solicitar Crédito' },
];

export default function Layout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
              <img src={LOGO_URL} alt="Autos Durán" className="h-10 md:h-12 w-auto" />
              <span className="font-heading font-black text-xl md:text-2xl tracking-tight">
                AUTOS DURÁN
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  data-testid={`nav-${link.label.toLowerCase().replace(' ', '-')}`}
                  className={`font-medium transition-colors hover:text-primary ${
                    isActive(link.href) ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-4">
              <a
                href={`https://wa.me/52${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="whatsapp-header-btn"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4" />
                {WHATSAPP_NUMBER}
              </a>
              <Link to="/catalogo">
                <Button className="btn-primary" data-testid="ver-autos-btn">
                  Ver Autos
                </Button>
              </Link>
            </div>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" data-testid="mobile-menu-btn">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-6 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-lg font-medium transition-colors ${
                        isActive(link.href) ? 'text-primary' : 'text-foreground'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <hr className="border-border" />
                  <a
                    href={`https://wa.me/52${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <Phone className="h-5 w-5" />
                    {WHATSAPP_NUMBER}
                  </a>
                  <Link to="/catalogo" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="btn-primary w-full">
                      Ver Autos
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-white">
        <div className="container-custom py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={LOGO_URL} alt="Autos Durán" className="h-10 w-auto invert" />
                <span className="font-heading font-black text-xl">AUTOS DURÁN</span>
              </div>
              <p className="text-white/70 mb-4">
                Tu mejor opción en autos seminuevos con financiamiento accesible en Yucatán.
              </p>
              <div className="flex gap-4">
                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="facebook-footer-link"
                  className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href={`https://wa.me/52${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="whatsapp-footer-link"
                  className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                >
                  <Phone className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-heading font-bold text-lg mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/catalogo" className="text-white/70 hover:text-white transition-colors">
                    Catálogo de Autos
                  </Link>
                </li>
                <li>
                  <Link to="/solicitud-credito" className="text-white/70 hover:text-white transition-colors">
                    Solicitar Crédito
                  </Link>
                </li>
              </ul>
            </div>

            {/* Sucursales */}
            <div>
              <h4 className="font-heading font-bold text-lg mb-4">Sucursales</h4>
              <ul className="space-y-4">
                <li className="flex gap-2">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Av. Yucatán</p>
                    <p className="text-white/70 text-sm">Mérida, Yucatán</p>
                  </div>
                </li>
                <li className="flex gap-2">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Mérida 2000</p>
                    <p className="text-white/70 text-sm">Mérida, Yucatán</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/50 text-sm">
            <p>© {new Date().getFullYear()} Autos Durán. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Float Button */}
      <a
        href={`https://wa.me/52${WHATSAPP_NUMBER}?text=Hola,%20me%20interesa%20información%20sobre%20sus%20autos`}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="whatsapp-float-btn"
        className="whatsapp-float bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
}
