from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import Response
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import bcrypt
import jwt
import resend
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Resend configuration
resend.api_key = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'jesusap98@hotmail.com')

# Stripe configuration
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', 'sk_test_emergent')

# JWT Secret
JWT_SECRET = os.environ.get('JWT_SECRET', 'autos-duran-secret-key-2024')

# Create the main app
app = FastAPI(title="AUTOS DURAN API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============== MODELS ==============

class Vehicle(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    pin: str
    marca: str
    modelo: str
    year: int
    transmision: str
    color: str
    documentacion: str
    motor: float
    precio: float
    precio_facebook: float
    anticipo_minimo: float
    monto_financiar: float
    pago_mensual: float
    imagen_url: Optional[str] = None
    disponible: bool = True
    reservado: bool = False
    reservado_hasta: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class VehicleCreate(BaseModel):
    pin: str
    marca: str
    modelo: str
    year: int
    transmision: str
    color: str
    documentacion: str
    motor: float
    precio: float
    precio_facebook: float
    anticipo_minimo: float
    monto_financiar: float
    pago_mensual: float
    imagen_url: Optional[str] = None

class VehicleUpdate(BaseModel):
    pin: Optional[str] = None
    marca: Optional[str] = None
    modelo: Optional[str] = None
    year: Optional[int] = None
    transmision: Optional[str] = None
    color: Optional[str] = None
    documentacion: Optional[str] = None
    motor: Optional[float] = None
    precio: Optional[float] = None
    precio_facebook: Optional[float] = None
    anticipo_minimo: Optional[float] = None
    monto_financiar: Optional[float] = None
    pago_mensual: Optional[float] = None
    imagen_url: Optional[str] = None
    disponible: Optional[bool] = None
    reservado: Optional[bool] = None

class CreditApplication(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vehicle_id: Optional[str] = None
    # Datos personales
    nombre_completo: str
    fecha_nacimiento: str
    lugar_nacimiento: str
    estado_civil: str
    rfc: str
    curp: str
    telefono: str
    celular: str
    email: str
    domicilio: str
    colonia: str
    ciudad: str
    estado: str
    cp: str
    tiempo_residencia: str
    tipo_vivienda: str
    # Datos laborales
    empresa: str
    puesto: str
    antiguedad: str
    telefono_trabajo: str
    direccion_trabajo: str
    ingreso_mensual: float
    otros_ingresos: float
    # Referencias comerciales
    ref_comercial_1_nombre: str
    ref_comercial_1_telefono: str
    ref_comercial_2_nombre: str
    ref_comercial_2_telefono: str
    # Referencias personales
    ref_personal_1_nombre: str
    ref_personal_1_tiempo: str
    ref_personal_1_telefono: str
    ref_personal_1_celular: str
    ref_personal_2_nombre: str
    ref_personal_2_tiempo: str
    ref_personal_2_telefono: str
    ref_personal_2_celular: str
    # Referencias familiares
    ref_familiar_1_nombre: str
    ref_familiar_1_parentesco: str
    ref_familiar_1_domicilio: str
    ref_familiar_1_telefono: str
    ref_familiar_1_celular: str
    ref_familiar_2_nombre: str
    ref_familiar_2_parentesco: str
    ref_familiar_2_domicilio: str
    ref_familiar_2_telefono: str
    ref_familiar_2_celular: str
    # Metadata
    status: str = "pendiente"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CreditApplicationCreate(BaseModel):
    vehicle_id: Optional[str] = None
    nombre_completo: str
    fecha_nacimiento: str
    lugar_nacimiento: str
    estado_civil: str
    rfc: str
    curp: str
    telefono: str
    celular: str
    email: EmailStr
    domicilio: str
    colonia: str
    ciudad: str
    estado: str
    cp: str
    tiempo_residencia: str
    tipo_vivienda: str
    empresa: str
    puesto: str
    antiguedad: str
    telefono_trabajo: str
    direccion_trabajo: str
    ingreso_mensual: float
    otros_ingresos: float = 0
    ref_comercial_1_nombre: str
    ref_comercial_1_telefono: str
    ref_comercial_2_nombre: str
    ref_comercial_2_telefono: str
    ref_personal_1_nombre: str
    ref_personal_1_tiempo: str
    ref_personal_1_telefono: str
    ref_personal_1_celular: str
    ref_personal_2_nombre: str
    ref_personal_2_tiempo: str
    ref_personal_2_telefono: str
    ref_personal_2_celular: str
    ref_familiar_1_nombre: str
    ref_familiar_1_parentesco: str
    ref_familiar_1_domicilio: str
    ref_familiar_1_telefono: str
    ref_familiar_1_celular: str
    ref_familiar_2_nombre: str
    ref_familiar_2_parentesco: str
    ref_familiar_2_domicilio: str
    ref_familiar_2_telefono: str
    ref_familiar_2_celular: str

class Reservation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vehicle_id: str
    customer_name: str
    customer_phone: str
    customer_email: str
    days: int
    amount: float
    payment_status: str = "pending"
    session_id: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    expires_at: Optional[str] = None

class ReservationCreate(BaseModel):
    vehicle_id: str
    customer_name: str
    customer_phone: str
    customer_email: EmailStr
    days: int  # 1-5 days

class PaymentTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    reservation_id: str
    vehicle_id: str
    amount: float
    currency: str = "mxn"
    payment_status: str = "pending"
    metadata: Dict[str, Any] = {}
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: Optional[str] = None

class AdminUser(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AdminLogin(BaseModel):
    username: str
    password: str

class FinancingCalculation(BaseModel):
    precio_vehiculo: float
    anticipo: float
    plazo_meses: int

class CheckoutRequest(BaseModel):
    reservation_id: str
    origin_url: str

# ============== HELPER FUNCTIONS ==============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc).timestamp() + 86400  # 24 hours
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def verify_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload.get("user_id")
    except:
        return None

async def get_current_admin(request: Request) -> str:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No autorizado")
    token = auth_header.split(" ")[1]
    user_id = verify_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Token inválido")
    return user_id

async def send_notification_email(subject: str, html_content: str):
    """Send notification email to admin"""
    if not resend.api_key:
        logger.warning("Resend API key not configured, skipping email")
        return
    
    params = {
        "from": SENDER_EMAIL,
        "to": [ADMIN_EMAIL],
        "subject": subject,
        "html": html_content
    }
    try:
        await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Email sent: {subject}")
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")

# ============== VEHICLE ROUTES ==============

@api_router.get("/vehicles", response_model=List[Vehicle])
async def get_vehicles(
    marca: Optional[str] = None,
    year_min: Optional[int] = None,
    year_max: Optional[int] = None,
    precio_min: Optional[float] = None,
    precio_max: Optional[float] = None,
    transmision: Optional[str] = None,
    disponible: Optional[bool] = None
):
    query = {}
    if marca:
        query["marca"] = {"$regex": marca, "$options": "i"}
    if year_min:
        query["year"] = {"$gte": year_min}
    if year_max:
        query.setdefault("year", {})["$lte"] = year_max
    if precio_min:
        query["precio_facebook"] = {"$gte": precio_min}
    if precio_max:
        query.setdefault("precio_facebook", {})["$lte"] = precio_max
    if transmision:
        query["transmision"] = {"$regex": transmision, "$options": "i"}
    if disponible is not None:
        query["disponible"] = disponible
    
    vehicles = await db.vehicles.find(query, {"_id": 0}).to_list(100)
    return vehicles

@api_router.get("/vehicles/{vehicle_id}", response_model=Vehicle)
async def get_vehicle(vehicle_id: str):
    vehicle = await db.vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    return vehicle

@api_router.post("/vehicles", response_model=Vehicle)
async def create_vehicle(vehicle: VehicleCreate, admin_id: str = Depends(get_current_admin)):
    vehicle_obj = Vehicle(**vehicle.model_dump())
    doc = vehicle_obj.model_dump()
    await db.vehicles.insert_one(doc)
    return vehicle_obj

@api_router.put("/vehicles/{vehicle_id}", response_model=Vehicle)
async def update_vehicle(vehicle_id: str, vehicle: VehicleUpdate, admin_id: str = Depends(get_current_admin)):
    update_data = {k: v for k, v in vehicle.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No hay datos para actualizar")
    
    result = await db.vehicles.update_one(
        {"id": vehicle_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    updated = await db.vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    return updated

@api_router.delete("/vehicles/{vehicle_id}")
async def delete_vehicle(vehicle_id: str, admin_id: str = Depends(get_current_admin)):
    result = await db.vehicles.delete_one({"id": vehicle_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    return {"message": "Vehículo eliminado"}

# ============== IMAGE UPLOAD ==============

@api_router.post("/upload-image")
async def upload_image(file: UploadFile = File(...), admin_id: str = Depends(get_current_admin)):
    """Upload an image and return a URL to access it"""
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Tipo de archivo no permitido. Use JPG, PNG o WebP")
    
    # Read file content
    content = await file.read()
    
    # Check file size (max 5MB)
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="La imagen es muy grande. Máximo 5MB")
    
    # Generate unique ID for the image
    image_id = str(uuid.uuid4())
    
    # Store in MongoDB
    image_doc = {
        "id": image_id,
        "filename": file.filename,
        "content_type": file.content_type,
        "data": base64.b64encode(content).decode('utf-8'),
        "size": len(content),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.images.insert_one(image_doc)
    
    # Return the URL to access the image
    return {
        "image_id": image_id,
        "filename": file.filename,
        "url": f"/api/images/{image_id}"
    }

@api_router.get("/images/{image_id}")
async def get_image(image_id: str):
    """Retrieve an uploaded image"""
    image = await db.images.find_one({"id": image_id}, {"_id": 0})
    if not image:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    
    # Decode base64 data
    image_data = base64.b64decode(image["data"])
    
    return Response(
        content=image_data,
        media_type=image["content_type"],
        headers={
            "Cache-Control": "public, max-age=31536000",
            "Content-Disposition": f"inline; filename={image['filename']}"
        }
    )

# ============== FINANCING CALCULATOR ==============

@api_router.post("/calculate-financing")
async def calculate_financing(calc: FinancingCalculation):
    """Calculate monthly payments with 1.4% monthly interest"""
    MONTHLY_INTEREST = 0.014  # 1.4% mensual
    
    monto_financiar = calc.precio_vehiculo - calc.anticipo
    
    if monto_financiar <= 0:
        return {
            "monto_financiar": 0,
            "pago_mensual": 0,
            "total_a_pagar": calc.anticipo,
            "interes_total": 0
        }
    
    # Simple interest calculation (monto + interés mensual * plazo)
    interes_total = monto_financiar * MONTHLY_INTEREST * calc.plazo_meses
    total_a_pagar = monto_financiar + interes_total
    pago_mensual = total_a_pagar / calc.plazo_meses
    
    return {
        "monto_financiar": round(monto_financiar, 2),
        "pago_mensual": round(pago_mensual, 2),
        "total_a_pagar": round(total_a_pagar + calc.anticipo, 2),
        "interes_total": round(interes_total, 2),
        "tasa_mensual": MONTHLY_INTEREST * 100
    }

# ============== CREDIT APPLICATION ROUTES ==============

@api_router.post("/credit-applications", response_model=CreditApplication)
async def create_credit_application(application: CreditApplicationCreate):
    app_obj = CreditApplication(**application.model_dump())
    doc = app_obj.model_dump()
    await db.credit_applications.insert_one(doc)
    
    # Send notification email
    vehicle_info = ""
    if application.vehicle_id:
        vehicle = await db.vehicles.find_one({"id": application.vehicle_id}, {"_id": 0})
        if vehicle:
            vehicle_info = f"<p><strong>Vehículo de interés:</strong> {vehicle.get('year')} {vehicle.get('marca')} {vehicle.get('modelo')}</p>"
    
    html_content = f"""
    <h2>Nueva Solicitud de Crédito</h2>
    <p><strong>Nombre:</strong> {application.nombre_completo}</p>
    <p><strong>Teléfono:</strong> {application.telefono}</p>
    <p><strong>Celular:</strong> {application.celular}</p>
    <p><strong>Email:</strong> {application.email}</p>
    <p><strong>Ingreso Mensual:</strong> ${application.ingreso_mensual:,.2f} MXN</p>
    {vehicle_info}
    <p><em>Fecha: {datetime.now(timezone.utc).strftime('%d/%m/%Y %H:%M')}</em></p>
    """
    await send_notification_email("Nueva Solicitud de Crédito - AUTOS DURAN", html_content)
    
    return app_obj

@api_router.get("/credit-applications", response_model=List[CreditApplication])
async def get_credit_applications(admin_id: str = Depends(get_current_admin)):
    applications = await db.credit_applications.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return applications

@api_router.put("/credit-applications/{app_id}/status")
async def update_application_status(app_id: str, status: str, admin_id: str = Depends(get_current_admin)):
    result = await db.credit_applications.update_one(
        {"id": app_id},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    return {"message": "Estado actualizado"}

# ============== RESERVATION ROUTES ==============

@api_router.post("/reservations", response_model=Reservation)
async def create_reservation(reservation: ReservationCreate):
    # Validate days (1-5)
    if reservation.days < 1 or reservation.days > 5:
        raise HTTPException(status_code=400, detail="Los días deben ser entre 1 y 5")
    
    # Check if vehicle is available
    vehicle = await db.vehicles.find_one({"id": reservation.vehicle_id}, {"_id": 0})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    if vehicle.get("reservado"):
        raise HTTPException(status_code=400, detail="Este vehículo ya está apartado")
    
    # Calculate amount ($1,000 MXN per day)
    amount = reservation.days * 1000.0
    
    res_obj = Reservation(
        **reservation.model_dump(),
        amount=amount
    )
    doc = res_obj.model_dump()
    await db.reservations.insert_one(doc)
    
    return res_obj

@api_router.get("/reservations", response_model=List[Reservation])
async def get_reservations(admin_id: str = Depends(get_current_admin)):
    reservations = await db.reservations.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return reservations

@api_router.get("/reservations/{reservation_id}", response_model=Reservation)
async def get_reservation(reservation_id: str):
    reservation = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservación no encontrada")
    return reservation

# ============== STRIPE PAYMENT ROUTES ==============

@api_router.post("/checkout/create-session")
async def create_checkout_session(request: CheckoutRequest, http_request: Request):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
    
    # Get reservation
    reservation = await db.reservations.find_one({"id": request.reservation_id}, {"_id": 0})
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservación no encontrada")
    
    # Check if already paid
    if reservation.get("payment_status") == "paid":
        raise HTTPException(status_code=400, detail="Esta reservación ya fue pagada")
    
    # Get vehicle to verify it's not reserved
    vehicle = await db.vehicles.find_one({"id": reservation.get("vehicle_id")}, {"_id": 0})
    if vehicle and vehicle.get("reservado"):
        raise HTTPException(status_code=400, detail="Este vehículo ya está apartado por otra persona")
    
    # Initialize Stripe
    host_url = str(http_request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    # Build URLs from origin
    origin = request.origin_url.rstrip('/')
    success_url = f"{origin}/pago-exitoso?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/vehiculo/{reservation.get('vehicle_id')}"
    
    # Create checkout session
    checkout_request = CheckoutSessionRequest(
        amount=float(reservation.get("amount")),
        currency="mxn",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "reservation_id": request.reservation_id,
            "vehicle_id": reservation.get("vehicle_id"),
            "customer_name": reservation.get("customer_name"),
            "customer_email": reservation.get("customer_email"),
            "days": str(reservation.get("days"))
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Update reservation with session_id
    await db.reservations.update_one(
        {"id": request.reservation_id},
        {"$set": {"session_id": session.session_id}}
    )
    
    # Create payment transaction record
    transaction = PaymentTransaction(
        session_id=session.session_id,
        reservation_id=request.reservation_id,
        vehicle_id=reservation.get("vehicle_id"),
        amount=float(reservation.get("amount")),
        currency="mxn",
        payment_status="pending",
        metadata=checkout_request.metadata
    )
    await db.payment_transactions.insert_one(transaction.model_dump())
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, http_request: Request):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    # Check if already processed
    transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if transaction and transaction.get("payment_status") == "paid":
        return {
            "status": "complete",
            "payment_status": "paid",
            "amount_total": transaction.get("amount"),
            "currency": transaction.get("currency"),
            "already_processed": True
        }
    
    # Initialize Stripe
    host_url = str(http_request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    # Get status from Stripe
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update if payment is complete
    if status.payment_status == "paid":
        await process_successful_payment(session_id)
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency
    }

async def process_successful_payment(session_id: str):
    """Process successful payment - update reservation and vehicle"""
    # Get transaction
    transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not transaction:
        logger.error(f"Transaction not found for session: {session_id}")
        return
    
    # Check if already processed
    if transaction.get("payment_status") == "paid":
        logger.info(f"Transaction already processed: {session_id}")
        return
    
    reservation_id = transaction.get("reservation_id")
    vehicle_id = transaction.get("vehicle_id")
    
    # Calculate expiration date
    reservation = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    days = reservation.get("days", 1) if reservation else 1
    from datetime import timedelta
    expires_at = (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()
    
    # Update transaction
    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {"$set": {
            "payment_status": "paid",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Update reservation
    await db.reservations.update_one(
        {"id": reservation_id},
        {"$set": {
            "payment_status": "paid",
            "expires_at": expires_at
        }}
    )
    
    # Mark vehicle as reserved
    await db.vehicles.update_one(
        {"id": vehicle_id},
        {"$set": {
            "reservado": True,
            "reservado_hasta": expires_at
        }}
    )
    
    # Send notification email
    vehicle = await db.vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    vehicle_name = f"{vehicle.get('year')} {vehicle.get('marca')} {vehicle.get('modelo')}" if vehicle else "N/A"
    
    html_content = f"""
    <h2>Nuevo Apartado de Vehículo</h2>
    <p><strong>Vehículo:</strong> {vehicle_name}</p>
    <p><strong>Cliente:</strong> {transaction.get('metadata', {}).get('customer_name', 'N/A')}</p>
    <p><strong>Email:</strong> {transaction.get('metadata', {}).get('customer_email', 'N/A')}</p>
    <p><strong>Días apartado:</strong> {days}</p>
    <p><strong>Monto pagado:</strong> ${transaction.get('amount'):,.2f} MXN</p>
    <p><strong>Expira:</strong> {expires_at}</p>
    <p><em>Fecha de pago: {datetime.now(timezone.utc).strftime('%d/%m/%Y %H:%M')}</em></p>
    """
    await send_notification_email("Nuevo Apartado Pagado - AUTOS DURAN", html_content)
    
    logger.info(f"Payment processed successfully for reservation: {reservation_id}")

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            await process_successful_payment(webhook_response.session_id)
        
        return {"status": "received"}
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# ============== ADMIN ROUTES ==============

@api_router.post("/admin/login")
async def admin_login(login: AdminLogin):
    admin = await db.admins.find_one({"username": login.username}, {"_id": 0})
    if not admin:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    if not verify_password(login.password, admin.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    token = create_token(admin.get("id"))
    return {"token": token, "username": admin.get("username")}

@api_router.get("/admin/dashboard")
async def admin_dashboard(admin_id: str = Depends(get_current_admin)):
    # Get counts
    total_vehicles = await db.vehicles.count_documents({})
    available_vehicles = await db.vehicles.count_documents({"disponible": True, "reservado": False})
    reserved_vehicles = await db.vehicles.count_documents({"reservado": True})
    pending_applications = await db.credit_applications.count_documents({"status": "pendiente"})
    total_applications = await db.credit_applications.count_documents({})
    paid_reservations = await db.reservations.count_documents({"payment_status": "paid"})
    
    # Calculate total revenue from reservations
    pipeline = [
        {"$match": {"payment_status": "paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    revenue_result = await db.reservations.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0].get("total", 0) if revenue_result else 0
    
    return {
        "total_vehicles": total_vehicles,
        "available_vehicles": available_vehicles,
        "reserved_vehicles": reserved_vehicles,
        "pending_applications": pending_applications,
        "total_applications": total_applications,
        "paid_reservations": paid_reservations,
        "total_revenue": total_revenue
    }

@api_router.post("/admin/setup")
async def setup_admin():
    """Create initial admin user if none exists"""
    existing = await db.admins.find_one({})
    if existing:
        return {"message": "Admin ya existe"}
    
    admin = AdminUser(
        username="admin",
        password_hash=hash_password("autoduran2024")
    )
    await db.admins.insert_one(admin.model_dump())
    return {"message": "Admin creado", "username": "admin", "password": "autoduran2024"}

# ============== SEED DATA ==============

@api_router.post("/seed-vehicles")
async def seed_vehicles(admin_id: str = Depends(get_current_admin)):
    """Seed initial vehicle inventory from Excel data"""
    
    # Check if vehicles already exist
    existing = await db.vehicles.count_documents({})
    if existing > 0:
        return {"message": f"Ya existen {existing} vehículos en la base de datos"}
    
    vehicles_data = [
        {"pin": "X95", "marca": "BMW", "modelo": "330i SPORTLINE AUT", "year": 2017, "transmision": "Automático", "color": "Azul", "documentacion": "REF YUC", "motor": 2.0, "precio": 285000, "precio_facebook": 295000, "anticipo_minimo": 118000, "monto_financiar": 177000, "pago_mensual": 2478},
        {"pin": "Z19", "marca": "LINCOLN", "modelo": "MKC RESERVE", "year": 2018, "transmision": "Automático", "color": "Gris", "documentacion": "FACT YUC", "motor": 2.0, "precio": 285000, "precio_facebook": 295000, "anticipo_minimo": 118000, "monto_financiar": 177000, "pago_mensual": 2478},
        {"pin": "A29", "marca": "BMW", "modelo": "X3 SDRIVE 28I AUT", "year": 2017, "transmision": "Automático", "color": "Blanco", "documentacion": "FACT QROO", "motor": 2.0, "precio": 325000, "precio_facebook": 335000, "anticipo_minimo": 135000, "monto_financiar": 200000, "pago_mensual": 2800},
        {"pin": "A39", "marca": "AUDI", "modelo": "A5 ELITE QUATTRO AUT", "year": 2018, "transmision": "Automático", "color": "Blanco", "documentacion": "REF YUC", "motor": 2.0, "precio": 410000, "precio_facebook": 420000, "anticipo_minimo": 220000, "monto_financiar": 200000, "pago_mensual": 2800},
        {"pin": "A49", "marca": "GMC", "modelo": "ACADIA DENALI AUT", "year": 2018, "transmision": "Automático", "color": "Gris", "documentacion": "FACT YUC", "motor": 3.6, "precio": 325000, "precio_facebook": 335000, "anticipo_minimo": 135000, "monto_financiar": 200000, "pago_mensual": 2800},
        {"pin": "A69", "marca": "NISSAN", "modelo": "KICKS E POWER EXCLUSIVE", "year": 2024, "transmision": "Automático", "color": "Azul", "documentacion": "FACT CAMP", "motor": 1.2, "precio": 425000, "precio_facebook": 435000, "anticipo_minimo": 245000, "monto_financiar": 190000, "pago_mensual": 2660},
        {"pin": "A85", "marca": "NISSAN", "modelo": "FRONTIER PRO 4X AUT", "year": 2023, "transmision": "Automático", "color": "Blanco", "documentacion": "FACT CAMP", "motor": 2.5, "precio": 520000, "precio_facebook": 530000, "anticipo_minimo": 340000, "monto_financiar": 190000, "pago_mensual": 2660},
        {"pin": "A91", "marca": "FORD", "modelo": "F150 XL CREW CAB 4X2", "year": 2019, "transmision": "Automático", "color": "Gris", "documentacion": "FACT YUC", "motor": 3.3, "precio": 430000, "precio_facebook": 440000, "anticipo_minimo": 240000, "monto_financiar": 200000, "pago_mensual": 2800},
        {"pin": "A94", "marca": "TOYOTA", "modelo": "PRIUS TIPO C AUT", "year": 2020, "transmision": "Automático", "color": "Blanco", "documentacion": "REF YUC", "motor": 1.5, "precio": 235000, "precio_facebook": 245000, "anticipo_minimo": 98000, "monto_financiar": 147000, "pago_mensual": 2058},
        {"pin": "A97", "marca": "JEEP", "modelo": "WRANGLER BASE 4X4 AUT", "year": 2004, "transmision": "Automático", "color": "Gris", "documentacion": "REF QROO", "motor": 4.0, "precio": 275000, "precio_facebook": 285000, "anticipo_minimo": 114000, "monto_financiar": 171000, "pago_mensual": 2394},
        {"pin": "B26", "marca": "VW", "modelo": "JETTA TRENDLINE AUT", "year": 2018, "transmision": "Automático", "color": "Blanco", "documentacion": "REF YUC", "motor": 2.5, "precio": 205000, "precio_facebook": 215000, "anticipo_minimo": 86000, "monto_financiar": 129000, "pago_mensual": 1806},
        {"pin": "B27", "marca": "TOYOTA", "modelo": "SIENNA LE AUT", "year": 2015, "transmision": "Automático", "color": "Blanco", "documentacion": "REF QROO", "motor": 3.5, "precio": 240000, "precio_facebook": 250000, "anticipo_minimo": 100000, "monto_financiar": 150000, "pago_mensual": 2100},
        {"pin": "B30", "marca": "SUZUKI", "modelo": "ERTIGA BOOSTER GREEN GLX", "year": 2024, "transmision": "Automático", "color": "Blanco", "documentacion": "FACT CAMP", "motor": 1.5, "precio": 340000, "precio_facebook": 350000, "anticipo_minimo": 150000, "monto_financiar": 200000, "pago_mensual": 2800},
        {"pin": "B33", "marca": "HONDA", "modelo": "CRV EX AUT", "year": 2019, "transmision": "Automático", "color": "Rojo", "documentacion": "FACT QROO", "motor": 2.0, "precio": 330000, "precio_facebook": 340000, "anticipo_minimo": 140000, "monto_financiar": 200000, "pago_mensual": 2800},
        {"pin": "B37", "marca": "SEAT", "modelo": "IBIZA XCELLENCE AUT", "year": 2019, "transmision": "Automático", "color": "Negro", "documentacion": "FACT YUC", "motor": 1.6, "precio": 240000, "precio_facebook": 250000, "anticipo_minimo": 100000, "monto_financiar": 150000, "pago_mensual": 2100},
        {"pin": "B40", "marca": "HYUNDAI", "modelo": "HB-20 GL MID AUT", "year": 2024, "transmision": "Automático", "color": "Gris", "documentacion": "FACT YUC", "motor": 1.5, "precio": 320000, "precio_facebook": 330000, "anticipo_minimo": 132000, "monto_financiar": 198000, "pago_mensual": 2772},
        {"pin": "B47", "marca": "SUZUKI", "modelo": "VITARA BOOSTERJET AUT", "year": 2020, "transmision": "Automático", "color": "Rojo", "documentacion": "REF YUC", "motor": 1.4, "precio": 280000, "precio_facebook": 290000, "anticipo_minimo": 116000, "monto_financiar": 174000, "pago_mensual": 2436},
        {"pin": "B52", "marca": "HONDA", "modelo": "CITY TOURING AUT", "year": 2022, "transmision": "Automático", "color": "Blanco", "documentacion": "FACT YUC", "motor": 1.5, "precio": 310000, "precio_facebook": 320000, "anticipo_minimo": 128000, "monto_financiar": 192000, "pago_mensual": 2688},
        {"pin": "B53", "marca": "MAZDA", "modelo": "CX5 I GRAND TOURING AUT", "year": 2018, "transmision": "Automático", "color": "Gris", "documentacion": "FACT YUC", "motor": 2.0, "precio": 300000, "precio_facebook": 310000, "anticipo_minimo": 124000, "monto_financiar": 186000, "pago_mensual": 2604},
        {"pin": "B54", "marca": "TOYOTA", "modelo": "AVANZA LE AUT", "year": 2018, "transmision": "Automático", "color": "Blanco", "documentacion": "FACT YUC", "motor": 1.5, "precio": 220000, "precio_facebook": 230000, "anticipo_minimo": 92000, "monto_financiar": 138000, "pago_mensual": 1932},
        {"pin": "B57", "marca": "TOYOTA", "modelo": "PRIUS PREMIUM BITONO AUT", "year": 2022, "transmision": "Automático", "color": "Rojo", "documentacion": "REF CAMP", "motor": 1.8, "precio": 355000, "precio_facebook": 365000, "anticipo_minimo": 165000, "monto_financiar": 200000, "pago_mensual": 2800},
        {"pin": "B61", "marca": "MAZDA", "modelo": "3 SEDAN I GRAND TOURING", "year": 2024, "transmision": "Automático", "color": "Rojo", "documentacion": "FACT YUC", "motor": 2.5, "precio": 380000, "precio_facebook": 390000, "anticipo_minimo": 190000, "monto_financiar": 200000, "pago_mensual": 2800},
        {"pin": "B62", "marca": "CHEVROLET", "modelo": "CAPTIVA PREMIER AUT", "year": 2025, "transmision": "Automático", "color": "Azul", "documentacion": "FACT CAMP", "motor": 1.5, "precio": 425000, "precio_facebook": 435000, "anticipo_minimo": 235000, "monto_financiar": 200000, "pago_mensual": 2800},
        {"pin": "B72", "marca": "NISSAN", "modelo": "VERSA ADVANCE AUT", "year": 2023, "transmision": "Automático", "color": "Blanco", "documentacion": "FACT YUC", "motor": 1.6, "precio": 305000, "precio_facebook": 315000, "anticipo_minimo": 126000, "monto_financiar": 189000, "pago_mensual": 2646},
        {"pin": "B73", "marca": "HONDA", "modelo": "HRV TOURING AUT", "year": 2024, "transmision": "Automático", "color": "Verde", "documentacion": "FACT CAMP", "motor": 2.0, "precio": 495000, "precio_facebook": 505000, "anticipo_minimo": 305000, "monto_financiar": 200000, "pago_mensual": 2800},
        {"pin": "B76", "marca": "HONDA", "modelo": "ACCORD TOURING AUT", "year": 2019, "transmision": "Automático", "color": "Blanco", "documentacion": "FACT YUC", "motor": 2.0, "precio": 360000, "precio_facebook": 370000, "anticipo_minimo": 170000, "monto_financiar": 200000, "pago_mensual": 2800},
        {"pin": "B80", "marca": "VW", "modelo": "TAOS COMFORTLINE AUT", "year": 2021, "transmision": "Automático", "color": "Gris", "documentacion": "FACT CAMP", "motor": 1.4, "precio": 345000, "precio_facebook": 355000, "anticipo_minimo": 155000, "monto_financiar": 200000, "pago_mensual": 2800},
        {"pin": "B81", "marca": "NISSAN", "modelo": "NP300 REDILAS STD", "year": 2020, "transmision": "Estándar", "color": "Blanco", "documentacion": "REF YUC", "motor": 2.5, "precio": 310000, "precio_facebook": 320000, "anticipo_minimo": 140000, "monto_financiar": 180000, "pago_mensual": 2520},
        {"pin": "B82", "marca": "RENAULT", "modelo": "OROCH OUTSIDER AUT", "year": 2019, "transmision": "Automático", "color": "Rojo", "documentacion": "FACT YUC", "motor": 2.0, "precio": 255000, "precio_facebook": 265000, "anticipo_minimo": 106000, "monto_financiar": 159000, "pago_mensual": 2226},
        {"pin": "B83", "marca": "SUZUKI", "modelo": "SWIFT BOOSTERJET AUT", "year": 2018, "transmision": "Automático", "color": "Blanco", "documentacion": "FACT YUC", "motor": 1.4, "precio": 210000, "precio_facebook": 220000, "anticipo_minimo": 88000, "monto_financiar": 132000, "pago_mensual": 1848},
        {"pin": "B86", "marca": "NISSAN", "modelo": "MARCH EXCLUSIVE STD", "year": 2022, "transmision": "Estándar", "color": "Azul", "documentacion": "REF YUC", "motor": 1.6, "precio": 230000, "precio_facebook": 240000, "anticipo_minimo": 96000, "monto_financiar": 144000, "pago_mensual": 2016},
        {"pin": "B89", "marca": "NISSAN", "modelo": "MARCH ADVANCE STD", "year": 2020, "transmision": "Estándar", "color": "Azul", "documentacion": "FACT YUC", "motor": 1.6, "precio": 195000, "precio_facebook": 205000, "anticipo_minimo": 82000, "monto_financiar": 123000, "pago_mensual": 1722},
        {"pin": "B90", "marca": "MAZDA", "modelo": "3 GRAND TOURING HB AUT", "year": 2016, "transmision": "Automático", "color": "Gris", "documentacion": "REF YUC", "motor": 2.5, "precio": 210000, "precio_facebook": 220000, "anticipo_minimo": 88000, "monto_financiar": 132000, "pago_mensual": 1848},
        {"pin": "B91", "marca": "MAZDA", "modelo": "CX5 GRAND TOURING AUT", "year": 2016, "transmision": "Automático", "color": "Gris", "documentacion": "FACT YUC", "motor": 2.5, "precio": 235000, "precio_facebook": 245000, "anticipo_minimo": 98000, "monto_financiar": 147000, "pago_mensual": 2058},
        {"pin": "B93", "marca": "SUZUKI", "modelo": "SWIFT BOOSTERJET STD", "year": 2023, "transmision": "Estándar", "color": "Gris", "documentacion": "FACT QROO", "motor": 1.0, "precio": 270000, "precio_facebook": 280000, "anticipo_minimo": 112000, "monto_financiar": 168000, "pago_mensual": 2352},
        {"pin": "B95", "marca": "CHEVROLET", "modelo": "AVEO SEDAN LT STD", "year": 2025, "transmision": "Estándar", "color": "Rojo", "documentacion": "FACT YUC", "motor": 1.5, "precio": 275000, "precio_facebook": 285000, "anticipo_minimo": 114000, "monto_financiar": 171000, "pago_mensual": 2394},
    ]
    
    car_images = [
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
        "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800",
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
        "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
        "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800",
        "https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800",
        "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800",
    ]
    
    for i, v_data in enumerate(vehicles_data):
        vehicle = Vehicle(
            **v_data,
            imagen_url=car_images[i % len(car_images)]
        )
        await db.vehicles.insert_one(vehicle.model_dump())
    
    return {"message": f"Se insertaron {len(vehicles_data)} vehículos"}

# ============== ROOT ROUTE ==============

@api_router.get("/")
async def root():
    return {"message": "AUTOS DURAN API", "status": "running"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
