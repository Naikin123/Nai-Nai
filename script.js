const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o'; 

const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let myId = null;
let currentProfile = null;

_supabase.auth.onAuthStateChange(async (event, session) => {
    if (session) {
        myId = session.user.id;
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('contenido-app').style.display = 'block';
        await cargarPerfil(session.user);
    } else {
        const invId = localStorage.getItem('nai_invitado_id');
        if (invId) {
            myId = invId;
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('contenido-app').style.display = 'block';
        } else {
            document.getElementById('auth-container').style.display = 'flex';
            document.getElementById('contenido-app').style.display = 'none';
        }
    }
});

window.loginConGoogle = async function() {
    const { error } = await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
    });
    if (error) alert("Error: " + error.message);
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
    if (perfil) {
        currentProfile = perfil;
        document.getElementById('p-alias').innerText = perfil.alias;
        document.getElementById('p-avatar').src = perfil.avatar;
        document.getElementById('p-gua').innerText = perfil.gua;
    }
}
