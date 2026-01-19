// Configuración de Supabase
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';

const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Función de Login
window.loginConGoogle = async function() {
    console.log("Iniciando Google...");
    const { error } = await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin
        }
    });
    if (error) alert("Error: " + error.message);
};

// Función Invitado
window.continuarComoInvitado = function() {
    localStorage.setItem('nai_invitado_id', 'INV-' + Math.floor(Math.random() * 9999));
    location.reload();
};

// Control de sesión
_supabase.auth.onAuthStateChange((event, session) => {
    const auth = document.getElementById('auth-container');
    const app = document.getElementById('contenido-app');
    if (session || localStorage.getItem('nai_invitado_id')) {
        if(auth) auth.style.display = 'none';
        if(app) app.style.display = 'block';
    } else {
        if(auth) auth.style.display = 'flex';
        if(app) app.style.display = 'none';
    }
});
