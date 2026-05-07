
// outh.js - Solo para el inicio de sesión (index.html)

document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login');

    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 1. Apagamos el botón para que no le den doble clic
            const btnSubmit = formLogin.querySelector('button[type="submit"]');
            if (btnSubmit) {
                btnSubmit.disabled = true;
                btnSubmit.textContent = "Iniciando...";
            }

            // 2. Capturamos los datos
            const correo = document.getElementById('login-correo').value.trim();
            const password = document.getElementById('login-password').value;

            try {
                // 3. Supabase revisa las credenciales
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email: correo,
                    password: password,
                });

                if (error) throw error;

                // 4. Si todo sale bien, lo mandamos al menú principal
                window.location.href = 'main.html';

            } catch (err) {
                // ¡AQUÍ ESTABA EL ERROR! Ya quedó limpio con un solo catch
                console.error("Motivo del rechazo:", err.message);
                alert("Rechazado. Checa la consola con F12, apa.");
            } finally {
                // 5. Volvemos a prender el botón si hubo error
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.textContent = "Iniciar sesión";
                }
            }
        });
    }
});