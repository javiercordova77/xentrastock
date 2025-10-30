from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from datetime import datetime, date
from config import Config
from models import db, Proveedor, Categoria, Ubicacion, Producto, Variante, Inventario, Movimiento, Transferencia
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
import io
from flask import make_response

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

# Crear las tablas al iniciar la aplicación
with app.app_context():
    db.create_all()

@app.route('/')
def index():
    """Página principal"""
    return render_template('index.html')


# ==================== PROVEEDORES (SUPPLIERS) ====================

@app.route('/proveedores')
def proveedores_list():
    """Listar todos los proveedores"""
    proveedores = Proveedor.query.all()
    return render_template('proveedores/list.html', proveedores=proveedores)

@app.route('/proveedores/create', methods=['GET', 'POST'])
def proveedores_create():
    """Crear un nuevo proveedor"""
    if request.method == 'POST':
        proveedor = Proveedor(
            nombre=request.form['nombre'],
            rfc=request.form.get('rfc'),
            telefono=request.form.get('telefono'),
            email=request.form.get('email'),
            direccion=request.form.get('direccion'),
            contacto=request.form.get('contacto'),
            activo=request.form.get('activo') == 'on'
        )
        db.session.add(proveedor)
        db.session.commit()
        flash('Proveedor creado exitosamente', 'success')
        return redirect(url_for('proveedores_list'))
    return render_template('proveedores/form.html', proveedor=None)

@app.route('/proveedores/<int:id>/edit', methods=['GET', 'POST'])
def proveedores_edit(id):
    """Editar un proveedor existente"""
    proveedor = Proveedor.query.get_or_404(id)
    if request.method == 'POST':
        proveedor.nombre = request.form['nombre']
        proveedor.rfc = request.form.get('rfc')
        proveedor.telefono = request.form.get('telefono')
        proveedor.email = request.form.get('email')
        proveedor.direccion = request.form.get('direccion')
        proveedor.contacto = request.form.get('contacto')
        proveedor.activo = request.form.get('activo') == 'on'
        db.session.commit()
        flash('Proveedor actualizado exitosamente', 'success')
        return redirect(url_for('proveedores_list'))
    return render_template('proveedores/form.html', proveedor=proveedor)

@app.route('/proveedores/<int:id>/delete', methods=['POST'])
def proveedores_delete(id):
    """Eliminar un proveedor"""
    proveedor = Proveedor.query.get_or_404(id)
    db.session.delete(proveedor)
    db.session.commit()
    flash('Proveedor eliminado exitosamente', 'success')
    return redirect(url_for('proveedores_list'))


# ==================== CATEGORÍAS ====================

@app.route('/categorias')
def categorias_list():
    """Listar todas las categorías"""
    categorias = Categoria.query.all()
    return render_template('categorias/list.html', categorias=categorias)

@app.route('/categorias/create', methods=['GET', 'POST'])
def categorias_create():
    """Crear una nueva categoría"""
    if request.method == 'POST':
        categoria = Categoria(
            nombre=request.form['nombre'],
            descripcion=request.form.get('descripcion'),
            activo=request.form.get('activo') == 'on'
        )
        db.session.add(categoria)
        db.session.commit()
        flash('Categoría creada exitosamente', 'success')
        return redirect(url_for('categorias_list'))
    return render_template('categorias/form.html', categoria=None)

@app.route('/categorias/<int:id>/edit', methods=['GET', 'POST'])
def categorias_edit(id):
    """Editar una categoría existente"""
    categoria = Categoria.query.get_or_404(id)
    if request.method == 'POST':
        categoria.nombre = request.form['nombre']
        categoria.descripcion = request.form.get('descripcion')
        categoria.activo = request.form.get('activo') == 'on'
        db.session.commit()
        flash('Categoría actualizada exitosamente', 'success')
        return redirect(url_for('categorias_list'))
    return render_template('categorias/form.html', categoria=categoria)

