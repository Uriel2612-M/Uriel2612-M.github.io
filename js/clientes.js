    //datos clientes
    let clienteEditandoId = null;
    async function cargarClientes() {
        const cuerpoTabla = document.getElementById('tabla-clientes-body');
        
        if (!cuerpoTabla) return;

        cuerpoTabla.innerHTML = '<tr><td colspan="8">Cargando datos...</td></tr>';

        try {
            const { data: clientes, error } = await supabaseClient
                .from('clientes')
                .select('*')
                .order('nombre_completo', { ascending: true }); 

            if (error) throw error;

            cuerpoTabla.innerHTML = '';

            if (clientes.length === 0) {
                cuerpoTabla.innerHTML = '<tr><td colspan="7">No hay clientes registrados.</td></tr>';
                return;
            }

            clientes.forEach(cliente => {
                const fila = document.createElement('tr');
                
                fila.innerHTML = `
                    <td>#${cliente.id.substring(0, 4).toUpperCase()}</td>
                    <td>${cliente.nombre_completo}</td>                
                    <td>${cliente.telefono_whatsapp}</td>
                    <td>${cliente.direccion_entrega}</td>
                    <td>${cliente.ciudad}</td>
                    <td>${cliente.tipo_cliente}</td>
                    <td>
                        <button class="btn-editar" onclick="prepararEdicion('${cliente.id}')">Editar</button>
                    </td>
                `;
                cuerpoTabla.appendChild(fila);
            });
            

        } catch (err) {
            console.error('Error al traer clientes:', err);
            cuerpoTabla.innerHTML = '<tr><td colspan="7" style="color:red;">Error al cargar datos.</td></tr>';
        }
    }


    document.addEventListener('DOMContentLoaded', () => {
    cargarClientes();

    const formCliente = document.getElementById('form-cliente');
    
    if (formCliente) {
        formCliente.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            const nombreCompleto = document.getElementById('cliente-nombre').value.trim();
            const telefono = document.getElementById('cliente-telefono').value.trim();

            try {
                if (clienteEditandoId) {
                   
                    const { error } = await supabaseClient
                        .from('clientes') 
                        .update({ 
                            nombre_completo: nombreCompleto,                             
                            telefono_whatsapp: telefono 
                        })
                        .eq('id', clienteEditandoId); 

                    if (error) throw error;
                    alert('¡Cliente actualizado!');

                } 
                formCliente.reset();
                clienteEditandoId = null;
                document.getElementById('modal-cliente').close();
                cargarClientes();

            } catch (err) {
                console.error("Error al guardar en BD:", err);
                alert("Hubo un error al guardar. Checa la consola, apa.");
            }
        });
    }
    const btnCancelar = document.getElementById('btn-cancelar'); 
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            const modal = document.getElementById('modal-cliente');
            if (modal) modal.close();
            
            const formCliente = document.getElementById('form-cliente');
            if (formCliente) formCliente.reset();
            
            clienteEditandoId = null; 
        });
    }
    const btnEliminarCliente = document.getElementById('btn-eliminar-cliente');

    if (btnEliminarCliente) {
        btnEliminarCliente.addEventListener('click', async () => {
            // 1. Verificamos que haya un cliente seleccionado
            if (!clienteEditandoId) {
                alert("No hay ningún cliente seleccionado para eliminar.");
                return;
            }

            // 2. Lanzamos la pregunta de seguridad
            const confirmacion = confirm("¿Estás seguro de eliminar a este cliente? ¡Esta acción no se puede deshacer!");

            // 3. Si el usuario le da a "Aceptar", procedemos a aniquilarlo de la base de datos
            if (confirmacion) {
                try {
                    const { error } = await supabaseClient
                        .from('clientes')
                        .delete()
                        .eq('id', clienteEditandoId); 

                    if (error) throw error;

                    alert('¡Cliente eliminado del sistema!');
                    
                    
                    const formCliente = document.getElementById('form-cliente');
                    if (formCliente) formCliente.reset();
                    
                    document.getElementById('modal-cliente').close();
                    clienteEditandoId = null;
                    
                    cargarClientes(); 

                } catch (err) {
                    console.error("Error al eliminar en BD:", err);
                    alert("Hubo un error al eliminar. Checa la consola, apa.");
                }
            }
        });
    }
});

async function prepararEdicion(id) {
    clienteEditandoId = id;
    console.log("Editando al cliente ID:", id); 
    
    const modal = document.getElementById('modal-cliente'); 
    if (modal) modal.showModal();

    try {
        const { data: cliente, error } = await supabaseClient
            .from('clientes') 
            .select('*')
            .eq('id', id) 
            .single(); 

        if (error) throw error;
    
        
        document.getElementById('cliente-nombre').value = cliente.nombre_completo;        
        document.getElementById('cliente-telefono').value = cliente.telefono_whatsapp || '';
        

    } catch (err) {
        console.error("Error al traer datos para editar:", err);
        alert("Hubo un error al intentar editar. Checa la consola.");
    }
}

