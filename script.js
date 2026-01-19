alert("¡EL CÓDIGO ESTÁ VIVO!");


// --- 1. CONFIGURACIÓN ---
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o'; 

const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Variables globales
let myId = null;
let currentProfile = null;

// --- 2. CONTROL DE SESIÓN ---
_supabase.auth.onAuthStateChange(async (event, session) => {
    if (session) {
        myId = session.user.id;
        mostrarApp(true);
        await cargarPerfil(session.user);
    } else {
        const invId = localStorage.getItem('nai_invitado_id');
        if (invId) {
            myId = invId;
            mostrarApp(true);
            currentProfile = { alias: "Invitado", avatar: "https://i.ibb.co/hF6VHB5F/1ec8541e-1.png", gua: 0 };
        } else {
            mostrarApp(false);
        }
    }
});

function mostrarApp(usuarioLogueado) {
    const auth = document.getElementById('auth-container');
    const app = document.getElementById('contenido-app');
    if(auth) auth.style.display = usuarioLogueado ? 'none' : 'flex';
    if(app) app.style.display = usuarioLogueado ? 'block' : 'none';
}

// --- 3. FUNCIONES DE INTERFAZ ---
window.cambiarTab = function(tabName) {
    document.querySelectorAll('.seccion-app').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('activo'));
    
    const target = document.getElementById('tab-' + tabName);
    if(target) target.style.display = 'block';
    
    // Buscar el botón correspondiente
    const btn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.innerText.toLowerCase().includes(tabName.replace('mis-videos','videos').substring(0,4)));
    if(btn) btn.classList.add('activo');
};

// --- 4. FUNCIÓN DE LOGIN (SOLO UNA VEZ Y CORREGIDA) ---
window.loginConGoogle = async function() {
    console.log("🟢 Intentando conectar con Google...");
    try {
        const { error } = await _supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) throw error;
    } catch (err) {
        alert("Error de conexión: " + err.message);
        console.error(err);
    }
};

window.continuarComoInvitado = function() {
    localStorage.setItem('nai_invitado_id', 'INV-' + Math.floor(Math.random() * 9999));
    location.reload();
};

window.logout = async function() {
    localStorage.removeItem('nai_invitado_id');
    await _supabase.auth.signOut();
    location.reload();
};

async function cargarPerfil(user) {
    let { data: perfil } = await _supabase.from('perfiles').select('*').eq('user_id', user.id).single();
    if (!perfil) {
        perfil = { 
            user_id: user.id, 
            alias: user.user_metadata.full_name || "Socio Nai", 
            avatar: user.user_metadata.avatar_url || "https://i.ibb.co/hF6VHB5F/1ec8541e-1.png", 
            gua: 100 
        };
        await _supabase.from('perfiles').insert([perfil]);
    }
    currentProfile = perfil;
    if(document.getElementById('p-alias')) document.getElementById('p-alias').innerText = perfil.alias;
    if(document.getElementById('p-avatar')) document.getElementById('p-avatar').src = perfil.avatar;
    if(document.getElementById('p-gua')) document.getElementById('p-gua').innerText = perfil.gua;
}
    
