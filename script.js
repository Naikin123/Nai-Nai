const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'PEGA_AQUI_TU_CLAVE_ANON_COMPLETA'; // <--- ¡PON TU CLAVE AQUÍ!

const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let myId = null;
let currentProfile = null;

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
