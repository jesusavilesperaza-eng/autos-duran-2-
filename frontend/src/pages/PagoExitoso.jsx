import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Loader2, AlertCircle, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCheckoutStatus } from '@/lib/api';

export default function PagoExitoso() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState('loading');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (sessionId) {
      pollPaymentStatus();
    } else {
      setStatus('error');
    }
  }, [sessionId]);

  const pollPaymentStatus = async () => {
    const maxAttempts = 5;
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      setStatus('timeout');
      return;
    }

    try {
      const data = await getCheckoutStatus(sessionId);
      
      if (data.payment_status === 'paid') {
        setStatus('success');
        return;
      } else if (data.status === 'expired') {
        setStatus('expired');
        return;
      }

      // Continue polling
      setAttempts(prev => prev + 1);
      setTimeout(pollPaymentStatus, pollInterval);
    } catch (error) {
      console.error('Error checking payment status:', error);
      setStatus('error');
    }
  };

  return (
    <div className="section-padding" data-testid="pago-exitoso-page">
      <div className="container-custom max-w-lg">
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 text-primary mx-auto mb-6 animate-spin" />
              <h1 className="font-heading font-bold text-2xl mb-2">
                Verificando pago...
              </h1>
              <p className="text-muted-foreground">
                Por favor espera mientras confirmamos tu pago.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="font-heading font-bold text-2xl mb-2">
                ¡Pago Exitoso!
              </h1>
              <p className="text-muted-foreground mb-6">
                Tu apartado ha sido confirmado. El vehículo está reservado para ti. 
                Nos pondremos en contacto contigo pronto.
              </p>
              <div className="bg-muted/50 rounded-xl p-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  Recibirás un correo de confirmación con los detalles de tu reservación.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/catalogo" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Car className="mr-2 h-4 w-4" />
                    Ver más autos
                  </Button>
                </Link>
                <Link to="/" className="flex-1">
                  <Button className="w-full btn-primary">
                    Volver al inicio
                  </Button>
                </Link>
              </div>
            </>
          )}

          {status === 'expired' && (
            <>
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-10 w-10 text-yellow-600" />
              </div>
              <h1 className="font-heading font-bold text-2xl mb-2">
                Sesión Expirada
              </h1>
              <p className="text-muted-foreground mb-6">
                La sesión de pago ha expirado. Por favor intenta nuevamente.
              </p>
              <Link to="/catalogo">
                <Button className="btn-primary">
                  Volver al catálogo
                </Button>
              </Link>
            </>
          )}

          {(status === 'error' || status === 'timeout') && (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
              <h1 className="font-heading font-bold text-2xl mb-2">
                Error de Verificación
              </h1>
              <p className="text-muted-foreground mb-6">
                No pudimos verificar tu pago. Si el cargo fue realizado, 
                por favor contáctanos para confirmar tu reservación.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a 
                  href="https://wa.me/529991524005?text=Hola,%20realicé%20un%20pago%20de%20apartado%20y%20necesito%20confirmación"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full">
                    Contactar por WhatsApp
                  </Button>
                </a>
                <Link to="/" className="flex-1">
                  <Button className="w-full btn-primary">
                    Volver al inicio
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