@app.route('/categorias/<int:id>/delete', methods=['POST'])
def categorias_delete(id):
    """Eliminar una categoría"""
    categoria = Categoria.query.get_or_404(id)
    db.session.delete(categoria)
    db.session.commit()
    flash('Categoría eliminada exitosamente', 'success')
    return redirect(url_for('categorias_list'))


# ==================== UBICACIONES ====================

@app.route('/ubicaciones')
def ubicaciones_list():
    """Listar todas las ubicaciones"""
    ubicaciones = Ubicacion.query.all()
    return render_template('ubicaciones/list.html', ubicaciones=ubicaciones)

@app.route('/ubicaciones/create', methods=['GET', 'POST'])
def ubicaciones_create():
    """Crear una nueva ubicación"""
    if request.method == 'POST':
        ubicacion = Ubicacion(
            nombre=request.form['nombre'],
            codigo=request.form['codigo'],
            descripcion=request.form.get('descripcion'),
            capacidad=request.form.get('capacidad', type=int),
            activo=request.form.get('activo') == 'on'
        )
        db.session.add(ubicacion)
        db.session.commit()
        flash('Ubicación creada exitosamente', 'success')
        return redirect(url_for('ubicaciones_list'))
    return render_template('ubicaciones/form.html', ubicacion=None)

@app.route('/ubicaciones/<int:id>/edit', methods=['GET', 'POST'])
def ubicaciones_edit(id):
    """Editar una ubicación existente"""
    ubicacion = Ubicacion.query.get_or_404(id)
    if request.method == 'POST':
        ubicacion.nombre = request.form['nombre']
        ubicacion.codigo = request.form['codigo']
        ubicacion.descripcion = request.form.get('descripcion')
        ubicacion.capacidad = request.form.get('capacidad', type=int)
        ubicacion.activo = request.form.get('activo') == 'on'
        db.session.commit()
        flash('Ubicación actualizada exitosamente', 'success')
        return redirect(url_for('ubicaciones_list'))
    return render_template('ubicaciones/form.html', ubicacion=ubicacion)

@app.route('/ubicaciones/<int:id>/delete', methods=['POST'])
def ubicaciones_delete(id):
    """Eliminar una ubicación"""
    ubicacion = Ubicacion.query.get_or_404(id)
    db.session.delete(ubicacion)
    db.session.commit()
    flash('Ubicación eliminada exitosamente', 'success')
    return redirect(url_for('ubicaciones_list'))


# ==================== PRODUCTOS ====================

@app.route('/productos')
def productos_list():
    """Listar todos los productos"""
    productos = Producto.query.all()
    return render_template('productos/list.html', productos=productos)

@app.route('/productos/create', methods=['GET', 'POST'])
def productos_create():
    """Crear un nuevo producto"""
    if request.method == 'POST':
        producto = Producto(
            codigo=request.form['codigo'],
            nombre=request.form['nombre'],
            descripcion=request.form.get('descripcion'),
            precio_compra=request.form.get('precio_compra', type=float, default=0.0),
            precio_venta=request.form.get('precio_venta', type=float, default=0.0),
            stock_minimo=request.form.get('stock_minimo', type=int, default=0),
            stock_maximo=request.form.get('stock_maximo', type=int, default=100),
            unidad_medida=request.form.get('unidad_medida', default='PZA'),
            categoria_id=request.form.get('categoria_id', type=int),
            proveedor_id=request.form.get('proveedor_id', type=int),
            activo=request.form.get('activo') == 'on'
        )
        db.session.add(producto)
        db.session.commit()
        flash('Producto creado exitosamente', 'success')
        return redirect(url_for('productos_list'))
    
    categorias = Categoria.query.filter_by(activo=True).all()
    proveedores = Proveedor.query.filter_by(activo=True).all()
    return render_template('productos/form.html', producto=None, categorias=categorias, proveedores=proveedores)

