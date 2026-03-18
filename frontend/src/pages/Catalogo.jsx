import { useState, useEffect } from 'react';
import { Search, Filter, X, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import VehicleCard from '@/components/VehicleCard';
import { getVehicles, formatCurrency } from '@/lib/api';

const BRANDS = [
  'TODOS', 'AUDI', 'BMW', 'CHEVROLET', 'FORD', 'GMC', 'HONDA', 'HYUNDAI', 
  'JEEP', 'LINCOLN', 'MAZDA', 'NISSAN', 'RENAULT', 'SEAT', 'SUZUKI', 
  'TOYOTA', 'VW'
];

const YEARS = ['TODOS', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2004'];

export default function Catalogo() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    marca: '',
    year_min: '',
    year_max: '',
    transmision: '',
    precio_min: 0,
    precio_max: 600000,
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, [filters]);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const queryFilters = {};
      if (filters.marca && filters.marca !== 'TODOS') queryFilters.marca = filters.marca;
      if (filters.year_min && filters.year_min !== 'TODOS') queryFilters.year_min = parseInt(filters.year_min);
      if (filters.transmision && filters.transmision !== 'TODOS') queryFilters.transmision = filters.transmision;
      if (filters.precio_min > 0) queryFilters.precio_min = filters.precio_min;
      if (filters.precio_max < 600000) queryFilters.precio_max = filters.precio_max;

      const data = await getVehicles(queryFilters);
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      vehicle.marca.toLowerCase().includes(search) ||
      vehicle.modelo.toLowerCase().includes(search) ||
      vehicle.year.toString().includes(search)
    );
  });

  const clearFilters = () => {
    setFilters({
      marca: '',
      year_min: '',
      year_max: '',
      transmision: '',
      precio_min: 0,
      precio_max: 600000,
    });
    setSearchTerm('');
  };

  const hasActiveFilters = filters.marca || filters.year_min || filters.transmision || 
    filters.precio_min > 0 || filters.precio_max < 600000;

  const FilterControls = () => (
    <div className="space-y-6">
      {/* Brand */}
      <div>
        <label className="font-medium mb-2 block">Marca</label>
        <Select
          value={filters.marca || 'TODOS'}
          onValueChange={(value) => setFilters({ ...filters, marca: value === 'TODOS' ? '' : value })}
        >
          <SelectTrigger data-testid="filter-marca">
            <SelectValue placeholder="Todas las marcas" />
          </SelectTrigger>
          <SelectContent>
            {BRANDS.map((brand) => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Year */}
      <div>
        <label className="font-medium mb-2 block">Año</label>
        <Select
          value={filters.year_min || 'TODOS'}
          onValueChange={(value) => setFilters({ ...filters, year_min: value === 'TODOS' ? '' : value })}
        >
          <SelectTrigger data-testid="filter-year">
            <SelectValue placeholder="Todos los años" />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Transmission */}
      <div>
        <label className="font-medium mb-2 block">Transmisión</label>
        <Select
          value={filters.transmision || 'TODOS'}
          onValueChange={(value) => setFilters({ ...filters, transmision: value === 'TODOS' ? '' : value })}
        >
          <SelectTrigger data-testid="filter-transmision">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todas</SelectItem>
            <SelectItem value="Automático">Automático</SelectItem>
            <SelectItem value="Estándar">Estándar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div>
        <label className="font-medium mb-4 block">
          Rango de Precio
        </label>
        <div className="px-2">
          <Slider
            value={[filters.precio_min, filters.precio_max]}
            onValueChange={([min, max]) => setFilters({ ...filters, precio_min: min, precio_max: max })}
            min={0}
            max={600000}
            step={10000}
            className="mb-4"
            data-testid="filter-precio"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatCurrency(filters.precio_min)}</span>
            <span>{formatCurrency(filters.precio_max)}</span>
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full"
          data-testid="clear-filters-btn"
        >
          <X className="h-4 w-4 mr-2" />
          Limpiar Filtros
        </Button>
      )}
    </div>
  );

  return (
    <div className="section-padding" data-testid="catalogo-page">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl md:text-4xl mb-2">
            Catálogo de Vehículos
          </h1>
          <p className="text-muted-foreground">
            {filteredVehicles.length} vehículos disponibles
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-xl border border-border p-6">
              <h3 className="font-heading font-bold text-lg mb-6 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </h3>
              <FilterControls />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Mobile Filter */}
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por marca, modelo o año..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 rounded-full bg-muted/30 border-transparent"
                  data-testid="search-input"
                />
              </div>
              
              {/* Mobile Filter Button */}
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="outline" size="icon" className="h-12 w-12 flex-shrink-0" data-testid="mobile-filter-btn">
                    <Filter className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterControls />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Results */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-muted animate-pulse rounded-xl h-96" />
                ))}
              </div>
            ) : filteredVehicles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-heading font-bold text-xl mb-2">
                  No se encontraron vehículos
                </h3>
                <p className="text-muted-foreground mb-4">
                  Intenta ajustar los filtros de búsqueda
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Limpiar Filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
