import { useState, useEffect } from 'react';
import { Calendar, DollarSign, Car, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getReservations, formatCurrency } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminReservaciones() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      const data = await getReservations();
      setReservations(data);
    } catch (error) {
      console.error('Error loading reservations:', error);
      toast.error('Error al cargar reservaciones');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Pagado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const paidReservations = reservations.filter(r => r.payment_status === 'paid');
  const pendingReservations = reservations.filter(r => r.payment_status === 'pending');

  return (
    <div data-testid="admin-reservaciones">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl md:text-3xl">Reservaciones (Apartados)</h1>
        <p className="text-muted-foreground">
          {paidReservations.length} pagadas, {pendingReservations.length} pendientes
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Reservaciones</p>
              <p className="text-2xl font-bold">{reservations.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pagadas</p>
              <p className="text-2xl font-bold text-green-600">{paidReservations.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ingresos</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(paidReservations.reduce((sum, r) => sum + r.amount, 0))}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Vehículo ID</TableHead>
                <TableHead>Días</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Expira</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Car className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No hay reservaciones</p>
                  </TableCell>
                </TableRow>
              ) : (
                reservations.map((res) => (
                  <TableRow key={res.id}>
                    <TableCell className="font-medium">{res.customer_name}</TableCell>
                    <TableCell>
                      <div>
                        <p>{res.customer_phone}</p>
                        <p className="text-sm text-muted-foreground">{res.customer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{res.vehicle_id.slice(0, 8)}...</TableCell>
                    <TableCell>{res.days} día(s)</TableCell>
                    <TableCell className="font-medium">{formatCurrency(res.amount)}</TableCell>
                    <TableCell>
                      {res.expires_at ? (
                        new Date(res.expires_at).toLocaleDateString('es-MX')
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(res.payment_status)}</TableCell>
                    <TableCell>
                      {new Date(res.created_at).toLocaleDateString('es-MX')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}
