# AUTOS DURAN - Product Requirements Document

## Original Problem Statement
Crear una página web para AUTOS DURAN, negocio de venta y compra de autos seminuevos en Yucatán, México. Incluye:
- Cotizador de financiamiento al 1.4% mensual con anticipo del 40%
- Catálogo con 36 vehículos del inventario Excel (precios de Facebook, anticipos mínimos)
- Sistema de apartado: $1,000 MXN/día, máximo 5 días ($5,000), con pago Stripe
- Solicitud de crédito digital completa
- Panel de administración total

## User Personas
1. **Comprador de auto**: Persona buscando financiamiento accesible para auto seminuevo
2. **Administrador**: Dueño del negocio que gestiona inventario y solicitudes

## Core Requirements
- 36 vehículos del inventario con precios de Facebook y anticipos del Excel
- Cotizador: 1.4% interés mensual, 40% anticipo mínimo
- Apartado: $1,000/día (1-5 días) con Stripe
- Formulario de crédito: datos personales, laborales, referencias comerciales/personales/familiares
- Panel admin: CRUD vehículos, gestión solicitudes, reservaciones

## What's Been Implemented (18/03/2026)
✅ Backend FastAPI con MongoDB
✅ 36 vehículos cargados del Excel
✅ Cotizador de financiamiento funcional (1.4% mensual)
✅ Sistema de apartado con Stripe integration
✅ Formulario de solicitud de crédito multi-step
✅ Panel de administración completo
✅ Notificaciones por email (configurado para Resend)
✅ WhatsApp float button (9991524005)
✅ Responsive design

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB
- **Payments**: Stripe Checkout
- **Auth**: JWT (solo admin)

## API Endpoints
- `GET/POST /api/vehicles` - CRUD vehículos
- `POST /api/calculate-financing` - Cotizador
- `POST /api/credit-applications` - Solicitudes de crédito
- `POST /api/reservations` - Crear apartado
- `POST /api/checkout/create-session` - Stripe checkout
- `POST /api/admin/login` - Login admin

## Credentials
- Admin: admin / autoduran2024
- Email notificaciones: jesusap98@hotmail.com

## P0 - Completed
- [x] Catálogo de vehículos
- [x] Cotizador de financiamiento
- [x] Sistema de apartado
- [x] Solicitud de crédito
- [x] Panel admin

## P1 - Next Phase
- [ ] Notificaciones WhatsApp automáticas
- [ ] Galería de fotos por vehículo
- [ ] Historial de apartados por cliente
- [ ] Integración Resend con API key real

## P2 - Future
- [ ] Sistema de citas para prueba de manejo
- [ ] Comparador de vehículos
- [ ] Chat en vivo
