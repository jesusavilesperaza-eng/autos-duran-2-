import { useState, useEffect } from 'react';
import { FileText, Eye, CheckCircle, XCircle, Clock, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getCreditApplications, updateApplicationStatus, formatCurrency } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminSolicitudes() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await getCreditApplications();
      setApplications(data);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error('Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = !searchTerm || 
      app.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      toast.success('Estado actualizado');
      loadApplications();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar estado');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pendiente':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case 'aprobado':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Aprobado</Badge>;
      case 'rechazado':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rechazado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const openDetails = (app) => {
    setSelectedApp(app);
    setDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div data-testid="admin-solicitudes">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl md:text-3xl">Solicitudes de Crédito</h1>
        <p className="text-muted-foreground">{applications.length} solicitudes en total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendiente">Pendientes</SelectItem>
            <SelectItem value="aprobado">Aprobados</SelectItem>
            <SelectItem value="rechazado">Rechazados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Ingreso</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No se encontraron solicitudes</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.nombre_completo}</TableCell>
                    <TableCell>{app.email}</TableCell>
                    <TableCell>{app.celular}</TableCell>
                    <TableCell>{formatCurrency(app.ingreso_mensual)}</TableCell>
                    <TableCell>
                      {new Date(app.created_at).toLocaleDateString('es-MX')}
                    </TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetails(app)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Select
                          value={app.status}
                          onValueChange={(v) => handleStatusChange(app.id, v)}
                        >
                          <SelectTrigger className="w-[120px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="aprobado">Aprobar</SelectItem>
                            <SelectItem value="rechazado">Rechazar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de Solicitud</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-6">
              {/* Personal */}
              <div>
                <h3 className="font-bold mb-3">Datos Personales</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nombre</p>
                    <p className="font-medium">{selectedApp.nombre_completo}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Nacimiento</p>
                    <p className="font-medium">{selectedApp.fecha_nacimiento}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Estado Civil</p>
                    <p className="font-medium">{selectedApp.estado_civil || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">RFC</p>
                    <p className="font-medium">{selectedApp.rfc || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">CURP</p>
                    <p className="font-medium">{selectedApp.curp || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedApp.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{selectedApp.telefono || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Celular</p>
                    <p className="font-medium">{selectedApp.celular}</p>
                  </div>
                  <div className="md:col-span-3">
                    <p className="text-muted-foreground">Domicilio</p>
                    <p className="font-medium">
                      {selectedApp.domicilio}, {selectedApp.colonia}, {selectedApp.ciudad}, {selectedApp.estado} C.P. {selectedApp.cp}
                    </p>
                  </div>
                </div>
              </div>

              {/* Laboral */}
              <div>
                <h3 className="font-bold mb-3">Datos Laborales</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Empresa</p>
                    <p className="font-medium">{selectedApp.empresa}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Puesto</p>
                    <p className="font-medium">{selectedApp.puesto}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Antigüedad</p>
                    <p className="font-medium">{selectedApp.antiguedad || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ingreso Mensual</p>
                    <p className="font-medium text-primary">{formatCurrency(selectedApp.ingreso_mensual)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Otros Ingresos</p>
                    <p className="font-medium">{formatCurrency(selectedApp.otros_ingresos)}</p>
                  </div>
                </div>
              </div>

              {/* Referencias */}
              <div>
                <h3 className="font-bold mb-3">Referencias</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="font-medium mb-1">Comercial 1</p>
                    <p>{selectedApp.ref_comercial_1_nombre}</p>
                    <p className="text-muted-foreground">{selectedApp.ref_comercial_1_telefono}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="font-medium mb-1">Personal 1</p>
                    <p>{selectedApp.ref_personal_1_nombre}</p>
                    <p className="text-muted-foreground">{selectedApp.ref_personal_1_telefono}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="font-medium mb-1">Familiar 1</p>
                    <p>{selectedApp.ref_familiar_1_nombre} ({selectedApp.ref_familiar_1_parentesco})</p>
                    <p className="text-muted-foreground">{selectedApp.ref_familiar_1_telefono}</p>
                  </div>
                </div>
              </div>

              {/* Status Change */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Estado actual</p>
                  {getStatusBadge(selectedApp.status)}
                </div>
                <div className="flex gap-2">
                  {selectedApp.status !== 'aprobado' && (
                    <Button
                      variant="outline"
                      className="text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => {
                        handleStatusChange(selectedApp.id, 'aprobado');
                        setSelectedApp({ ...selectedApp, status: 'aprobado' });
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprobar
                    </Button>
                  )}
                  {selectedApp.status !== 'rechazado' && (
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => {
                        handleStatusChange(selectedApp.id, 'rechazado');
                        setSelectedApp({ ...selectedApp, status: 'rechazado' });
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rechazar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
