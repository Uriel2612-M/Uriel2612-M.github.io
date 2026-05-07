// 1. Variable global
let productoEditandoId = null;

// 2. Función para cargar la tabla
async function cargarProductos() {
    const cuerpoTabla = document.getElementById('tabla-productos-body'); 
    if (!cuerpoTabla) return;

    cuerpoTabla.innerHTML = '<tr><td colspan="7">Cargando catálogo de productos...</td></tr>';

    try {
        // Traemos todo de la tabla productos 
        const { data: productos, error } = await supabaseClient
            .from('productos')
            .select('*')
            .order('nombre_producto', { ascending: true }); 

        if (error) throw error;
        cuerpoTabla.innerHTML = '';

        if (productos.length === 0) {
            cuerpoTabla.innerHTML = '<tr><td colspan="7">No hay productos registrados aún.</td></tr>';
            return;
        }

        productos.forEach(prod => {
            const fila = document.createElement('tr');
            const fecha = new Date(prod.fecha_creacion).toLocaleDateString();

            // Llenamos la tabla con los datos directos del producto
            fila.innerHTML = `
                <td>#${prod.id}</td>
                <td>${prod.nombre_producto}</td>
                <td>${prod.descripcion || 'Sin descripción'}</td>
                <td>$${prod.precio}</td>
                <td>${prod.stock} pzas</td>                
                <td>${fecha}</td>
                <td>
                    <button class="btn-editar" onclick="prepararEdicionProducto('${prod.id}')">Editar</button>
                </td>
            `;
            cuerpoTabla.appendChild(fila);
        });

    } catch (err) {
        console.error("Error al cargar productos:", err);
        cuerpoTabla.innerHTML = '<tr><td colspan="7" style="color:red;">Error al cargar datos.</td></tr>';
    }
}

// 3. Lo que se ejecuta al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    
    cargarProductos(); 
    const btnNuevoProducto = document.getElementById('btn-nuevo-producto');
    if (btnNuevoProducto) {
        btnNuevoProducto.addEventListener('click', () => {
            productoEditandoId = null; 
            const formProducto = document.getElementById('form-producto');
            if (formProducto) formProducto.reset(); 
            document.getElementById('modal-producto').showModal(); 
        });
    }

    // Guardar o Actualizar Producto
    const formProducto = document.getElementById('form-producto');
    if (formProducto) {
        formProducto.addEventListener('submit', async (e) => {
            e.preventDefault();

            
            const nombre = document.getElementById('producto-nombre').value;
            const descripcion = document.getElementById('producto-descripcion').value;
            const precio = document.getElementById('producto-precio').value;
            const stock = document.getElementById('producto-stock').value;

            try {
                if (productoEditandoId) {
                    // Si estamos EDITANDO
                    const { error } = await supabaseClient
                        .from('productos')
                        .update({ 
                            nombre_producto: nombre, 
                            descripcion: descripcion, 
                            precio: precio, 
                            stock: stock 
                        })
                        .eq('id', productoEditandoId);

                    if (error) throw error;
                    alert('¡Producto actualizado con éxito!');

                } else {
                    // Si es producto NUEVO
                    const { error } = await supabaseClient
                        .from('productos')
                        .insert([{ 
                            nombre_producto: nombre, 
                            descripcion: descripcion, 
                            precio: precio, 
                            stock: stock 
                        }]);

                    if (error) throw error;
                    alert('¡Nuevo producto registrado en el catálogo!');
                }

                formProducto.reset();
                document.getElementById('modal-producto').close();
                cargarProductos(); 

            } catch (err) {
                console.error("Error al guardar producto:", err);
                alert("Hubo un fallo. Revisa la consola.");
            }
        });
    }

    // Botón Cancelar
    const btnCancelar = document.getElementById('btn-cancelar-producto'); 
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            const modal = document.getElementById('modal-producto');
            if (modal) modal.close();
            
            const formulario = document.getElementById('form-producto');
            if (formulario) formulario.reset();
            
            productoEditandoId = null; 
        });
    }
});

// 4. Función para Editar
async function prepararEdicionProducto(idProducto) {
    productoEditandoId = idProducto;
    
    const modal = document.getElementById('modal-producto');
    if (modal) modal.showModal();

    try {
        const { data: prod, error } = await supabaseClient
            .from('productos')
            .select('*')
            .eq('id', idProducto)
            .single();

        if (error) throw error;

        // Rellenamos las cajitas correctas
        document.getElementById('producto-nombre').value = prod.nombre_producto;
        document.getElementById('producto-descripcion').value = prod.descripcion || '';
        document.getElementById('producto-precio').value = prod.precio;
        document.getElementById('producto-stock').value = prod.stock;

    } catch (err) {
        console.error("Error al traer datos del producto:", err);
    }
}