@app.route('/productos/<int:id>/edit', methods=['GET', 'POST'])
def productos_edit(id):
    """Editar un producto existente"""
    producto = Producto.query.get_or_404(id)
    if request.method == 'POST':
        producto.codigo = request.form['codigo']
        producto.nombre = request.form['nombre']
        producto.descripcion = request.form.get('descripcion')
        producto.precio_compra = request.form.get('precio_compra', type=float, default=0.0)
        producto.precio_venta = request.form.get('precio_venta', type=float, default=0.0)
        producto.stock_minimo = request.form.get('stock_minimo', type=int, default=0)
        producto.stock_maximo = request.form.get('stock_maximo', type=int, default=100)
        producto.unidad_medida = request.form.get('unidad_medida', default='PZA')
        producto.categoria_id = request.form.get('categoria_id', type=int)
        producto.proveedor_id = request.form.get('proveedor_id', type=int)
        producto.activo = request.form.get('activo') == 'on'
        db.session.commit()
        flash('Producto actualizado exitosamente', 'success')
        return redirect(url_for('productos_list'))
    
    categorias = Categoria.query.filter_by(activo=True).all()
    proveedores = Proveedor.query.filter_by(activo=True).all()
    return render_template('productos/form.html', producto=producto, categorias=categorias, proveedores=proveedores)

@app.route('/productos/<int:id>/delete', methods=['POST'])
def productos_delete(id):
    """Eliminar un producto"""
    producto = Producto.query.get_or_404(id)
    db.session.delete(producto)
    db.session.commit()
    flash('Producto eliminado exitosamente', 'success')
    return redirect(url_for('productos_list'))


# ==================== VARIANTES ====================

@app.route('/variantes')
def variantes_list():
    """Listar todas las variantes"""
    variantes = Variante.query.all()
    return render_template('variantes/list.html', variantes=variantes)

@app.route('/variantes/create', methods=['GET', 'POST'])
def variantes_create():
    """Crear una nueva variante"""
    if request.method == 'POST':
        variante = Variante(
            producto_id=request.form['producto_id'],
            nombre=request.form['nombre'],
            codigo=request.form['codigo'],
            atributo_1=request.form.get('atributo_1'),
            valor_1=request.form.get('valor_1'),
            atributo_2=request.form.get('atributo_2'),
            valor_2=request.form.get('valor_2'),
            precio_adicional=request.form.get('precio_adicional', type=float, default=0.0),
            activo=request.form.get('activo') == 'on'
        )
        db.session.add(variante)
        db.session.commit()
        flash('Variante creada exitosamente', 'success')
        return redirect(url_for('variantes_list'))
    
    productos = Producto.query.filter_by(activo=True).all()
    return render_template('variantes/form.html', variante=None, productos=productos)

@app.route('/variantes/<int:id>/edit', methods=['GET', 'POST'])
def variantes_edit(id):
    """Editar una variante existente"""
    variante = Variante.query.get_or_404(id)
    if request.method == 'POST':
        variante.producto_id = request.form['producto_id']
        variante.nombre = request.form['nombre']
        variante.codigo = request.form['codigo']
        variante.atributo_1 = request.form.get('atributo_1')
        variante.valor_1 = request.form.get('valor_1')
        variante.atributo_2 = request.form.get('atributo_2')
        variante.valor_2 = request.form.get('valor_2')
        variante.precio_adicional = request.form.get('precio_adicional', type=float, default=0.0)
        variante.activo = request.form.get('activo') == 'on'
        db.session.commit()
        flash('Variante actualizada exitosamente', 'success')
        return redirect(url_for('variantes_list'))
    
    productos = Producto.query.filter_by(activo=True).all()
    return render_template('variantes/form.html', variante=variante, productos=productos)

@app.route('/variantes/<int:id>/delete', methods=['POST'])
def variantes_delete(id):
    """Eliminar una variante"""
    variante = Variante.query.get_or_404(id)
    db.session.delete(variante)
    db.session.commit()
    flash('Variante eliminada exitosamente', 'success')
    return redirect(url_for('variantes_list'))


# ==================== INVENTARIO ====================

