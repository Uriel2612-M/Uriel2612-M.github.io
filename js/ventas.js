let ventaEditandoId = null;
async function cargarVentas() {
    
    const cuerpoTabla = document.getElementById('tabla-ventas-body'); 
    
    if (!cuerpoTabla) return;

    cuerpoTabla.innerHTML = '<tr><td colspan="9">Cargando historial de ventas...</td></tr>';

    try {
        const { data: ventas, error } = await supabaseClient
            .from('pedidos')
            .select(`
                id_pedido,
                descripcion_pieza,
                peso_estimado_gramos,
                precio_total,
                estado,
                fecha_pedido,
                clientes (
                    nombre_completo,
                    telefono_whatsapp
                )
            `)
            .order('fecha_pedido', { ascending: false }); 

        if (error) throw error;
        cuerpoTabla.innerHTML = '';

        if (ventas.length === 0) {
            cuerpoTabla.innerHTML = '<tr><td colspan="9">No hay ventas registradas aún.</td></tr>';
            return;
        }

        ventas.forEach(venta => {
            const fila = document.createElement('tr');
            
            
            const fecha = new Date(venta.fecha_pedido).toLocaleDateString();

            
            const nombreCliente = venta.clientes ? venta.clientes.nombre_completo : 'Desconocido';
            const telefonoCliente = venta.clientes ? venta.clientes.telefono_whatsapp : 'N/A';

            fila.innerHTML = `
                <td>#${venta.id_pedido}</td>
                <td>${nombreCliente}</td>
                <td>${telefonoCliente}</td>
                <td>${venta.descripcion_pieza}</td>
                <td>${venta.peso_estimado_gramos} g</td>
                <td>$${venta.precio_total}</td>
                <td>${venta.estado}</td>
                <td>${fecha}</td>
                <td>
                 <button class="btn-editar" onclick="prepararEdicionVenta('${venta.id_pedido}')">Editar</button>
                </td>
                    
               
            `;
            cuerpoTabla.appendChild(fila);
        });

    } catch (err) {
        console.error("Error al cargar las ventas:", err);
        cuerpoTabla.innerHTML = '<tr><td colspan="9" style="color:red;">Error al cargar datos.</td></tr>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    
cargarVentas()


//registrar nueva venta

const btnNuevaVenta = document.getElementById('btn-nueva-venta');
if (btnNuevaVenta) {
    btnNuevaVenta.addEventListener('click', () => {
        ventaEditandoId = null; 
        document.getElementById('form-nueva-venta').reset(); 
        document.getElementById('modal-venta').showModal(); 
    });
}

const formVenta = document.getElementById('form-nueva-venta');

if (formVenta) {
    formVenta.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Capturamos los datos del Cliente
        const nombre = document.getElementById('cliente-nombre').value;
        const telefono = document.getElementById('cliente-telefono').value;
        const direccion = document.getElementById('cliente-direccion').value;
        const ciudad = document.getElementById('cliente-ciudad').value;
        const tipo = document.getElementById('cliente-tipo').value;

        // 2. Capturamos los datos del Pedido (Venta)
        const descripcion = document.getElementById('venta-descripcion').value;
        const peso = document.getElementById('venta-peso').value;
        const precio = document.getElementById('venta-precio').value;
        const estado = document.getElementById('venta-estado').value;
        const fecha = document.getElementById('venta-fecha').value;

        try {
            let clienteId;

            // --- PASO 1: REGISTRAR O ACTUALIZAR AL CLIENTE ---
            const { data: nuevoCliente, error: errCliente } = await supabaseClient
                .from('clientes')
                .insert([{
                    nombre_completo: nombre,
                    telefono_whatsapp: telefono,
                    direccion_entrega: direccion,
                    ciudad: ciudad,
                    tipo_cliente: tipo
                }])
                .select()
                .single();

            if (errCliente) throw errCliente;
            clienteId = nuevoCliente.id;

            
            const { error: errPedido } = await supabaseClient
                .from('pedidos')
                .insert([{
                    cliente_id: clienteId,
                    descripcion_pieza: descripcion,
                    peso_estimado_gramos: peso,
                    precio_total: precio,
                    estado: estado
                }]);

            if (errPedido) throw errPedido;

            if (ventaEditandoId !== null) {
                alert('¡Pedido actualizado con éxito!');
                ventaEditandoId = null; 
            } else {
                alert('¡Pedido registrado con éxito!');
            }
            formVenta.reset();
            document.getElementById('modal-venta').close();
            cargarVentas(); 

        } catch (err) {
            console.error("Error en la operación:", err);
            alert("Hubo un fallo. Revisa la consola.");
        }
    });
    const btnCancelar = document.getElementById('btn-cancelar'); 
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            const modal = document.getElementById('modal-venta');
            if (modal) modal.close();
            
            const formVenta = document.getElementById('form-venta');
            if (formVenta) formVenta.reset();
            
            ventaEditandoId = null; 
        });
    }
}
 

});

//editar boton.
async function prepararEdicionVenta(idVenta) {
    ventaEditandoId = idVenta;
    
    const modal = document.getElementById('modal-venta');
    if (modal) modal.showModal();

    try {
        // Traemos el pedido y los datos del cliente de un solo golpe
        const { data: venta, error } = await supabaseClient
            .from('pedidos')
            .select(`
                *,
                clientes (*)
            `)
            .eq('id_pedido', idVenta)
            .single();

        if (error) throw error;

        // Rellenamos el formulario con los datos de la base de datos
        document.getElementById('venta-descripcion').value = venta.descripcion_pieza;
        document.getElementById('venta-peso').value = venta.peso_estimado_gramos;
        document.getElementById('venta-precio').value = venta.precio_total;
        document.getElementById('venta-estado').value = venta.estado;

        // Datos del cliente ligado
        if (venta.clientes) {
            document.getElementById('cliente-nombre').value = venta.clientes.nombre_completo;
            document.getElementById('cliente-telefono').value = venta.clientes.telefono_whatsapp;
            document.getElementById('cliente-direccion').value = venta.clientes.direccion_entrega;
            document.getElementById('cliente-ciudad').value = venta.clientes.ciudad;
            document.getElementById('cliente-tipo').value = venta.clientes.tipo_cliente;
        }

    } catch (err) {
        console.error("Error al traer datos de la venta:", err);
    }
}