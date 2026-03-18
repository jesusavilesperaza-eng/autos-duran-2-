import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Briefcase, 
  Users, 
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { getVehicle, submitCreditApplication, formatCurrency } from '@/lib/api';

const ESTADOS_MEXICO = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México',
  'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit',
  'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
  'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
];

const ESTADOS_CIVILES = ['Soltero(a)', 'Casado(a)', 'Divorciado(a)', 'Viudo(a)', 'Unión Libre'];
const TIPOS_VIVIENDA = ['Propia', 'Rentada', 'Familiar', 'Hipotecada'];

const steps = [
  { id: 1, title: 'Datos Personales', icon: User },
  { id: 2, title: 'Datos Laborales', icon: Briefcase },
  { id: 3, title: 'Referencias', icon: Users },
  { id: 4, title: 'Confirmación', icon: CheckCircle },
];

export default function SolicitudCredito() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    // Personal
    nombre_completo: '',
    fecha_nacimiento: '',
    lugar_nacimiento: '',
    estado_civil: '',
    rfc: '',
    curp: '',
    telefono: '',
    celular: '',
    email: '',
    domicilio: '',
    colonia: '',
    ciudad: '',
    estado: 'Yucatán',
    cp: '',
    tiempo_residencia: '',
    tipo_vivienda: '',
    // Laboral
    empresa: '',
    puesto: '',
    antiguedad: '',
    telefono_trabajo: '',
    direccion_trabajo: '',
    ingreso_mensual: '',
    otros_ingresos: '0',
    // Referencias Comerciales
    ref_comercial_1_nombre: '',
    ref_comercial_1_telefono: '',
    ref_comercial_2_nombre: '',
    ref_comercial_2_telefono: '',
    // Referencias Personales
    ref_personal_1_nombre: '',
    ref_personal_1_tiempo: '',
    ref_personal_1_telefono: '',
    ref_personal_1_celular: '',
    ref_personal_2_nombre: '',
    ref_personal_2_tiempo: '',
    ref_personal_2_telefono: '',
    ref_personal_2_celular: '',
    // Referencias Familiares
    ref_familiar_1_nombre: '',
    ref_familiar_1_parentesco: '',
    ref_familiar_1_domicilio: '',
    ref_familiar_1_telefono: '',
    ref_familiar_1_celular: '',
    ref_familiar_2_nombre: '',
    ref_familiar_2_parentesco: '',
    ref_familiar_2_domicilio: '',
    ref_familiar_2_telefono: '',
    ref_familiar_2_celular: '',
  });

  useEffect(() => {
    if (vehicleId) {
      loadVehicle();
    }
  }, [vehicleId]);

  const loadVehicle = async () => {
    setLoading(true);
    try {
      const data = await getVehicle(vehicleId);
      setVehicle(data);
    } catch (error) {
      console.error('Error loading vehicle:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.nombre_completo && formData.fecha_nacimiento && formData.celular && 
               formData.email && formData.domicilio && formData.estado;
      case 2:
        return formData.empresa && formData.puesto && formData.ingreso_mensual;
      case 3:
        return formData.ref_comercial_1_nombre && formData.ref_personal_1_nombre && 
               formData.ref_familiar_1_nombre;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const applicationData = {
        ...formData,
        vehicle_id: vehicleId || null,
        ingreso_mensual: parseFloat(formData.ingreso_mensual) || 0,
        otros_ingresos: parseFloat(formData.otros_ingresos) || 0,
      };

      await submitCreditApplication(applicationData);
      setSubmitted(true);
      toast.success('¡Solicitud enviada exitosamente!');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error.response?.data?.detail || 'Error al enviar la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="section-padding" data-testid="solicitud-success">
        <div className="container-custom max-w-2xl">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="font-heading font-bold text-3xl mb-4">
              ¡Solicitud Enviada!
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Hemos recibido tu solicitud de crédito. Nos pondremos en contacto contigo 
              en las próximas 24 horas para continuar con el proceso.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/catalogo">
                <Button className="btn-primary">
                  Ver más vehículos
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline">
                  Volver al inicio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding bg-muted/30" data-testid="solicitud-credito-page">
      <div className="container-custom max-w-4xl">
        {/* Back Button */}
        <Link 
          to={vehicleId ? `/vehiculo/${vehicleId}` : '/catalogo'}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-heading font-bold text-3xl md:text-4xl mb-2">
            Solicitud de Crédito
          </h1>
          <p className="text-muted-foreground">
            Completa el formulario para solicitar tu financiamiento
          </p>
        </div>

        {/* Vehicle Info */}
        {vehicle && (
          <div className="bg-white rounded-xl p-4 mb-8 flex items-center gap-4">
            <img
              src={vehicle.imagen_url || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200'}
              alt={`${vehicle.marca} ${vehicle.modelo}`}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div>
              <p className="font-bold">{vehicle.year} {vehicle.marca} {vehicle.modelo}</p>
              <p className="text-primary font-bold">{formatCurrency(vehicle.precio_facebook)}</p>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isActive ? 'bg-primary text-white' :
                      isCompleted ? 'bg-green-500 text-white' :
                      'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={`text-xs mt-2 whitespace-nowrap ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 md:w-24 h-0.5 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-muted'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
          {/* Step 1: Personal Data */}
          {currentStep === 1 && (
            <div className="space-y-6" data-testid="step-personal">
              <h2 className="font-heading font-bold text-xl flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Datos Personales
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="nombre_completo">Nombre Completo *</Label>
                  <Input
                    id="nombre_completo"
                    name="nombre_completo"
                    value={formData.nombre_completo}
                    onChange={handleInputChange}
                    placeholder="Tu nombre completo"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
                  <Input
                    id="fecha_nacimiento"
                    name="fecha_nacimiento"
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={handleInputChange}
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="lugar_nacimiento">Lugar de Nacimiento</Label>
                  <Input
                    id="lugar_nacimiento"
                    name="lugar_nacimiento"
                    value={formData.lugar_nacimiento}
                    onChange={handleInputChange}
                    placeholder="Ciudad, Estado"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="estado_civil">Estado Civil</Label>
                  <Select
                    value={formData.estado_civil}
                    onValueChange={(value) => handleSelectChange('estado_civil', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS_CIVILES.map((ec) => (
                        <SelectItem key={ec} value={ec}>{ec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="tipo_vivienda">Tipo de Vivienda</Label>
                  <Select
                    value={formData.tipo_vivienda}
                    onValueChange={(value) => handleSelectChange('tipo_vivienda', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_VIVIENDA.map((tv) => (
                        <SelectItem key={tv} value={tv}>{tv}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="rfc">RFC</Label>
                  <Input
                    id="rfc"
                    name="rfc"
                    value={formData.rfc}
                    onChange={handleInputChange}
                    placeholder="XXXX000000XXX"
                    className="mt-1 uppercase"
                    maxLength={13}
                  />
                </div>
                
                <div>
                  <Label htmlFor="curp">CURP</Label>
                  <Input
                    id="curp"
                    name="curp"
                    value={formData.curp}
                    onChange={handleInputChange}
                    placeholder="XXXX000000XXXXXX00"
                    className="mt-1 uppercase"
                    maxLength={18}
                  />
                </div>
                
                <div>
                  <Label htmlFor="telefono">Teléfono Fijo</Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="999 123 4567"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="celular">Celular / WhatsApp *</Label>
                  <Input
                    id="celular"
                    name="celular"
                    type="tel"
                    value={formData.celular}
                    onChange={handleInputChange}
                    placeholder="999 123 4567"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="email">Correo Electrónico *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tu@email.com"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="domicilio">Domicilio *</Label>
                  <Input
                    id="domicilio"
                    name="domicilio"
                    value={formData.domicilio}
                    onChange={handleInputChange}
                    placeholder="Calle, Número"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="colonia">Colonia</Label>
                  <Input
                    id="colonia"
                    name="colonia"
                    value={formData.colonia}
                    onChange={handleInputChange}
                    placeholder="Colonia"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="ciudad">Ciudad</Label>
                  <Input
                    id="ciudad"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleInputChange}
                    placeholder="Ciudad"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="estado">Estado *</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value) => handleSelectChange('estado', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS_MEXICO.map((e) => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="cp">Código Postal</Label>
                  <Input
                    id="cp"
                    name="cp"
                    value={formData.cp}
                    onChange={handleInputChange}
                    placeholder="97000"
                    className="mt-1"
                    maxLength={5}
                  />
                </div>
                
                <div>
                  <Label htmlFor="tiempo_residencia">Tiempo de Residencia</Label>
                  <Input
                    id="tiempo_residencia"
                    name="tiempo_residencia"
                    value={formData.tiempo_residencia}
                    onChange={handleInputChange}
                    placeholder="Ej: 2 años"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Work Data */}
          {currentStep === 2 && (
            <div className="space-y-6" data-testid="step-laboral">
              <h2 className="font-heading font-bold text-xl flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Datos Laborales
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="empresa">Empresa / Negocio *</Label>
                  <Input
                    id="empresa"
                    name="empresa"
                    value={formData.empresa}
                    onChange={handleInputChange}
                    placeholder="Nombre de la empresa"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="puesto">Puesto *</Label>
                  <Input
                    id="puesto"
                    name="puesto"
                    value={formData.puesto}
                    onChange={handleInputChange}
                    placeholder="Tu puesto"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="antiguedad">Antigüedad</Label>
                  <Input
                    id="antiguedad"
                    name="antiguedad"
                    value={formData.antiguedad}
                    onChange={handleInputChange}
                    placeholder="Ej: 3 años"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="telefono_trabajo">Teléfono del Trabajo</Label>
                  <Input
                    id="telefono_trabajo"
                    name="telefono_trabajo"
                    type="tel"
                    value={formData.telefono_trabajo}
                    onChange={handleInputChange}
                    placeholder="999 123 4567"
                    className="mt-1"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="direccion_trabajo">Dirección del Trabajo</Label>
                  <Input
                    id="direccion_trabajo"
                    name="direccion_trabajo"
                    value={formData.direccion_trabajo}
                    onChange={handleInputChange}
                    placeholder="Dirección completa"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="ingreso_mensual">Ingreso Mensual *</Label>
                  <Input
                    id="ingreso_mensual"
                    name="ingreso_mensual"
                    type="number"
                    value={formData.ingreso_mensual}
                    onChange={handleInputChange}
                    placeholder="15000"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="otros_ingresos">Otros Ingresos</Label>
                  <Input
                    id="otros_ingresos"
                    name="otros_ingresos"
                    type="number"
                    value={formData.otros_ingresos}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: References */}
          {currentStep === 3 && (
            <div className="space-y-8" data-testid="step-referencias">
              <h2 className="font-heading font-bold text-xl flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Referencias
              </h2>
              
              {/* Comerciales */}
              <div>
                <h3 className="font-bold mb-4">Referencias Comerciales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre 1 *</Label>
                    <Input
                      name="ref_comercial_1_nombre"
                      value={formData.ref_comercial_1_nombre}
                      onChange={handleInputChange}
                      placeholder="Nombre completo"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label>Teléfono 1</Label>
                    <Input
                      name="ref_comercial_1_telefono"
                      value={formData.ref_comercial_1_telefono}
                      onChange={handleInputChange}
                      placeholder="999 123 4567"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Nombre 2</Label>
                    <Input
                      name="ref_comercial_2_nombre"
                      value={formData.ref_comercial_2_nombre}
                      onChange={handleInputChange}
                      placeholder="Nombre completo"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Teléfono 2</Label>
                    <Input
                      name="ref_comercial_2_telefono"
                      value={formData.ref_comercial_2_telefono}
                      onChange={handleInputChange}
                      placeholder="999 123 4567"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Personales */}
              <div>
                <h3 className="font-bold mb-4">Referencias Personales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre 1 *</Label>
                    <Input
                      name="ref_personal_1_nombre"
                      value={formData.ref_personal_1_nombre}
                      onChange={handleInputChange}
                      placeholder="Nombre completo"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label>Tiempo de conocerlo</Label>
                    <Input
                      name="ref_personal_1_tiempo"
                      value={formData.ref_personal_1_tiempo}
                      onChange={handleInputChange}
                      placeholder="Ej: 5 años"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <Input
                      name="ref_personal_1_telefono"
                      value={formData.ref_personal_1_telefono}
                      onChange={handleInputChange}
                      placeholder="999 123 4567"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Celular</Label>
                    <Input
                      name="ref_personal_1_celular"
                      value={formData.ref_personal_1_celular}
                      onChange={handleInputChange}
                      placeholder="999 123 4567"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Nombre 2</Label>
                    <Input
                      name="ref_personal_2_nombre"
                      value={formData.ref_personal_2_nombre}
                      onChange={handleInputChange}
                      placeholder="Nombre completo"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Tiempo de conocerlo</Label>
                    <Input
                      name="ref_personal_2_tiempo"
                      value={formData.ref_personal_2_tiempo}
                      onChange={handleInputChange}
                      placeholder="Ej: 3 años"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <Input
                      name="ref_personal_2_telefono"
                      value={formData.ref_personal_2_telefono}
                      onChange={handleInputChange}
                      placeholder="999 123 4567"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Celular</Label>
                    <Input
                      name="ref_personal_2_celular"
                      value={formData.ref_personal_2_celular}
                      onChange={handleInputChange}
                      placeholder="999 123 4567"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Familiares */}
              <div>
                <h3 className="font-bold mb-2">Referencias Familiares</h3>
                <p className="text-sm text-muted-foreground mb-4">(Que no vivan en el mismo domicilio)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre 1 *</Label>
                    <Input
                      name="ref_familiar_1_nombre"
                      value={formData.ref_familiar_1_nombre}
                      onChange={handleInputChange}
                      placeholder="Nombre completo"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label>Parentesco</Label>
                    <Input
                      name="ref_familiar_1_parentesco"
                      value={formData.ref_familiar_1_parentesco}
                      onChange={handleInputChange}
                      placeholder="Ej: Hermano, Tío"
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Domicilio</Label>
                    <Input
                      name="ref_familiar_1_domicilio"
                      value={formData.ref_familiar_1_domicilio}
                      onChange={handleInputChange}
                      placeholder="Dirección completa"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <Input
                      name="ref_familiar_1_telefono"
                      value={formData.ref_familiar_1_telefono}
                      onChange={handleInputChange}
                      placeholder="999 123 4567"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Celular</Label>
                    <Input
                      name="ref_familiar_1_celular"
                      value={formData.ref_familiar_1_celular}
                      onChange={handleInputChange}
                      placeholder="999 123 4567"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Nombre 2</Label>
                    <Input
                      name="ref_familiar_2_nombre"
                      value={formData.ref_familiar_2_nombre}
                      onChange={handleInputChange}
                      placeholder="Nombre completo"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Parentesco</Label>
                    <Input
                      name="ref_familiar_2_parentesco"
                      value={formData.ref_familiar_2_parentesco}
                      onChange={handleInputChange}
                      placeholder="Ej: Padre, Madre"
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Domicilio</Label>
                    <Input
                      name="ref_familiar_2_domicilio"
                      value={formData.ref_familiar_2_domicilio}
                      onChange={handleInputChange}
                      placeholder="Dirección completa"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <Input
                      name="ref_familiar_2_telefono"
                      value={formData.ref_familiar_2_telefono}
                      onChange={handleInputChange}
                      placeholder="999 123 4567"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Celular</Label>
                    <Input
                      name="ref_familiar_2_celular"
                      value={formData.ref_familiar_2_celular}
                      onChange={handleInputChange}
                      placeholder="999 123 4567"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <div className="space-y-6" data-testid="step-confirmacion">
              <h2 className="font-heading font-bold text-xl flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Confirmación
              </h2>
              
              <div className="bg-muted/50 rounded-xl p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="font-medium">{formData.nombre_completo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Celular</p>
                    <p className="font-medium">{formData.celular}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Empresa</p>
                    <p className="font-medium">{formData.empresa}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ingreso Mensual</p>
                    <p className="font-medium">{formatCurrency(parseFloat(formData.ingreso_mensual) || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <p className="font-medium">{formData.estado}</p>
                  </div>
                </div>
              </div>

              <div className="bg-accent rounded-xl p-4">
                <p className="text-sm text-accent-foreground">
                  <FileText className="h-4 w-4 inline mr-2" />
                  Al enviar esta solicitud, autorizas a Autos Durán a verificar la información 
                  proporcionada y contactarte para dar seguimiento a tu solicitud de crédito.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            {currentStep > 1 ? (
              <Button variant="outline" onClick={prevStep} data-testid="btn-prev">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <Button onClick={nextStep} className="btn-primary" data-testid="btn-next">
                Siguiente
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                className="btn-primary"
                disabled={submitting}
                data-testid="btn-submit"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Enviar Solicitud
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