@app.route('/inventario')
def inventario_list():
    """Visualizar inventario con filtros y estados de stock"""
    # Obtener parámetros de filtrado
    producto_id = request.args.get('producto_id', type=int)
    ubicacion_id = request.args.get('ubicacion_id', type=int)
    estado = request.args.get('estado')
    
    # Consulta base
    query = Inventario.query
    
    # Aplicar filtros
    if producto_id:
        query = query.filter_by(producto_id=producto_id)
    if ubicacion_id:
        query = query.filter_by(ubicacion_id=ubicacion_id)
    
    inventarios = query.all()
    
    # Filtrar por estado si se especificó
    if estado:
        inventarios = [inv for inv in inventarios if inv.get_estado_stock() == estado]
    
    # Obtener datos para filtros
    productos = Producto.query.filter_by(activo=True).all()
    ubicaciones = Ubicacion.query.filter_by(activo=True).all()
    
    return render_template('inventario/list.html', 
                         inventarios=inventarios, 
                         productos=productos, 
                         ubicaciones=ubicaciones,
                         selected_producto=producto_id,
                         selected_ubicacion=ubicacion_id,
                         selected_estado=estado)

@app.route('/inventario/create', methods=['GET', 'POST'])
def inventario_create():
    """Crear un nuevo registro de inventario"""
    if request.method == 'POST':
        inventario = Inventario(
            producto_id=request.form['producto_id'],
            variante_id=request.form.get('variante_id', type=int),
            ubicacion_id=request.form['ubicacion_id'],
            cantidad=request.form.get('cantidad', type=int, default=0),
            lote=request.form.get('lote')
        )
        
        # Manejar fecha de vencimiento
        fecha_venc = request.form.get('fecha_vencimiento')
        if fecha_venc:
            inventario.fecha_vencimiento = datetime.strptime(fecha_venc, '%Y-%m-%d').date()
        
        db.session.add(inventario)
        db.session.commit()
        flash('Registro de inventario creado exitosamente', 'success')
        return redirect(url_for('inventario_list'))
    
    productos = Producto.query.filter_by(activo=True).all()
    ubicaciones = Ubicacion.query.filter_by(activo=True).all()
    variantes = Variante.query.filter_by(activo=True).all()
    return render_template('inventario/form.html', 
                         inventario=None, 
                         productos=productos, 
                         ubicaciones=ubicaciones,
                         variantes=variantes)

@app.route('/inventario/<int:id>/edit', methods=['GET', 'POST'])
def inventario_edit(id):
    """Editar un registro de inventario"""
    inventario = Inventario.query.get_or_404(id)
    if request.method == 'POST':
        inventario.producto_id = request.form['producto_id']
        inventario.variante_id = request.form.get('variante_id', type=int)
        inventario.ubicacion_id = request.form['ubicacion_id']
        inventario.cantidad = request.form.get('cantidad', type=int, default=0)
        inventario.lote = request.form.get('lote')
        
        # Manejar fecha de vencimiento
        fecha_venc = request.form.get('fecha_vencimiento')
        if fecha_venc:
            inventario.fecha_vencimiento = datetime.strptime(fecha_venc, '%Y-%m-%d').date()
        else:
            inventario.fecha_vencimiento = None
        
        db.session.commit()
        flash('Registro de inventario actualizado exitosamente', 'success')
        return redirect(url_for('inventario_list'))
    
    productos = Producto.query.filter_by(activo=True).all()
    ubicaciones = Ubicacion.query.filter_by(activo=True).all()
    variantes = Variante.query.filter_by(activo=True).all()
    return render_template('inventario/form.html', 
                         inventario=inventario, 
                         productos=productos, 
                         ubicaciones=ubicaciones,
                         variantes=variantes)

@app.route('/inventario/<int:id>/delete', methods=['POST'])
def inventario_delete(id):
    """Eliminar un registro de inventario"""
    inventario = Inventario.query.get_or_404(id)
    db.session.delete(inventario)
    db.session.commit()
    flash('Registro de inventario eliminado exitosamente', 'success')
    return redirect(url_for('inventario_list'))


