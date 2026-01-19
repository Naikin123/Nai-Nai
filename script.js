// CONFIGURACIÓN
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';

const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Función de Login Blindada
async function loginConGoogle() {
    console.log("Iniciando proceso de login...");
    try {
        const { error } = await _supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'select_account',
                }
            }
        });
        if (error) throw error;
    } catch (err) {
        console.error("Error detallado:", err);
        alert("Error al conectar con Google: " + err.message);
    }
}

// Asegurar que el HTML vea la función
window.loginConGoogle = loginConGoogle;

// Manejo de sesión
_supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('contenido-app').style.display = 'block';
    }
});
