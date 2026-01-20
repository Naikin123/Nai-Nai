// 1. CONFIGURACIÓN (Tus llaves que ya funcionan)
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let myId = null;

// 2. INICIO AUTOMÁTICO
_supabase.auth.onAuthStateChange(async (event, session) => {
    const auth = document.getElementById('auth-container');
    const app = document.getElementById('contenido-app');
    
    if (session || localStorage.getItem('nai_invitado_id')) {
        myId = session ? session.user.id : localStorage.getItem('nai_invitado_id');
        if(auth) auth.style.display = 'none';
        if(app) app.style.display = 'block';
        actualizarFeed(); // Esto cargará los videos
    } else {
        if(auth) auth.style.display = 'flex';
        if(app) app.style.display = 'none';
    }
});

// 3. FUNCIÓN PARA CAMBIAR DE PESTAÑA
window.cambiarTab = function(tabName) {
    document.querySelectorAll('.seccion-app').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('activo'));
    
    document.getElementById('tab-' + tabName).style.display = 'block';
    event.currentTarget.classList.add('activo');
};

// 4. CARGAR VIDEOS (El "Feed")
async function actualizarFeed() {
    const feed = document.getElementById('feed-comunidad');
    if(!feed) return;

    // Traemos los videos de la base de datos
    let { data: videos, error } = await _supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        feed.innerHTML = "<p style='color:white; padding:20px;'>Sube el primer video para empezar...</p>";
        return;
    }

    feed.innerHTML = videos.map(v => `
        <div class="video-card">
            <div class="video-user">👤 ${v.autor_alias || 'Anonimo'}</div>
            <video src="${v.video_url}" controls loop></video>
            <div class="video-info">
                <p>${v.titulo}</p>
                <button onclick="darLike('${v.id}')">❤️ ${v.likes || 0}</button>
            </div>
        </div>
    `).join('');
}

// 5. LOGIN Y OTROS
window.loginConGoogle = async () => {
    await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
    });
};

window.logout = async () => {
    localStorage.removeItem('nai_invitado_id');
    await _supabase.auth.signOut();
    location.reload();
};
        