# ==================== MOVIMIENTOS ====================

@app.route('/movimientos')
def movimientos_list():
    """Listar movimientos con filtros (ingresos, salidas, historial)"""
    tipo = request.args.get('tipo')
    producto_id = request.args.get('producto_id', type=int)
    fecha_desde = request.args.get('fecha_desde')
    fecha_hasta = request.args.get('fecha_hasta')
    
    # Consulta base
    query = Movimiento.query
    
    # Aplicar filtros
    if tipo:
        query = query.filter_by(tipo=tipo)
    if producto_id:
        query = query.filter_by(producto_id=producto_id)
    if fecha_desde:
        fecha_desde_dt = datetime.strptime(fecha_desde, '%Y-%m-%d')
        query = query.filter(Movimiento.fecha >= fecha_desde_dt)
    if fecha_hasta:
        fecha_hasta_dt = datetime.strptime(fecha_hasta, '%Y-%m-%d')
        query = query.filter(Movimiento.fecha <= fecha_hasta_dt)
    
    movimientos = query.order_by(Movimiento.fecha.desc()).all()
    productos = Producto.query.filter_by(activo=True).all()
    
    return render_template('movimientos/list.html', 
                         movimientos=movimientos, 
                         productos=productos,
                         selected_tipo=tipo,
                         selected_producto=producto_id,
                         fecha_desde=fecha_desde,
                         fecha_hasta=fecha_hasta)

@app.route('/movimientos/create', methods=['GET', 'POST'])
def movimientos_create():
    """Crear un nuevo movimiento (entrada/salida)"""
    if request.method == 'POST':
        tipo = request.form['tipo']
        producto_id = request.form['producto_id']
        cantidad = request.form.get('cantidad', type=int)
        
        # Crear el movimiento
        movimiento = Movimiento(
            tipo=tipo,
            producto_id=producto_id,
            variante_id=request.form.get('variante_id', type=int),
            cantidad=cantidad,
            motivo=request.form.get('motivo'),
            referencia=request.form.get('referencia'),
            usuario=request.form.get('usuario', 'Sistema'),
            notas=request.form.get('notas')
        )
        db.session.add(movimiento)
        
        # Actualizar inventario
        ubicacion_id = request.form.get('ubicacion_id', type=int)
        if ubicacion_id:
            inventario = Inventario.query.filter_by(
                producto_id=producto_id,
                ubicacion_id=ubicacion_id
            ).first()
            
            if inventario:
                if tipo == 'ENTRADA':
                    inventario.cantidad += cantidad
                elif tipo == 'SALIDA':
                    inventario.cantidad -= cantidad
                elif tipo == 'AJUSTE':
                    inventario.cantidad = cantidad
            else:
                # Crear nuevo registro de inventario si no existe
                inventario = Inventario(
                    producto_id=producto_id,
                    ubicacion_id=ubicacion_id,
                    cantidad=cantidad if tipo == 'ENTRADA' else 0
                )
                db.session.add(inventario)
        
        db.session.commit()
        flash('Movimiento registrado exitosamente', 'success')
        return redirect(url_for('movimientos_list'))
    
    productos = Producto.query.filter_by(activo=True).all()
    ubicaciones = Ubicacion.query.filter_by(activo=True).all()
    variantes = Variante.query.filter_by(activo=True).all()
    return render_template('movimientos/form.html', 
                         movimiento=None, 
                         productos=productos,
                         ubicaciones=ubicaciones,
                         variantes=variantes)


# ==================== TRANSFERENCIAS ====================

@app.route('/transferencias')
def transferencias_list():
    """Listar transferencias"""
    estado = request.args.get('estado')
    
    query = Transferencia.query
    if estado:
        query = query.filter_by(estado=estado)
    
    transferencias = query.order_by(Transferencia.created_at.desc()).all()
    
    return render_template('transferencias/list.html', 
                         transferencias=transferencias,
                         selected_estado=estado)

