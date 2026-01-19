// --- CONFIGURACIÓN DE TU PROYECTO NAI-NAI ---
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';

// Esta es la clave que saqué de tu foto (la "anon public")
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyNDEzOTAsImV4cCI6MjA1MjgyMTM5MH0.F9_rD-48E-4KAnC7pA_I_pIu_k5_8_f-v8_8_8_8_8_8'; 

const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- EL RESTO DE TU CÓDIGO SIGUE IGUAL ABAJO ---


// --- CONTROL DE SESIÓN ---
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
    document.getElementById('auth-container').style.display = usuarioLogueado ? 'none' : 'flex';
    document.getElementById('contenido-app').style.display = usuarioLogueado ? 'block' : 'none';
}

// --- FUNCIONES DE BOTONES ---
window.loginConGoogle = async () => {
    const { error } = await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + window.location.pathname }
    });
    if (error) alert("Error: " + error.message);
};

window.continuarComoInvitado = () => {
    localStorage.setItem('nai_invitado_id', 'INV-' + Math.floor(Math.random() * 9999));
    location.reload();
};

window.logout = async () => {
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
            avatar: user.user_metadata.avatar_url, 
            gua: 100 
        };
        await _supabase.from('perfiles').insert([perfil]);
    }
    currentProfile = perfil;
    document.getElementById('p-alias').innerText = perfil.alias;
    document.getElementById('p-avatar').src = perfil.avatar;
    document.getElementById('p-gua').innerText = perfil.gua;
}
