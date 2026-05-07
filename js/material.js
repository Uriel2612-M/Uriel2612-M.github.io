// 1. Variable global
let materialEditandoId = null;

// 2. Función para cargar la tabla
async function cargarMaterial() {
    const cuerpoTabla = document.getElementById('tabla-material-body'); 
    if (!cuerpoTabla) return;

    cuerpoTabla.innerHTML = '<tr><td colspan="6">Cargando catálogo de materiales...</td></tr>';

    try {
        // Traemos todo de la tabla materiales 
        const { data: materiales, error } = await supabaseClient
            .from('materiales')
            .select('*')
            .order('nombre_material', { ascending: true }); 

        if (error) throw error;
        cuerpoTabla.innerHTML = '';

        if (materiales.length === 0) {
            cuerpoTabla.innerHTML = '<tr><td colspan="6">No hay materiales registrados aún.</td></tr>';
            return;
        }

        materiales.forEach(mate => {
            const fila = document.createElement('tr');

            // Llenamos la tabla con los datos directos de los materiales
            fila.innerHTML = `
                <td>#${mate.id}</td>
                <td>${mate.nombre_material}</td>
                <td>$${mate.precio_por_gramo}</td>
                <td>${mate.descripcion_propiedades}
                <td>${mate.stock}</td>                
                <td>
                    <button class="btn-editar" onclick="prepararEdicionMaterial('${mate.id}')">Editar</button>
                </td>
            `;
            cuerpoTabla.appendChild(fila);
        });

    } catch (err) {
        console.error("Error al cargar materiales:", err);
        cuerpoTabla.innerHTML = '<tr><td colspan="6" style="color:red;">Error al cargar datos.</td></tr>';
    }
}

// 3. Lo que se ejecuta al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    
    cargarMaterial(); 
    const btnNuevoMaterial = document.getElementById('btn-nuevo-material');
    if (btnNuevoMaterial) {
        btnNuevoMaterial.addEventListener('click', () => {
            materialEditandoId = null; 
            const formMaterial = document.getElementById('form-material');
            if (formMaterial) formMaterial.reset(); 
            document.getElementById('modal-material').showModal(); 
        });
    }

    // Guardar o Actualizar material
    const formMaterial = document.getElementById('form-material');
    if (formMaterial) {
        formMaterial.addEventListener('submit', async (e) => {
            e.preventDefault();

            
            const nombre = document.getElementById('material-nombre').value;
            const descripcion = document.getElementById('material-descripcion').value;
            const precio = document.getElementById('material-precio').value;
            const stock = document.getElementById('material-stock').value;

            try {
                if (materialEditandoId) {
                    // Si estamos EDITANDO
                    const { error } = await supabaseClient
                        .from('materiales')
                        .update({ 
                            nombre_material: nombre,
                            descripcion_propiedades: descripcion, 
                            precio_por_gramo: precio,  
                            stock: stock 
                        })
                        .eq('id', materialEditandoId);

                    if (error) throw error;
                    alert('Material actualizado con éxito!');

                } else {
                    // Si es producto NUEVO
                    const { error } = await supabaseClient
                        .from('materiales')
                        .insert([{ 
                           nombre_material: nombre,
                            descripcion_propiedades: descripcion, 
                            precio_por_gramo: precio,  
                            stock: stock
                        }]);

                    if (error) throw error;
                    alert('¡Nuevo material registrado en el inventario!');
                }

                formMaterial.reset();
                document.getElementById('modal-material').close();
                cargarMaterial(); 

            } catch (err) {
                console.error("Error al guardar material:", err);
                alert("Hubo un fallo. Revisa la consola.");
            }
        });
    }

    // Botón Cancelar
    const btnCancelar = document.getElementById('btn-cancelar-material'); 
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            const modal = document.getElementById('modal-material');
            if (modal) modal.close();
            
            const formulario = document.getElementById('form-material');
            if (formulario) formulario.reset();
            
            materialEditandoId = null; 
        });
    }
});

// 4. Función para Editar
async function prepararEdicionMaterial(idMaterial) {
    materialEditandoId = idMaterial;
    
    const modal = document.getElementById('modal-material');
    if (modal) modal.showModal();

    try {
        const { data: mat, error } = await supabaseClient
            .from('materiales')
            .select('*')
            .eq('id', idMaterial)
            .single();

        if (error) throw error;

        // Rellenamos las cajitas correctas
        document.getElementById('material-nombre').value = mat.nombre_material;
        document.getElementById('material-descripcion').value = mat.descripcion_propiedades || '';
        document.getElementById('material-precio').value = mat.precio_por_gramo;
        document.getElementById('material-stock').value = mat.stock;

    } catch (err) {
        console.error("Error al traer datos del material:", err);
    }
}