@app.route('/transferencias/create', methods=['GET', 'POST'])
def transferencias_create():
    """Crear una nueva transferencia"""
    if request.method == 'POST':
        transferencia = Transferencia(
            producto_id=request.form['producto_id'],
            variante_id=request.form.get('variante_id', type=int),
            ubicacion_origen_id=request.form['ubicacion_origen_id'],
            ubicacion_destino_id=request.form['ubicacion_destino_id'],
            cantidad=request.form.get('cantidad', type=int),
            usuario_solicita=request.form.get('usuario_solicita', 'Sistema'),
            notas=request.form.get('notas'),
            estado='PENDIENTE'
        )
        db.session.add(transferencia)
        db.session.commit()
        flash('Transferencia creada exitosamente', 'success')
        return redirect(url_for('transferencias_list'))
    
    productos = Producto.query.filter_by(activo=True).all()
    ubicaciones = Ubicacion.query.filter_by(activo=True).all()
    variantes = Variante.query.filter_by(activo=True).all()
    return render_template('transferencias/form.html', 
                         transferencia=None, 
                         productos=productos,
                         ubicaciones=ubicaciones,
                         variantes=variantes)

@app.route('/transferencias/<int:id>/procesar', methods=['POST'])
def transferencias_procesar(id):
    """Procesar una transferencia (mover inventario)"""
    transferencia = Transferencia.query.get_or_404(id)
    
    if transferencia.estado != 'PENDIENTE':
        flash('Solo se pueden procesar transferencias pendientes', 'error')
        return redirect(url_for('transferencias_list'))
    
    # Actualizar inventario origen
    inv_origen = Inventario.query.filter_by(
        producto_id=transferencia.producto_id,
        ubicacion_id=transferencia.ubicacion_origen_id
    ).first()
    
    if inv_origen and inv_origen.cantidad >= transferencia.cantidad:
        inv_origen.cantidad -= transferencia.cantidad
        
        # Actualizar o crear inventario destino
        inv_destino = Inventario.query.filter_by(
            producto_id=transferencia.producto_id,
            ubicacion_id=transferencia.ubicacion_destino_id
        ).first()
        
        if inv_destino:
            inv_destino.cantidad += transferencia.cantidad
        else:
            inv_destino = Inventario(
                producto_id=transferencia.producto_id,
                ubicacion_id=transferencia.ubicacion_destino_id,
                cantidad=transferencia.cantidad
            )
            db.session.add(inv_destino)
        
        # Actualizar estado de la transferencia
        transferencia.estado = 'COMPLETADA'
        transferencia.fecha_proceso = datetime.utcnow()
        transferencia.usuario_procesa = request.form.get('usuario', 'Sistema')
        
        db.session.commit()
        flash('Transferencia procesada exitosamente', 'success')
    else:
        flash('No hay suficiente inventario en la ubicación origen', 'error')
    
    return redirect(url_for('transferencias_list'))

@app.route('/transferencias/<int:id>/cancelar', methods=['POST'])
def transferencias_cancelar(id):
    """Cancelar una transferencia"""
    transferencia = Transferencia.query.get_or_404(id)
    
    if transferencia.estado == 'PENDIENTE':
        transferencia.estado = 'CANCELADA'
        db.session.commit()
        flash('Transferencia cancelada exitosamente', 'success')
    else:
        flash('Solo se pueden cancelar transferencias pendientes', 'error')
    
    return redirect(url_for('transferencias_list'))


# ==================== REPORTES ====================

@app.route('/reportes')
def reportes_index():
    """Página principal de reportes"""
    return render_template('reportes/index.html')

