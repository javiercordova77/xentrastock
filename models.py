from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Proveedor(db.Model):
    """Modelo para Proveedores (Suppliers)"""
    __tablename__ = 'proveedores'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    rfc = db.Column(db.String(13), unique=True)
    telefono = db.Column(db.String(20))
    email = db.Column(db.String(100))
    direccion = db.Column(db.Text)
    contacto = db.Column(db.String(100))
    activo = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    productos = db.relationship('Producto', backref='proveedor', lazy=True)
    
    def __repr__(self):
        return f'<Proveedor {self.nombre}>'


class Categoria(db.Model):
    """Modelo para Categorías de productos"""
    __tablename__ = 'categorias'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False, unique=True)
    descripcion = db.Column(db.Text)
    activo = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    productos = db.relationship('Producto', backref='categoria', lazy=True)
    
    def __repr__(self):
        return f'<Categoria {self.nombre}>'


class Ubicacion(db.Model):
    """Modelo para Ubicaciones de almacenamiento"""
    __tablename__ = 'ubicaciones'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    codigo = db.Column(db.String(20), unique=True, nullable=False)
    descripcion = db.Column(db.Text)
    capacidad = db.Column(db.Integer)
    activo = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    inventarios = db.relationship('Inventario', backref='ubicacion', lazy=True)
    transferencias_origen = db.relationship('Transferencia', foreign_keys='Transferencia.ubicacion_origen_id', backref='ubicacion_origen', lazy=True)
    transferencias_destino = db.relationship('Transferencia', foreign_keys='Transferencia.ubicacion_destino_id', backref='ubicacion_destino', lazy=True)
    
    def __repr__(self):
        return f'<Ubicacion {self.nombre}>'


class Producto(db.Model):
    """Modelo para Productos"""
    __tablename__ = 'productos'
    
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(50), unique=True, nullable=False)
    nombre = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text)
    precio_compra = db.Column(db.Float, default=0.0)
    precio_venta = db.Column(db.Float, default=0.0)
    stock_minimo = db.Column(db.Integer, default=0)
    stock_maximo = db.Column(db.Integer, default=100)
    unidad_medida = db.Column(db.String(20), default='PZA')
    activo = db.Column(db.Boolean, default=True)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categorias.id'), nullable=True)
    proveedor_id = db.Column(db.Integer, db.ForeignKey('proveedores.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    variantes = db.relationship('Variante', backref='producto', lazy=True, cascade='all, delete-orphan')
    inventarios = db.relationship('Inventario', backref='producto', lazy=True)
    movimientos = db.relationship('Movimiento', backref='producto', lazy=True)
    
    def __repr__(self):
        return f'<Producto {self.codigo} - {self.nombre}>'


class Variante(db.Model):
    """Modelo para Variantes de productos"""
    __tablename__ = 'variantes'
    
    id = db.Column(db.Integer, primary_key=True)
    producto_id = db.Column(db.Integer, db.ForeignKey('productos.id'), nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    codigo = db.Column(db.String(50), unique=True, nullable=False)
    atributo_1 = db.Column(db.String(50))  # Ej: Color
    valor_1 = db.Column(db.String(50))     # Ej: Rojo
    atributo_2 = db.Column(db.String(50))  # Ej: Talla
    valor_2 = db.Column(db.String(50))     # Ej: M
    precio_adicional = db.Column(db.Float, default=0.0)
    activo = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    inventarios = db.relationship('Inventario', backref='variante', lazy=True)
    movimientos = db.relationship('Movimiento', backref='variante', lazy=True)
    
    def __repr__(self):
        return f'<Variante {self.codigo} - {self.nombre}>'


class Inventario(db.Model):
    """Modelo para control de Inventario"""
    __tablename__ = 'inventario'
    
    id = db.Column(db.Integer, primary_key=True)
    producto_id = db.Column(db.Integer, db.ForeignKey('productos.id'), nullable=False)
    variante_id = db.Column(db.Integer, db.ForeignKey('variantes.id'), nullable=True)
    ubicacion_id = db.Column(db.Integer, db.ForeignKey('ubicaciones.id'), nullable=False)
    cantidad = db.Column(db.Integer, default=0)
    lote = db.Column(db.String(50))
    fecha_vencimiento = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def get_estado_stock(self):
        """Determina el estado del stock basado en el producto"""
        if not self.producto:
            return 'SIN_DEFINIR'
        
        if self.cantidad <= 0:
            return 'SIN_STOCK'
        elif self.cantidad <= self.producto.stock_minimo:
            return 'STOCK_BAJO'
        elif self.cantidad >= self.producto.stock_maximo:
            return 'STOCK_ALTO'
        else:
            return 'STOCK_NORMAL'
    
    def __repr__(self):
        return f'<Inventario Producto:{self.producto_id} Ubicacion:{self.ubicacion_id} Cantidad:{self.cantidad}>'


class Movimiento(db.Model):
    """Modelo para Movimientos de inventario"""
    __tablename__ = 'movimientos'
    
    id = db.Column(db.Integer, primary_key=True)
    tipo = db.Column(db.String(20), nullable=False)  # ENTRADA, SALIDA, AJUSTE
    producto_id = db.Column(db.Integer, db.ForeignKey('productos.id'), nullable=False)
    variante_id = db.Column(db.Integer, db.ForeignKey('variantes.id'), nullable=True)
    cantidad = db.Column(db.Integer, nullable=False)
    motivo = db.Column(db.String(200))
    referencia = db.Column(db.String(100))
    usuario = db.Column(db.String(100))
    notas = db.Column(db.Text)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Movimiento {self.tipo} - Producto:{self.producto_id} - Cantidad:{self.cantidad}>'


class Transferencia(db.Model):
    """Modelo para Transferencias entre ubicaciones"""
    __tablename__ = 'transferencias'
    
    id = db.Column(db.Integer, primary_key=True)
    producto_id = db.Column(db.Integer, db.ForeignKey('productos.id'), nullable=False)
    variante_id = db.Column(db.Integer, db.ForeignKey('variantes.id'), nullable=True)
    ubicacion_origen_id = db.Column(db.Integer, db.ForeignKey('ubicaciones.id'), nullable=False)
    ubicacion_destino_id = db.Column(db.Integer, db.ForeignKey('ubicaciones.id'), nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)
    estado = db.Column(db.String(20), default='PENDIENTE')  # PENDIENTE, EN_PROCESO, COMPLETADA, CANCELADA
    usuario_solicita = db.Column(db.String(100))
    usuario_procesa = db.Column(db.String(100))
    fecha_solicitud = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_proceso = db.Column(db.DateTime, nullable=True)
    notas = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    producto = db.relationship('Producto', backref='transferencias')
    variante = db.relationship('Variante', backref='transferencias')
    
    def __repr__(self):
        return f'<Transferencia {self.id} - Estado:{self.estado}>'
