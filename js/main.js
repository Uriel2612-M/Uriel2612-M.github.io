// main.js - Lógica del Dashboard

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. EL RELOJ Y EL USUARIO (El Encabezado)
    const cargarEncabezado = async () => {
        const headerInfo = document.getElementById('header-info');
        if (!headerInfo) return;

        // Traemos la sesión actual
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) return;

        // Traemos el perfil para saber su rol y nombre
        const { data: perfil } = await supabaseClient
            .from('perfiles')
            .select('nombre, rol_id')
            .eq('id', session.user.id)
            .single();

        const nombreRol = perfil?.rol_id === 1 ? 'ADMINISTRADOR' : 'EMPLEADO';
        const nombreUsuario = perfil?.nombre || 'Usuario';

        // Función para actualizar la hora cada segundo
        const actualizarReloj = () => {
            const ahora = new Date();
            const fecha = ahora.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit' });
            const hora = ahora.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            headerInfo.textContent = `USUARIO: ${nombreRol} (${nombreUsuario}) | FECHA: ${fecha} | HORA: ${hora}`;
        };

        actualizarReloj();
        setInterval(actualizarReloj, 1000); 
    };

    // 2. RESUMEN GENERAL (Las Tarjetas)
    const cargarResumen = async () => {
        try {
            // Tarjeta 1: Total de Pedidos / Ventas
            const { count: totalVentas } = await supabaseClient
                .from('pedidos')
                .select('*', { count: 'exact', head: true });
            
            const numVentas = document.getElementById('dash-ventas');
            if(numVentas) numVentas.innerText = totalVentas || 0;

            // Tarjeta 2: Total de Impresiones en Stock
            const { data: productos } = await supabaseClient
                .from('productos')
                .select('stock');
            
            const totalStock = productos ? productos.reduce((suma, prod) => suma + (prod.stock || 0), 0) : 0;
            const numStock = document.getElementById('dash-stock');
            if(numStock) numStock.innerText = totalStock;

         

        } catch (error) {
            console.error("Error cargando el dashboard:", error);
        }
    };

    // 3. Ejecutamos las funciones maestras
    cargarEncabezado();
    cargarResumen();
});