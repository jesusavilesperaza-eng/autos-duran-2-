import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Car, CreditCard, ShieldCheck, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VehicleCard from '@/components/VehicleCard';
import { getVehicles, formatCurrency, setupAdmin, seedVehicles } from '@/lib/api';

const HERO_IMAGE = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80";

const features = [
  {
    icon: CreditCard,
    title: 'Financiamiento Accesible',
    description: 'Solo 1.4% de interés mensual con anticipo desde el 40%',
  },
  {
    icon: ShieldCheck,
    title: 'Autos Garantizados',
    description: 'Todos nuestros vehículos pasan por inspección de calidad',
  },
  {
    icon: Clock,
    title: 'Aparta en Minutos',
    description: 'Aparta tu auto con solo $1,000 MXN por día',
  },
];

export default function Home() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicles();
    // Initialize admin and seed data if needed
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      await setupAdmin();
    } catch (error) {
      // Admin might already exist
    }
  };

  const loadVehicles = async () => {
    try {
      const data = await getVehicles({ disponible: true });
      setVehicles(data.slice(0, 6)); // Show only first 6
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center" data-testid="hero-section">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        >
          <div className="hero-overlay absolute inset-0" />
        </div>
        
        <div className="container-custom relative z-10 py-20">
          <div className="max-w-2xl">
            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-6 animate-slide-up">
              Tu próximo auto<br />
              <span className="text-primary">está aquí</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-8 animate-fade-in">
              Financiamiento accesible con solo el 40% de anticipo y 1.4% de interés mensual. 
              Aparta tu auto desde $1,000 MXN.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
              <Link to="/catalogo">
                <Button className="btn-primary text-lg px-10" data-testid="hero-ver-autos-btn">
                  Ver Autos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/solicitud-credito">
                <Button variant="outline" className="btn-secondary text-lg px-10 bg-white/10 text-white border-white/30 hover:bg-white hover:text-foreground">
                  Solicitar Crédito
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-muted/30" data-testid="features-section">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="card-feature"
                  data-testid={`feature-${index}`}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-xl mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="section-padding" data-testid="featured-vehicles">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-2">
                Vehículos Destacados
              </h2>
              <p className="text-muted-foreground text-lg">
                Encuentra el auto perfecto para ti
              </p>
            </div>
            <Link to="/catalogo">
              <Button variant="ghost" className="text-primary hover:text-primary/80" data-testid="ver-todos-btn">
                Ver todos
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-muted animate-pulse rounded-xl h-96" />
              ))}
            </div>
          ) : vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                No hay vehículos disponibles en este momento
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-foreground text-white" data-testid="cta-section">
        <div className="container-custom text-center">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">
            ¿Listo para tu nuevo auto?
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
            Solicita tu crédito en línea y recibe respuesta en menos de 24 horas. 
            ¡El proceso es rápido y sencillo!
          </p>
          <Link to="/solicitud-credito">
            <Button className="btn-primary text-lg px-10" data-testid="cta-solicitar-btn">
              Solicitar Crédito Ahora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
