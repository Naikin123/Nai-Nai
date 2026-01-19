// --- 1. CONFIGURACIÓN ---
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';

// ⚠️ BORRA EL TEXTO DE ABAJO Y PEGA TU LLAVE REAL (la que empieza con eyJ...)
const supabaseKey = 'PEGAR_AQUI_LA_LLAVE_LARGA'; 

// Inicializar cliente
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Variables globales (FALTABAN ESTAS)
let myId = null;
let currentProfile = null;

// --- 2. CONTROL DE SESIÓN ---
_supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("Estado de sesión:", event); // Para ver si funciona en la consola
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
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('contenido-app');
    
    if(authContainer) authContainer.style.display = usuarioLogueado ? 'none' : 'flex';
    if(appContainer) appContainer.style.display = usuarioLogueado ? 'block' : 'none';
}

// --- 3. FUNCIONES DE BOTONES ---

// Función para el botón de Gmail
window.loginConGoogle = async function() {
    console.log("Intentando iniciar sesión con Google...");
    const { error } = await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.href // Esto asegura que vuelva a la misma página
        }
    });
    if (error) {
        alert("Error al conectar: " + error.message);
        console.error(error);
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

window.cambiarTab = function(tabName) {
    // Ocultar todas las secciones
    document.querySelectorAll('.seccion-app').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('activo'));
    
    // Mostrar la elegida
    document.getElementById('tab-' + tabName).style.display = 'block';
    
    // Buscar el botón correspondiente (corrección simple)
    const btn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.innerText.toLowerCase().includes(tabName.replace('mis-videos', 'videos')));
    if(btn) btn.classList.add('activo');
};

async function cargarPerfil(user) {
    // Intentar buscar perfil existente
    let { data: perfil, error } = await _supabase
        .from('perfiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

    // Si no existe, crearlo (o si hay error al buscar)
    if (!perfil) {
        const nuevoPerfil = { 
            user_id: user.id, 
            alias: user.user_metadata.full_name || "Socio Nai", 
            avatar: user.user_metadata.avatar_url || "https://i.ibb.co/hF6VHB5F/1ec8541e-1.png", 
            gua: 100 
        };
        
        const { error: errorInsert } = await _supabase.from('perfiles').insert([nuevoPerfil]);
        if (!errorInsert) perfil = nuevoPerfil;
    }
    
    if (perfil) {
        currentProfile = perfil;
        if(document.getElementById('p-alias')) document.getElementById('p-alias').innerText = perfil.alias;
        if(document.getElementById('p-avatar')) document.getElementById('p-avatar').src = perfil.avatar;
        if(document.getElementById('p-gua')) document.getElementById('p-gua').innerText = perfil.gua;
    }
}
