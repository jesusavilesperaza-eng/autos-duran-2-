import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

// Pages
import Home from "@/pages/Home";
import Catalogo from "@/pages/Catalogo";
import VehiculoDetalle from "@/pages/VehiculoDetalle";
import SolicitudCredito from "@/pages/SolicitudCredito";
import PagoExitoso from "@/pages/PagoExitoso";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminVehiculos from "@/pages/admin/AdminVehiculos";
import AdminSolicitudes from "@/pages/admin/AdminSolicitudes";
import AdminReservaciones from "@/pages/admin/AdminReservaciones";

// Layout
import Layout from "@/components/Layout";
import AdminLayout from "@/components/AdminLayout";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/vehiculo/:id" element={<VehiculoDetalle />} />
            <Route path="/solicitud-credito" element={<SolicitudCredito />} />
            <Route path="/solicitud-credito/:vehicleId" element={<SolicitudCredito />} />
            <Route path="/pago-exitoso" element={<PagoExitoso />} />
          </Route>
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/vehiculos" element={<AdminVehiculos />} />
            <Route path="/admin/solicitudes" element={<AdminSolicitudes />} />
            <Route path="/admin/reservaciones" element={<AdminReservaciones />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
