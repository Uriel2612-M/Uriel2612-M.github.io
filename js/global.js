document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. EL CADENERO: Verificamos sesión en Supabase
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();

    if (sessionError || !session) {
        window.location.replace('index.html');
        return;
    }

    // 2. ELEMENTOS DEL DOM
    const btnColapsar = document.getElementById('btn-colapsar');
    const nav = document.querySelector('nav');
    const main = document.querySelector('main');
    const headerInfo = document.getElementById('header-info');
    const btnLogout = document.getElementById('btn-logout');
    const inputBusqueda = document.getElementById('input-busqueda');
    const btnBuscar = document.getElementById('btn-buscar');

    // 3. LÓGICA DEL MENÚ: Colapsar y expandir
    if (btnColapsar && nav && main) {
        btnColapsar.addEventListener('click', () => {
            nav.classList.toggle('colapsado');
            main.classList.toggle('expandido');
        });
    }

    // 4. EL ENCABEZADO: Traer datos del usuario y poner el reloj
    const { data: perfil } = await supabaseClient
        .from('perfiles')
        .select('nombre, rol_id')
        .eq('id', session.user.id)
        .single();

    if (perfil && headerInfo) {
        const nombreRol = perfil.rol_id === 1 ? 'ADMINISTRADOR' : 'CLIENTE';
        const nombreUsuario = perfil.nombre || 'Usuario';

        const actualizarReloj = () => {
            const ahora = new Date();
            const fecha = ahora.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const hora = ahora.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            headerInfo.textContent = `USUARIO: ${nombreRol} (${nombreUsuario}) | FECHA: ${fecha} | HORA: ${hora}`;
        };

        actualizarReloj();
        setInterval(actualizarReloj, 1000);
    }

    // 5. BUSCADOR INTELIGENTE
    if (inputBusqueda) {
        const realizarBusqueda = () => {
            const valor = inputBusqueda.value.trim();
            if (valor) {
                window.location.href = `catalogo.html?buscar=${encodeURIComponent(valor)}`;
            }
        };

        inputBusqueda.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') realizarBusqueda();
        });

        if (btnBuscar) {
            btnBuscar.addEventListener('click', realizarBusqueda);
        }
    }

    // 6. CERRAR SESIÓN
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            const { error } = await supabaseClient.auth.signOut();
            if (!error) {
                window.location.replace('index.html');
            } else {
                console.error("Error al salir:", error);
            }
        });
    }
});