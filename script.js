// --- CONFIGURACIÓN ---
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';

// Inicializamos Supabase
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- FUNCIÓN DEL BOTÓN (La hacemos global para que el HTML la vea sí o sí) ---
window.loginConGoogle = async function() {
    console.log("Botón Gmail presionado");
    
    const { error } = await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin,
            queryParams: {
                prompt: 'select_account'
            }
        }
    });

    if (error) {
        console.error("Error de Supabase:", error.message);
        alert("Error: " + error.message);
    }
};

// --- FUNCIÓN PARA INVITADO ---
window.continuarComoInvitado = function() {
    localStorage.setItem('nai_invitado_id', 'INV-' + Math.floor(Math.random() * 9999));
    location.reload();
};

// --- CONTROL DE PANTALLAS ---
_supabase.auth.onAuthStateChange((event, session) => {
    const authCont = document.getElementById('auth-container');
    const appCont = document.getElementById('contenido-app');

    if (session || localStorage.getItem('nai_invitado_id')) {
        if(authCont) authCont.style.display = 'none';
        if(appCont) appCont.style.display = 'block';
    } else {
        if(authCont) authCont.style.display = 'flex';
        if(appCont) appCont.style.display = 'none';
    }
});

// Prueba de carga: Esto DEBE aparecer en la consola del navegador (F12)
console.log("✅ Script de Nai-Nai cargado correctamente");
