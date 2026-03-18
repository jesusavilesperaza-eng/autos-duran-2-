import { useState, useEffect } from 'react';
import { Calculator, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { calculateFinancing, formatCurrency } from '@/lib/api';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export default function FinancingCalculator({ 
  vehiclePrice, 
  minDownPayment,
  vehicleName,
  onCalculationComplete 
}) {
  const [anticipo, setAnticipo] = useState(minDownPayment || vehiclePrice * 0.4);
  const [anticipoInput, setAnticipoInput] = useState(String(minDownPayment || vehiclePrice * 0.4));
  const [plazo, setPlazo] = useState(12);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLetrasAdelantadas, setShowLetrasAdelantadas] = useState(false);

  const minAnticipo = minDownPayment || vehiclePrice * 0.4;
  const maxAnticipo = vehiclePrice * 0.9;

  useEffect(() => {
    setAnticipo(minDownPayment || vehiclePrice * 0.4);
    setAnticipoInput(String(minDownPayment || vehiclePrice * 0.4));
  }, [minDownPayment, vehiclePrice]);

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

  const handleSliderChange = (value) => {
    const newValue = value[0];
    setAnticipo(newValue);
    setAnticipoInput(String(newValue));
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAnticipoInput(value);
    
    const numValue = parseInt(value) || 0;
    if (numValue >= minAnticipo && numValue <= maxAnticipo) {
      setAnticipo(numValue);
    }
  };

  const handleInputBlur = () => {
    let numValue = parseInt(anticipoInput) || minAnticipo;
    if (numValue < minAnticipo) numValue = minAnticipo;
    if (numValue > maxAnticipo) numValue = maxAnticipo;
    setAnticipo(numValue);
    setAnticipoInput(String(numValue));
  };

  const anticipoPercentage = ((anticipo / vehiclePrice) * 100).toFixed(0);

  return (
    <div className="calculator-wrapper" data-testid="financing-calculator">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-6 w-6 text-primary" />
        <h3 className="font-heading font-bold text-xl">Cotizador de Financiamiento</h3>
      </div>

      {/* Vehicle Info */}
      {vehicleName && (
        <div className="bg-muted/50 rounded-lg p-3 mb-6">
          <p className="text-sm text-muted-foreground">Vehículo:</p>
          <p className="font-bold">{vehicleName}</p>
          <p className="text-primary font-bold">{formatCurrency(vehiclePrice)}</p>
        </div>
      )}

      {/* Anticipo Input */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <Label className="font-medium">Anticipo</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">$</span>
            <Input
              type="text"
              value={anticipoInput}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className="w-32 text-right font-bold text-lg h-10"
              data-testid="anticipo-input"
            />
            <span className="text-sm text-muted-foreground">
              ({anticipoPercentage}%)
            </span>
          </div>
        </div>
        <Slider
          value={[anticipo]}
          onValueChange={handleSliderChange}
          min={minAnticipo}
          max={maxAnticipo}
          step={1000}
          className="py-4"
          data-testid="anticipo-slider"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Mínimo: {formatCurrency(minAnticipo)}</span>
          <span>Máximo: {formatCurrency(maxAnticipo)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 text-center">
          * El anticipo mínimo para este vehículo es {formatCurrency(minAnticipo)}
        </p>
      </div>

      {/* Plazo Selector */}
      <div className="mb-6">
        <Label className="font-medium mb-3 block">Plazo (meses)</Label>
        <div className="grid grid-cols-5 gap-2">
          {[12, 18, 24, 36, 48].map((months) => (
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

      {/* Main Results */}
      {result && (
        <div className="space-y-4">
          {/* Monthly Payment - Hero */}
          <div className="bg-primary/10 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-1">Tu Pago Mensual</p>
            <p className="text-5xl font-black text-primary" data-testid="pago-mensual">
              {formatCurrency(result.pago_mensual)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              por {plazo} meses
            </p>
          </div>

          {/* Summary */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Precio del Vehículo</span>
              <span className="font-semibold">{formatCurrency(vehiclePrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tu Anticipo</span>
              <span className="font-semibold text-primary">{formatCurrency(anticipo)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monto a Financiar</span>
              <span className="font-semibold">{formatCurrency(result.monto_financiar)}</span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Capital por Letra</span>
              <span className="font-semibold">{formatCurrency(result.capital_por_letra)}</span>
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
                      <p>Interés mensual fijo del 1.4%</p>
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
            <hr className="border-border" />
            <div className="flex justify-between text-lg">
              <span className="font-bold">Total a Pagar</span>
              <span className="font-black text-primary">{formatCurrency(result.total_a_pagar)}</span>
            </div>
          </div>

          {/* Letras Adelantadas */}
          {result.letras_adelantadas && result.letras_adelantadas.length > 0 && (
            <Collapsible open={showLetrasAdelantadas} onOpenChange={setShowLetrasAdelantadas}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between" data-testid="letras-adelantadas-toggle">
                  <span className="font-medium">Letras Adelantadas (Reduce tu plazo)</span>
                  {showLetrasAdelantadas ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="bg-accent rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Si pagas letras adelantadas junto con tu anticipo, reduces tu plazo. <strong>La mensualidad permanece igual.</strong>
                  </p>
                  <div className="space-y-3">
                    {result.letras_adelantadas.map((letra) => (
                      <div 
                        key={letra.num_letras}
                        className="bg-white rounded-lg p-3 border border-border"
                        data-testid={`letra-adelantada-${letra.num_letras}`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-primary">
                            {letra.num_letras} {letra.num_letras === 1 ? 'Letra' : 'Letras'} Adelantada{letra.num_letras > 1 ? 's' : ''}
                          </span>
                          <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                            Ahorras {formatCurrency(letra.ahorro_intereses)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Pago adelantado:</span>
                            <p className="font-semibold">{formatCurrency(letra.pago_adelantado)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Mensualidad:</span>
                            <p className="font-semibold">{formatCurrency(letra.mensualidad)} <span className="text-xs text-muted-foreground">(sin cambio)</span></p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Nuevo plazo:</span>
                            <span className="font-semibold ml-2">{letra.nuevo_plazo} meses</span>
                            <span className="text-xs text-muted-foreground ml-1">(antes {plazo})</span>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground">
                            Total a pagar de anticipo: <strong>{formatCurrency(anticipo + letra.pago_adelantado)}</strong>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-4 text-center">
        * Cotización informativa. Sujeta a aprobación de crédito.
      </p>
    </div>
  );
}
