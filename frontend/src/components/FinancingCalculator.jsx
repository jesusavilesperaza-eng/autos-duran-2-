import { useState, useEffect } from 'react';
import { Calculator, Info } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { calculateFinancing, formatCurrency } from '@/lib/api';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function FinancingCalculator({ 
  vehiclePrice, 
  minDownPayment,
  onCalculationComplete 
}) {
  const [anticipo, setAnticipo] = useState(minDownPayment || vehiclePrice * 0.4);
  const [plazo, setPlazo] = useState(12);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const minAnticipo = minDownPayment || vehiclePrice * 0.4;
  const maxAnticipo = vehiclePrice * 0.9;

  useEffect(() => {
    const timer = setTimeout(() => {
      handleCalculate();
    }, 300);
    return () => clearTimeout(timer);
  }, [anticipo, plazo, vehiclePrice]);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const data = await calculateFinancing({
        precio_vehiculo: vehiclePrice,
        anticipo: anticipo,
        plazo_meses: plazo,
      });
      setResult(data);
      if (onCalculationComplete) {
        onCalculationComplete(data);
      }
    } catch (error) {
      console.error('Error calculating financing:', error);
    } finally {
      setLoading(false);
    }
  };

  const anticipoPercentage = ((anticipo / vehiclePrice) * 100).toFixed(0);

  return (
    <div className="calculator-wrapper" data-testid="financing-calculator">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-6 w-6 text-primary" />
        <h3 className="font-heading font-bold text-xl">Cotizador de Financiamiento</h3>
      </div>

      {/* Anticipo Slider */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <label className="font-medium">Anticipo</label>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-primary">
              {formatCurrency(anticipo)}
            </span>
            <span className="text-sm text-muted-foreground">
              ({anticipoPercentage}%)
            </span>
          </div>
        </div>
        <Slider
          value={[anticipo]}
          onValueChange={(value) => setAnticipo(value[0])}
          min={minAnticipo}
          max={maxAnticipo}
          step={1000}
          className="py-4"
          data-testid="anticipo-slider"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Mín: {formatCurrency(minAnticipo)}</span>
          <span>Máx: {formatCurrency(maxAnticipo)}</span>
        </div>
      </div>

      {/* Plazo Selector */}
      <div className="mb-8">
        <label className="font-medium mb-3 block">Plazo (meses)</label>
        <div className="grid grid-cols-4 gap-2">
          {[6, 12, 18, 24].map((months) => (
            <Button
              key={months}
              variant={plazo === months ? 'default' : 'outline'}
              onClick={() => setPlazo(months)}
              data-testid={`plazo-${months}`}
              className={plazo === months ? 'bg-primary' : ''}
            >
              {months}
            </Button>
          ))}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-muted/50 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-border">
            <span className="text-muted-foreground">Pago Mensual</span>
            <span className="result-display" data-testid="pago-mensual">
              {formatCurrency(result.pago_mensual)}
            </span>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monto a Financiar</span>
              <span className="font-semibold">{formatCurrency(result.monto_financiar)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total a Pagar</span>
              <span className="font-semibold">{formatCurrency(result.total_a_pagar)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                Tasa de Interés
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Interés mensual fijo</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
              <span className="font-semibold">{result.tasa_mensual}% mensual</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Interés Total</span>
              <span className="font-semibold">{formatCurrency(result.interes_total)}</span>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-4 text-center">
        * Cotización informativa. Sujeta a aprobación de crédito.
      </p>
    </div>
  );
}
