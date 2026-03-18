import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { 
  LayoutDashboard, 
  Car, 
  FileText, 
  Calendar, 
  LogOut,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_3651b5ef-813f-4740-b776-2929f50f6f78/artifacts/xqk0140e_descarga.png";

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/vehiculos', label: 'Vehículos', icon: Car },
  { href: '/admin/solicitudes', label: 'Solicitudes', icon: FileText },
  { href: '/admin/reservaciones', label: 'Reservaciones', icon: Calendar },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const NavLinks = ({ onClick }) => (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={onClick}
            data-testid={`admin-nav-${item.label.toLowerCase()}`}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              isActive(item.href)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-border flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link to="/admin" className="flex items-center gap-2">
            <img src={LOGO_URL} alt="Autos Durán" className="h-8 w-auto" />
            <span className="font-heading font-bold text-lg">Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <NavLinks />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={handleLogout}
            data-testid="admin-logout-btn"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Cerrar Sesión
          </Button>
          <Link to="/" className="block mt-2">
            <Button variant="outline" className="w-full">
              Ver Sitio
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ml-64">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-50 bg-white border-b border-border">
          <div className="flex items-center justify-between h-16 px-4">
            <Link to="/admin" className="flex items-center gap-2">
              <img src={LOGO_URL} alt="Autos Durán" className="h-8 w-auto" />
              <span className="font-heading font-bold">Admin</span>
            </Link>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="admin-mobile-menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="p-6 border-b border-border">
                  <span className="font-heading font-bold text-lg">Panel Admin</span>
                </div>
                <div className="p-4">
                  <NavLinks onClick={() => {}} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start text-muted-foreground"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Cerrar Sesión
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
