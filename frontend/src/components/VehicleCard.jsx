import { Link } from 'react-router-dom';
import { Calendar, Fuel, Settings, MapPin, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/api';

const WHATSAPP_NUMBER = "9991524005";

export default function VehicleCard({ vehicle }) {
  const {
    id,
    marca,
    modelo,
    year,
    transmision,
    color,
    precio_facebook,
    anticipo_minimo,
    pago_mensual,
    imagen_url,
    disponible,
    reservado,
  } = vehicle;

  const getStatusBadge = () => {
    if (reservado) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Apartado</Badge>;
    }
    if (!disponible) {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Vendido</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800 border-green-200">Disponible</Badge>;
  };

  return (
    <div className="card-vehicle" data-testid={`vehicle-card-${id}`}>
      {/* Image */}
      <div className="vehicle-image-container relative aspect-[16/10]">
        <img
          src={imagen_url || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800'}
          alt={`${marca} ${modelo}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          {getStatusBadge()}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="font-heading font-bold text-lg mb-1 line-clamp-1">
          {marca} {modelo}
        </h3>

        {/* Specs */}
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {year}
          </span>
          <span className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            {transmision}
          </span>
          <span className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full border border-current" style={{ backgroundColor: color.toLowerCase() }} />
            {color}
          </span>
        </div>

        {/* Price */}
        <div className="mb-4">
          <p className="text-2xl font-black text-primary">
            {formatCurrency(precio_facebook)}
          </p>
          <p className="text-sm text-muted-foreground">
            Desde {formatCurrency(pago_mensual)}/mes
          </p>
        </div>

        {/* Anticipo */}
        <div className="bg-muted/50 rounded-lg p-3 mb-4">
          <p className="text-sm">
            <span className="text-muted-foreground">Anticipo mínimo:</span>{' '}
            <span className="font-bold">{formatCurrency(anticipo_minimo)}</span>
          </p>
        </div>

        {/* CTAs */}
        <div className="flex gap-2">
          <Link to={`/vehiculo/${id}`} className="flex-1">
            <Button 
              className="w-full btn-primary" 
              data-testid={`ver-detalles-${id}`}
              disabled={!disponible && !reservado}
            >
              Ver Detalles
            </Button>
          </Link>
          <a
            href={`https://wa.me/52${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola, me interesa el ${year} ${marca} ${modelo} a ${formatCurrency(precio_facebook)}. ¿Está disponible?`)}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid={`whatsapp-${id}`}
          >
            <Button 
              variant="outline" 
              size="icon"
              className="h-12 w-12 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
