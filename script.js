// CONFIGURACIÓN DE SUPABASE
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';

// Inicializar cliente
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// FUNCIÓN PARA LOGIN CON GOOGLE
window.loginConGoogle = async function() {
    console.log("Intentando abrir Google...");
    try {
        const { error } = await _supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) throw error;
    } catch (err) {
        alert("Error: " + err.message);
    }
};

// FUNCIÓN PARA INVITADO
window.continuarComoInvitado = function() {
    localStorage.setItem('nai_invitado_id', 'INV-' + Math.floor(Math.random() * 9999));
    location.reload();
};

// CONTROL DE PANTALLAS (AUTH VS APP)
_supabase.auth.onAuthStateChange((event, session) => {
    const auth = document.getElementById('auth-container');
    const app = document.getElementById('contenido-app');
    
    if (session || localStorage.getItem('nai_invitado_id')) {
        if (auth) auth.style.display = 'none';
        if (app) app.style.display = 'block';
    } else {
        if (auth) auth.style.display = 'flex';
        if (app) app.style.display = 'none';
    }
});

