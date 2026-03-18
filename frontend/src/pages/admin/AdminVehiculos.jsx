import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, Search, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle, formatCurrency } from '@/lib/api';
import { toast } from 'sonner';

const emptyVehicle = {
  pin: '',
  marca: '',
  modelo: '',
  year: new Date().getFullYear(),
  transmision: 'Automático',
  color: '',
  documentacion: '',
  motor: 2.0,
  precio: 0,
  precio_facebook: 0,
  anticipo_minimo: 0,
  monto_financiar: 0,
  pago_mensual: 0,
  imagen_url: '',
};

export default function AdminVehiculos() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState(emptyVehicle);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await getVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      toast.error('Error al cargar vehículos');
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      v.marca.toLowerCase().includes(search) ||
      v.modelo.toLowerCase().includes(search) ||
      v.pin.toLowerCase().includes(search)
    );
  });

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openCreateDialog = () => {
    setEditingVehicle(null);
    setFormData(emptyVehicle);
    setDialogOpen(true);
  };

  const openEditDialog = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      pin: vehicle.pin,
      marca: vehicle.marca,
      modelo: vehicle.modelo,
      year: vehicle.year,
      transmision: vehicle.transmision,
      color: vehicle.color,
      documentacion: vehicle.documentacion,
      motor: vehicle.motor,
      precio: vehicle.precio,
      precio_facebook: vehicle.precio_facebook,
      anticipo_minimo: vehicle.anticipo_minimo,
      monto_financiar: vehicle.monto_financiar,
      pago_mensual: vehicle.pago_mensual,
      imagen_url: vehicle.imagen_url || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, formData);
        toast.success('Vehículo actualizado');
      } else {
        await createVehicle(formData);
        toast.success('Vehículo creado');
      }
      setDialogOpen(false);
      loadVehicles();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast.error(error.response?.data?.detail || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!vehicleToDelete) return;

    try {
      await deleteVehicle(vehicleToDelete.id);
      toast.success('Vehículo eliminado');
      setDeleteDialogOpen(false);
      loadVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Error al eliminar');
    }
  };

  const getStatusBadge = (vehicle) => {
    if (vehicle.reservado) {
      return <Badge className="bg-yellow-100 text-yellow-800">Apartado</Badge>;
    }
    if (!vehicle.disponible) {
      return <Badge className="bg-red-100 text-red-800">Vendido</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Disponible</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div data-testid="admin-vehiculos">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl md:text-3xl">Vehículos</h1>
          <p className="text-muted-foreground">{vehicles.length} vehículos en inventario</p>
        </div>
        <Button onClick={openCreateDialog} data-testid="btn-add-vehicle">
          <Plus className="mr-2 h-4 w-4" />
          Agregar Vehículo
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por PIN, marca o modelo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          data-testid="search-vehicles"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PIN</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Año</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Anticipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Car className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No se encontraron vehículos</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id} data-testid={`vehicle-row-${vehicle.id}`}>
                    <TableCell className="font-mono text-sm">{vehicle.pin}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {vehicle.imagen_url && (
                          <img
                            src={vehicle.imagen_url}
                            alt={vehicle.modelo}
                            className="w-12 h-8 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{vehicle.marca}</p>
                          <p className="text-sm text-muted-foreground">{vehicle.modelo}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{vehicle.year}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(vehicle.precio_facebook)}</TableCell>
                    <TableCell>{formatCurrency(vehicle.anticipo_minimo)}</TableCell>
                    <TableCell>{getStatusBadge(vehicle)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(vehicle)}
                        data-testid={`edit-${vehicle.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setVehicleToDelete(vehicle);
                          setDeleteDialogOpen(true);
                        }}
                        data-testid={`delete-${vehicle.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVehicle ? 'Editar Vehículo' : 'Agregar Vehículo'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="pin">PIN</Label>
                <Input
                  id="pin"
                  name="pin"
                  value={formData.pin}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  name="marca"
                  value={formData.marca}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="year">Año</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="transmision">Transmisión</Label>
                <Select
                  value={formData.transmision}
                  onValueChange={(v) => handleSelectChange('transmision', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Automático">Automático</SelectItem>
                    <SelectItem value="Estándar">Estándar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="motor">Motor (L)</Label>
                <Input
                  id="motor"
                  name="motor"
                  type="number"
                  step="0.1"
                  value={formData.motor}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="documentacion">Documentación</Label>
                <Input
                  id="documentacion"
                  name="documentacion"
                  value={formData.documentacion}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="precio">Precio Base</Label>
                <Input
                  id="precio"
                  name="precio"
                  type="number"
                  value={formData.precio}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="precio_facebook">Precio Facebook</Label>
                <Input
                  id="precio_facebook"
                  name="precio_facebook"
                  type="number"
                  value={formData.precio_facebook}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="anticipo_minimo">Anticipo Mínimo</Label>
                <Input
                  id="anticipo_minimo"
                  name="anticipo_minimo"
                  type="number"
                  value={formData.anticipo_minimo}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="monto_financiar">Monto a Financiar</Label>
                <Input
                  id="monto_financiar"
                  name="monto_financiar"
                  type="number"
                  value={formData.monto_financiar}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="pago_mensual">Pago Mensual</Label>
                <Input
                  id="pago_mensual"
                  name="pago_mensual"
                  type="number"
                  value={formData.pago_mensual}
                  onChange={handleInputChange}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="imagen_url">URL de Imagen</Label>
                <Input
                  id="imagen_url"
                  name="imagen_url"
                  type="url"
                  value={formData.imagen_url}
                  onChange={handleInputChange}
                  placeholder="https://..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            ¿Estás seguro de que deseas eliminar el vehículo{' '}
            <strong>{vehicleToDelete?.marca} {vehicleToDelete?.modelo}</strong>?
            Esta acción no se puede deshacer.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
