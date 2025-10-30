"""
Script para poblar la base de datos con datos de prueba
Run: python populate_sample_data.py
"""
from app import app, db
from models import Proveedor, Categoria, Ubicacion, Producto, Variante, Inventario, Movimiento
from datetime import datetime

def populate_data():
    with app.app_context():
        # Limpiar datos existentes (opcional)
        print("Creando tablas...")
        db.create_all()
        
        # Crear Proveedores
        print("\n✓ Creando Proveedores...")
        proveedores = [
            Proveedor(nombre="Distribuidora XYZ S.A.", rfc="DXY850101ABC", telefono="555-0101", email="ventas@xyz.com", activo=True),
            Proveedor(nombre="Importadora Global", rfc="IGL900202DEF", telefono="555-0202", email="info@global.com", activo=True),
            Proveedor(nombre="Suministros del Norte", rfc="SDN950303GHI", telefono="555-0303", email="contacto@norte.com", activo=True),
        ]
        for p in proveedores:
            db.session.add(p)
        db.session.commit()
        print(f"  Creados {len(proveedores)} proveedores")
        
        # Crear Categorías
        print("\n✓ Creando Categorías...")
        categorias = [
            Categoria(nombre="Electrónica", descripcion="Productos electrónicos y tecnología", activo=True),
            Categoria(nombre="Oficina", descripcion="Artículos de oficina y papelería", activo=True),
            Categoria(nombre="Limpieza", descripcion="Productos de limpieza e higiene", activo=True),
            Categoria(nombre="Herramientas", descripcion="Herramientas y equipos", activo=True),
        ]
        for c in categorias:
            db.session.add(c)
        db.session.commit()
        print(f"  Creadas {len(categorias)} categorías")
        
        # Crear Ubicaciones
        print("\n✓ Creando Ubicaciones...")
        ubicaciones = [
            Ubicacion(nombre="Almacén Principal", codigo="ALM-001", descripcion="Almacén principal de la empresa", capacidad=1000, activo=True),
            Ubicacion(nombre="Almacén Secundario", codigo="ALM-002", descripcion="Almacén secundario", capacidad=500, activo=True),
            Ubicacion(nombre="Bodega A", codigo="BOD-A", descripcion="Bodega zona A", capacidad=200, activo=True),
            Ubicacion(nombre="Bodega B", codigo="BOD-B", descripcion="Bodega zona B", capacidad=200, activo=True),
        ]
        for u in ubicaciones:
            db.session.add(u)
        db.session.commit()
        print(f"  Creadas {len(ubicaciones)} ubicaciones")
        
        # Crear Productos
        print("\n✓ Creando Productos...")
        productos = [
            Producto(codigo="ELEC-001", nombre="Laptop Dell", descripcion="Laptop Dell Inspiron 15", 
                    precio_compra=8000.00, precio_venta=12000.00, stock_minimo=5, stock_maximo=50,
                    unidad_medida="PZA", categoria_id=1, proveedor_id=1, activo=True),
            Producto(codigo="ELEC-002", nombre="Mouse Logitech", descripcion="Mouse inalámbrico Logitech", 
                    precio_compra=200.00, precio_venta=350.00, stock_minimo=10, stock_maximo=100,
                    unidad_medida="PZA", categoria_id=1, proveedor_id=2, activo=True),
            Producto(codigo="OFIC-001", nombre="Papel Bond", descripcion="Resma de papel bond tamaño carta", 
                    precio_compra=50.00, precio_venta=80.00, stock_minimo=20, stock_maximo=200,
                    unidad_medida="RESMA", categoria_id=2, proveedor_id=3, activo=True),
            Producto(codigo="OFIC-002", nombre="Bolígrafos", descripcion="Caja de bolígrafos azules", 
                    precio_compra=30.00, precio_venta=50.00, stock_minimo=15, stock_maximo=150,
                    unidad_medida="CAJA", categoria_id=2, proveedor_id=3, activo=True),
            Producto(codigo="LIMP-001", nombre="Detergente", descripcion="Detergente líquido 5L", 
                    precio_compra=80.00, precio_venta=120.00, stock_minimo=10, stock_maximo=100,
                    unidad_medida="LT", categoria_id=3, proveedor_id=2, activo=True),
        ]
        for p in productos:
            db.session.add(p)
        db.session.commit()
        print(f"  Creados {len(productos)} productos")
        
        # Crear Variantes
        print("\n✓ Creando Variantes...")
        variantes = [
            Variante(producto_id=2, nombre="Mouse Negro", codigo="ELEC-002-NEG", 
                    atributo_1="Color", valor_1="Negro", precio_adicional=0.00, activo=True),
            Variante(producto_id=2, nombre="Mouse Blanco", codigo="ELEC-002-BLA", 
                    atributo_1="Color", valor_1="Blanco", precio_adicional=50.00, activo=True),
            Variante(producto_id=4, nombre="Bolígrafos Azul", codigo="OFIC-002-AZU", 
                    atributo_1="Color", valor_1="Azul", precio_adicional=0.00, activo=True),
            Variante(producto_id=4, nombre="Bolígrafos Negro", codigo="OFIC-002-NEG", 
                    atributo_1="Color", valor_1="Negro", precio_adicional=5.00, activo=True),
        ]
        for v in variantes:
            db.session.add(v)
        db.session.commit()
        print(f"  Creadas {len(variantes)} variantes")
        
        # Crear registros de Inventario
        print("\n✓ Creando registros de Inventario...")
        inventarios = [
            Inventario(producto_id=1, ubicacion_id=1, cantidad=15, lote="LOT-001"),
            Inventario(producto_id=2, ubicacion_id=1, cantidad=45, lote="LOT-002"),
            Inventario(producto_id=3, ubicacion_id=1, cantidad=150, lote="LOT-003"),
            Inventario(producto_id=4, ubicacion_id=2, cantidad=80, lote="LOT-004"),
            Inventario(producto_id=5, ubicacion_id=2, cantidad=25, lote="LOT-005"),
            Inventario(producto_id=1, ubicacion_id=3, cantidad=8, lote="LOT-006"),
            Inventario(producto_id=2, ubicacion_id=4, cantidad=30, lote="LOT-007"),
        ]
        for i in inventarios:
            db.session.add(i)
        db.session.commit()
        print(f"  Creados {len(inventarios)} registros de inventario")
        
        # Crear Movimientos
        print("\n✓ Creando Movimientos...")
        movimientos = [
            Movimiento(tipo="ENTRADA", producto_id=1, cantidad=10, motivo="Compra", 
                      referencia="ORD-001", usuario="Admin"),
            Movimiento(tipo="ENTRADA", producto_id=2, cantidad=50, motivo="Compra", 
                      referencia="ORD-002", usuario="Admin"),
            Movimiento(tipo="SALIDA", producto_id=3, cantidad=20, motivo="Venta", 
                      referencia="VTA-001", usuario="Vendedor"),
            Movimiento(tipo="ENTRADA", producto_id=4, cantidad=100, motivo="Compra", 
                      referencia="ORD-003", usuario="Admin"),
            Movimiento(tipo="SALIDA", producto_id=5, cantidad=5, motivo="Venta", 
                      referencia="VTA-002", usuario="Vendedor"),
        ]
        for m in movimientos:
            db.session.add(m)
        db.session.commit()
        print(f"  Creados {len(movimientos)} movimientos")
        
        # Resumen
        print("\n" + "="*50)
        print("✅ DATOS DE PRUEBA CREADOS EXITOSAMENTE")
        print("="*50)
        print(f"Proveedores: {Proveedor.query.count()}")
        print(f"Categorías: {Categoria.query.count()}")
        print(f"Ubicaciones: {Ubicacion.query.count()}")
        print(f"Productos: {Producto.query.count()}")
        print(f"Variantes: {Variante.query.count()}")
        print(f"Inventario: {Inventario.query.count()}")
        print(f"Movimientos: {Movimiento.query.count()}")
        print("\n¡Ahora puedes iniciar la aplicación con: python app.py")

if __name__ == "__main__":
    populate_data()
