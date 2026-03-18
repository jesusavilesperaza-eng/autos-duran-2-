import { useState } from 'react';
import { Calendar, CreditCard, User, Phone, Mail, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createReservation, createCheckoutSession, formatCurrency } from '@/lib/api';
import { toast } from 'sonner';

const PRICE_PER_DAY = 1000;

export default function ReservationModal({ open, onOpenChange, vehicle }) {
  const [step, setStep] = useState(1);
  const [days, setDays] = useState(1);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
  });
  const [loading, setLoading] = useState(false);
  const [reservationId, setReservationId] = useState(null);

  const totalAmount = days * PRICE_PER_DAY;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitInfo = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const reservation = await createReservation({
        vehicle_id: vehicle.id,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email,
        days: days,
      });

      setReservationId(reservation.id);
      setStep(2);
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error(error.response?.data?.detail || 'Error al crear la reservación');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!reservationId) return;
    setLoading(true);

    try {
      const checkout = await createCheckoutSession(reservationId);
      if (checkout.url) {
        window.location.href = checkout.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error(error.response?.data?.detail || 'Error al procesar el pago');
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setDays(1);
    setFormData({ customer_name: '', customer_phone: '', customer_email: '' });
    setReservationId(null);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetModal();
    }}>
      <DialogContent className="sm:max-w-md" data-testid="reservation-modal">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {step === 1 ? 'Apartar Vehículo' : 'Confirmar Pago'}
          </DialogTitle>
          <DialogDescription>
            {vehicle?.marca} {vehicle?.modelo} {vehicle?.year}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <form onSubmit={handleSubmitInfo} className="space-y-6">
            {/* Days Selection */}
            <div>
              <Label className="mb-3 block">¿Cuántos días deseas apartarlo?</Label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((d) => (
                  <Button
                    key={d}
                    type="button"
                    variant={days === d ? 'default' : 'outline'}
                    onClick={() => setDays(d)}
                    data-testid={`days-${d}`}
                    className={days === d ? 'bg-primary' : ''}
                  >
                    {d}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatCurrency(PRICE_PER_DAY)} por día = <span className="font-bold text-primary">{formatCurrency(totalAmount)}</span> total
              </p>
            </div>

            {/* Customer Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="customer_name">Nombre Completo</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="customer_name"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    placeholder="Tu nombre completo"
                    className="pl-10"
                    required
                    data-testid="input-customer-name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="customer_phone">Teléfono / WhatsApp</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="customer_phone"
                    name="customer_phone"
                    type="tel"
                    value={formData.customer_phone}
                    onChange={handleInputChange}
                    placeholder="999 123 4567"
                    className="pl-10"
                    required
                    data-testid="input-customer-phone"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="customer_email">Correo Electrónico</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="customer_email"
                    name="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={handleInputChange}
                    placeholder="tu@email.com"
                    className="pl-10"
                    required
                    data-testid="input-customer-email"
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full btn-primary" 
              disabled={loading}
              data-testid="btn-continue-reservation"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Continuar al Pago'
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Días de apartado</span>
                <span className="font-medium">{days} día(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Precio por día</span>
                <span className="font-medium">{formatCurrency(PRICE_PER_DAY)}</span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total a Pagar</span>
                <span className="font-black text-primary">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <div className="bg-accent rounded-xl p-4">
              <p className="text-sm text-accent-foreground">
                <CreditCard className="h-4 w-4 inline mr-2" />
                Serás redirigido a Stripe para completar el pago de forma segura.
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Volver
              </Button>
              <Button 
                onClick={handlePayment}
                className="flex-1 btn-primary"
                disabled={loading}
                data-testid="btn-pay-reservation"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pagar {formatCurrency(totalAmount)}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
