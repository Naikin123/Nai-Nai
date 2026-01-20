// 1. CONFIGURACIÓN (Tus llaves reales)
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let myId = null;
let myProfile = null;

// 2. DETECTOR DE SESIÓN (Esto arregla que "no pase nada")
_supabase.auth.onAuthStateChange(async (event, session) => {
    if (session) {
        myId = session.user.id;
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('contenido-app').style.display = 'block';
        await cargarOcrearPerfil(session.user);
        actualizarFeed();
    }
});

// 3. CARGAR O CREAR PERFIL
async function cargarOcrearPerfil(user) {
    let { data: perfil } = await _supabase.from('perfiles').select('*').eq('user_id', user.id).single();
    
    if (!perfil) {
        perfil = { 
            user_id: user.id, 
            alias: user.user_metadata.full_name || "Socio Nuevo", 
            avatar: user.user_metadata.avatar_url || "https://i.ibb.co/hF6VHB5F/1ec8541e-1.png", 
            gua: 100 
        };
        await _supabase.from('perfiles').insert([perfil]);
    }
    myProfile = perfil;
    document.getElementById('p-alias').innerText = perfil.alias;
    document.getElementById('p-avatar').src = perfil.avatar;
    document.getElementById('p-gua').innerText = perfil.gua;
}

// 4. SISTEMA PARA SUBIR VIDEOS
window.subirVideo = async function() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'video/*';
    
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        alert("Subiendo video... espera un momento.");
        
        const fileName = `${Date.now()}-${file.name}`;
        const { data, error } = await _supabase.storage
            .from('videos-bucket')
            .upload(fileName, file);

        if (error) return alert("Error al subir archivo: " + error.message);

        const { data: urlData } = _supabase.storage.from('videos-bucket').getPublicUrl(fileName);
        
        await _supabase.from('videos').insert([{
            user_id: myId,
            video_url: urlData.publicUrl,
            titulo: "Nuevo Video de " + myProfile.alias,
            autor_alias: myProfile.alias
        }]);

        alert("¡Video subido con éxito!");
        actualizarFeed();
    };
    fileInput.click();
};

// 5. CARGAR EL FEED (VIDEOS)
async function actualizarFeed() {
    const feed = document.getElementById('feed-comunidad');
    let { data: videos } = await _supabase.from('videos').select('*').order('created_at', { ascending: false });

    if (!videos || videos.length === 0) {
        feed.innerHTML = `<div style="padding:20px; text-align:center; color:gray;">
            <p>No hay videos aún.</p>
            <button onclick="subirVideo()" style="background:#00f2ea; color:black; border:none; padding:10px; border-radius:5px; font-weight:bold;">Subir el primer video</button>
        </div>`;
        return;
    }

    feed.innerHTML = videos.map(v => `
        <div class="video-card" style="margin-bottom:20px; border-bottom:1px solid #333; padding-bottom:10px;">
            <p style="color:#00f2ea; font-weight:bold; margin-bottom:5px;">👤 ${v.autor_alias}</p>
            <video src="${v.video_url}" controls style="width:100%; border-radius:10px;"></video>
            <p style="color:white; margin-top:5px;">${v.titulo}</p>
        </div>
    `).join('');
}

// 6. LOGIN / LOGOUT
window.loginConGoogle = async () => {
    await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
    });
};

window.logout = async () => {
    await _supabase.auth.signOut();
    location.reload();
};

window.cambiarTab = (tab) => {
    document.querySelectorAll('.seccion-app').forEach(s => s.style.display = 'none');
    document.getElementById('tab-' + tab).style.display = 'block';
};
