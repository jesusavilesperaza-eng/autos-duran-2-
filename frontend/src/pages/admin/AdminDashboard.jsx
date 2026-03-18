import { useState, useEffect } from 'react';
import { Car, FileText, Calendar, DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAdminDashboard, seedVehicles, formatCurrency } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await getAdminDashboard();
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedVehicles = async () => {
    setSeeding(true);
    try {
      const result = await seedVehicles();
      toast.success(result.message);
      loadDashboard();
    } catch (error) {
      console.error('Error seeding vehicles:', error);
      toast.error(error.response?.data?.detail || 'Error al cargar vehículos');
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Vehículos',
      value: stats?.total_vehicles || 0,
      icon: Car,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Disponibles',
      value: stats?.available_vehicles || 0,
      icon: Car,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Apartados',
      value: stats?.reserved_vehicles || 0,
      icon: Calendar,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Solicitudes Pendientes',
      value: stats?.pending_applications || 0,
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Total Solicitudes',
      value: stats?.total_applications || 0,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Apartados Pagados',
      value: stats?.paid_reservations || 0,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ];

  return (
    <div data-testid="admin-dashboard">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl md:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground">Resumen de tu negocio</p>
        </div>
        
        {stats?.total_vehicles === 0 && (
          <Button 
            onClick={handleSeedVehicles}
            disabled={seeding}
            data-testid="seed-vehicles-btn"
          >
            {seeding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                <Car className="mr-2 h-4 w-4" />
                Cargar Inventario Inicial
              </>
            )}
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} data-testid={`stat-card-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Ingresos por Apartados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-primary">
            {formatCurrency(stats?.total_revenue || 0)}
          </p>
          <p className="text-muted-foreground mt-1">
            Total de {stats?.paid_reservations || 0} apartados pagados
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
