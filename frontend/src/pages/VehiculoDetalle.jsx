import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Settings, 
  Fuel, 
  FileText, 
  MapPin,
  Phone,
  CreditCard,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FinancingCalculator from '@/components/FinancingCalculator';
import ReservationModal from '@/components/ReservationModal';
import { getVehicle, formatCurrency } from '@/lib/api';

const WHATSAPP_NUMBER = "9991524005";

export default function VehiculoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reservationModalOpen, setReservationModalOpen] = useState(false);

  useEffect(() => {
    loadVehicle();
  }, [id]);

  const loadVehicle = async () => {
    try {
      const data = await getVehicle(id);
      setVehicle(data);
    } catch (error) {
      console.error('Error loading vehicle:', error);
      navigate('/catalogo');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!vehicle) return null;

  const getStatusBadge = () => {
    if (vehicle.reservado) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-sm">Apartado</Badge>;
    }
    if (!vehicle.disponible) {
      return <Badge className="bg-red-100 text-red-800 border-red-200 text-sm">Vendido</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800 border-green-200 text-sm">Disponible</Badge>;
  };

  const whatsappMessage = `Hola, me interesa el ${vehicle.year} ${vehicle.marca} ${vehicle.modelo}. ¿Podrían darme más información?`;

  return (
    <div className="section-padding" data-testid="vehiculo-detalle-page">
      <div className="container-custom">
        {/* Back Button */}
        <Link 
          to="/catalogo" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          data-testid="back-to-catalogo"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Section */}
          <div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
              <img
                src={vehicle.imagen_url || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800'}
                alt={`${vehicle.marca} ${vehicle.modelo}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                {getStatusBadge()}
              </div>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <Calendar className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Año</p>
                <p className="font-bold">{vehicle.year}</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <Settings className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Transmisión</p>
                <p className="font-bold text-sm">{vehicle.transmision}</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <Fuel className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Motor</p>
                <p className="font-bold">{vehicle.motor}L</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <FileText className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Documentos</p>
                <p className="font-bold text-sm">{vehicle.documentacion}</p>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div>
            <div className="mb-6">
              <p className="text-primary font-medium mb-1">{vehicle.marca}</p>
              <h1 className="font-heading font-black text-3xl md:text-4xl mb-4">
                {vehicle.modelo}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <span 
                  className="h-4 w-4 rounded-full border" 
                  style={{ backgroundColor: vehicle.color.toLowerCase() }}
                />
                Color: {vehicle.color} | PIN: {vehicle.pin}
              </p>
            </div>

            {/* Price */}
            <div className="bg-muted/50 rounded-2xl p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <p className="text-muted-foreground mb-1">Precio</p>
                  <p className="text-4xl font-black text-primary" data-testid="vehicle-price">
                    {formatCurrency(vehicle.precio_facebook)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground mb-1">Desde</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(vehicle.pago_mensual)}<span className="text-base font-normal text-muted-foreground">/mes</span>
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm">
                  <span className="text-muted-foreground">Anticipo mínimo: </span>
                  <span className="font-bold">{formatCurrency(vehicle.anticipo_minimo)}</span>
                  <span className="text-muted-foreground"> ({((vehicle.anticipo_minimo / vehicle.precio_facebook) * 100).toFixed(0)}%)</span>
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button 
                className="btn-primary flex-1"
                onClick={() => setReservationModalOpen(true)}
                disabled={vehicle.reservado || !vehicle.disponible}
                data-testid="btn-apartar"
              >
                <CreditCard className="mr-2 h-5 w-5" />
                {vehicle.reservado ? 'Ya Apartado' : 'Apartar Vehículo'}
              </Button>
              <a 
                href={`https://wa.me/52${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="outline" className="w-full h-12" data-testid="btn-whatsapp">
                  <Phone className="mr-2 h-5 w-5" />
                  WhatsApp
                </Button>
              </a>
            </div>

            {/* Apartado Info */}
            {!vehicle.reservado && vehicle.disponible && (
              <div className="bg-accent rounded-xl p-4 mb-6 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-accent-foreground">Aparta con solo $1,000 MXN por día</p>
                  <p className="text-sm text-muted-foreground">
                    Máximo 5 días. Tu apartado se confirma al realizar el pago.
                  </p>
                </div>
              </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="calculator" className="w-full">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="calculator" className="flex-1" data-testid="tab-calculator">
                  Cotizador
                </TabsTrigger>
                <TabsTrigger value="credit" className="flex-1" data-testid="tab-credit">
                  Solicitar Crédito
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="calculator">
                <FinancingCalculator
                  vehiclePrice={vehicle.precio_facebook}
                  minDownPayment={vehicle.anticipo_minimo}
                />
              </TabsContent>
              
              <TabsContent value="credit">
                <div className="calculator-wrapper text-center">
                  <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-heading font-bold text-xl mb-2">
                    Solicita tu Crédito
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Completa nuestra solicitud de crédito y recibe respuesta en menos de 24 horas.
                  </p>
                  <Link to={`/solicitud-credito/${vehicle.id}`}>
                    <Button className="btn-primary" data-testid="btn-solicitar-credito">
                      Iniciar Solicitud
                    </Button>
                  </Link>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Reservation Modal */}
      <ReservationModal
        open={reservationModalOpen}
        onOpenChange={setReservationModalOpen}
        vehicle={vehicle}
      />
    </div>
  );
}
