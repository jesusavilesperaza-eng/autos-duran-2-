import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Loader2, Search, Car, CheckCircle, XCircle, Upload, Image as ImageIcon, X } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle, uploadImage, formatCurrency } from '@/lib/api';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

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
  imagenes: [],
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
  const [uploading, setUploading] = useState(false);
  const [allImages, setAllImages] = useState([]);
  const fileInputRef = useRef(null);

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
    setAllImages([]);
    setDialogOpen(true);
  };

  const openEditDialog = (vehicle) => {
    setEditingVehicle(vehicle);
    
    // Collect all images
    const images = [];
    if (vehicle.imagen_url) images.push(vehicle.imagen_url);
    if (vehicle.imagenes && vehicle.imagenes.length > 0) {
      vehicle.imagenes.forEach(img => {
        if (img && !images.includes(img)) images.push(img);
      });
    }
    setAllImages(images);
    
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
      imagenes: vehicle.imagenes || [],
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages = [...allImages];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: Solo se permiten imágenes JPG, PNG o WebP`);
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: La imagen es muy grande. Máximo 5MB`);
        continue;
      }

      try {
        const result = await uploadImage(file);
        const imageUrl = `${BACKEND_URL}${result.url}`;
        newImages.push(imageUrl);
        toast.success(`${file.name} subida correctamente`);
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error(`Error al subir ${file.name}`);
      }
    }

    setAllImages(newImages);
    
    // Update form data
    if (newImages.length > 0) {
      setFormData(prev => ({
        ...prev,
        imagen_url: newImages[0],
        imagenes: newImages.slice(1),
      }));
    }
    
    setUploading(false);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index) => {
    const newImages = allImages.filter((_, i) => i !== index);
    setAllImages(newImages);
    setFormData(prev => ({
      ...prev,
      imagen_url: newImages[0] || '',
      imagenes: newImages.slice(1),
    }));
  };

  const setMainImage = (index) => {
    const newImages = [...allImages];
    const [selected] = newImages.splice(index, 1);
    newImages.unshift(selected);
    setAllImages(newImages);
    setFormData(prev => ({
      ...prev,
      imagen_url: newImages[0],
      imagenes: newImages.slice(1),
    }));
    toast.success('Imagen principal actualizada');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const dataToSave = {
        ...formData,
        imagen_url: allImages[0] || '',
        imagenes: allImages.slice(1),
      };

      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, dataToSave);
        toast.success('Vehículo actualizado');
      } else {
        await createVehicle(dataToSave);
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

  const handleMarkAsSold = async (vehicle) => {
    try {
      await updateVehicle(vehicle.id, { disponible: false, reservado: false });
      toast.success(`${vehicle.marca} ${vehicle.modelo} marcado como VENDIDO`);
      loadVehicles();
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast.error('Error al actualizar');
    }
  };

  const handleMarkAsAvailable = async (vehicle) => {
    try {
      await updateVehicle(vehicle.id, { disponible: true, reservado: false });
      toast.success(`${vehicle.marca} ${vehicle.modelo} marcado como DISPONIBLE`);
      loadVehicles();
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast.error('Error al actualizar');
    }
  };

  const handleUnreserve = async (vehicle) => {
    try {
      await updateVehicle(vehicle.id, { reservado: false });
      toast.success(`Apartado cancelado para ${vehicle.marca} ${vehicle.modelo}`);
      loadVehicles();
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast.error('Error al actualizar');
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" data-testid={`actions-${vehicle.id}`}>
                            Acciones
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(vehicle)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {vehicle.disponible && !vehicle.reservado && (
                            <DropdownMenuItem onClick={() => handleMarkAsSold(vehicle)}>
                              <XCircle className="h-4 w-4 mr-2 text-red-500" />
                              Marcar como Vendido
                            </DropdownMenuItem>
                          )}
                          {!vehicle.disponible && (
                            <DropdownMenuItem onClick={() => handleMarkAsAvailable(vehicle)}>
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                              Marcar como Disponible
                            </DropdownMenuItem>
                          )}
                          {vehicle.reservado && (
                            <DropdownMenuItem onClick={() => handleUnreserve(vehicle)}>
                              <CheckCircle className="h-4 w-4 mr-2 text-yellow-500" />
                              Cancelar Apartado
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              setVehicleToDelete(vehicle);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
              
              {/* Gallery Upload Section */}
              <div className="md:col-span-3 border-t pt-4 mt-2">
                <Label className="mb-3 block font-bold">Galería de Imágenes</Label>
                
                {/* Upload Button */}
                <div className="mb-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full md:w-auto"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Subir Fotos (múltiples)
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Formatos: JPG, PNG, WebP. Máximo 5MB por imagen. Puedes seleccionar varias fotos a la vez.
                  </p>
                </div>

                {/* Image Gallery */}
                {allImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {allImages.map((img, index) => (
                      <div 
                        key={index}
                        className={`relative group aspect-video rounded-lg overflow-hidden border-2 ${
                          index === 0 ? 'border-primary' : 'border-transparent'
                        }`}
                      >
                        <img 
                          src={img} 
                          alt={`Foto ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {index === 0 && (
                          <div className="absolute top-1 left-1 bg-primary text-white text-xs px-2 py-0.5 rounded">
                            Principal
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {index !== 0 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => setMainImage(index)}
                              className="text-xs"
                            >
                              Principal
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No hay imágenes</p>
                    <p className="text-sm text-muted-foreground">Sube fotos del vehículo</p>
                  </div>
                )}
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