@app.route('/reportes/inventario')
def reportes_inventario():
    """Reporte de inventario"""
    estado = request.args.get('estado')
    categoria_id = request.args.get('categoria_id', type=int)
    
    # Obtener todos los inventarios
    inventarios = Inventario.query.all()
    
    # Filtrar por estado
    if estado:
        inventarios = [inv for inv in inventarios if inv.get_estado_stock() == estado]
    
    # Filtrar por categoría
    if categoria_id:
        inventarios = [inv for inv in inventarios if inv.producto.categoria_id == categoria_id]
    
    categorias = Categoria.query.filter_by(activo=True).all()
    
    return render_template('reportes/inventario.html', 
                         inventarios=inventarios,
                         categorias=categorias,
                         selected_estado=estado,
                         selected_categoria=categoria_id)

@app.route('/reportes/movimientos')
def reportes_movimientos():
    """Reporte de movimientos"""
    tipo = request.args.get('tipo')
    fecha_desde = request.args.get('fecha_desde')
    fecha_hasta = request.args.get('fecha_hasta')
    
    query = Movimiento.query
    
    if tipo:
        query = query.filter_by(tipo=tipo)
    if fecha_desde:
        fecha_desde_dt = datetime.strptime(fecha_desde, '%Y-%m-%d')
        query = query.filter(Movimiento.fecha >= fecha_desde_dt)
    if fecha_hasta:
        fecha_hasta_dt = datetime.strptime(fecha_hasta, '%Y-%m-%d')
        query = query.filter(Movimiento.fecha <= fecha_hasta_dt)
    
    movimientos = query.order_by(Movimiento.fecha.desc()).all()
    
    return render_template('reportes/movimientos.html', 
                         movimientos=movimientos,
                         selected_tipo=tipo,
                         fecha_desde=fecha_desde,
                         fecha_hasta=fecha_hasta)

@app.route('/reportes/generar/pdf/<tipo>')
def reportes_generar_pdf(tipo):
    """Generar reporte en PDF"""
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Título
    p.setFont("Helvetica-Bold", 16)
    p.drawString(1*inch, height - 1*inch, f"Reporte de {tipo.capitalize()}")
    
    # Fecha
    p.setFont("Helvetica", 10)
    p.drawString(1*inch, height - 1.3*inch, f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    
    y_position = height - 2*inch
    
    if tipo == 'inventario':
        inventarios = Inventario.query.all()
        p.setFont("Helvetica-Bold", 12)
        p.drawString(1*inch, y_position, "Inventario Actual")
        y_position -= 0.3*inch
        
        p.setFont("Helvetica", 9)
        for inv in inventarios[:20]:  # Limitar a 20 registros
            if y_position < 1*inch:
                p.showPage()
                y_position = height - 1*inch
            
            producto_nombre = inv.producto.nombre if inv.producto else 'N/A'
            ubicacion_nombre = inv.ubicacion.nombre if inv.ubicacion else 'N/A'
            texto = f"{producto_nombre} - {ubicacion_nombre}: {inv.cantidad} unidades"
            p.drawString(1*inch, y_position, texto)
            y_position -= 0.2*inch
    
    elif tipo == 'movimientos':
        movimientos = Movimiento.query.order_by(Movimiento.fecha.desc()).limit(20).all()
        p.setFont("Helvetica-Bold", 12)
        p.drawString(1*inch, y_position, "Últimos Movimientos")
        y_position -= 0.3*inch
        
        p.setFont("Helvetica", 9)
        for mov in movimientos:
            if y_position < 1*inch:
                p.showPage()
                y_position = height - 1*inch
            
            producto_nombre = mov.producto.nombre if mov.producto else 'N/A'
            fecha = mov.fecha.strftime('%Y-%m-%d') if mov.fecha else 'N/A'
            texto = f"{fecha} - {mov.tipo} - {producto_nombre}: {mov.cantidad}"
            p.drawString(1*inch, y_position, texto)
            y_position -= 0.2*inch
    
    p.showPage()
    p.save()
    
    buffer.seek(0)
    response = make_response(buffer.getvalue())
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = f'attachment; filename=reporte_{tipo}_{datetime.now().strftime("%Y%m%d")}.pdf'
    
    return response


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
