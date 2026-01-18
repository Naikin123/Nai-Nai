// CONFIGURACIÓN SUPABASE
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// DATOS
const etiquetas = ["Gracioso", "Divertido", "Pelea", "Educativo", "Noticias", "Documental", "Historias", "Juegos", "Blogs", "Ciencias", "Humor", "Entretenimiento", "Deportes", "Tecnología", "Cultura", "Música", "Cine", "Series", "Arte", "Comedia", "Debate", "Tutoriales", "Investigación", "Salud", "Viajes", "Gastronomía", "Moda", "Jardinería", "Animales", "Familia", "Negocios", "Ajedrez", "Juegos de Naikin", "Carreras universitarias", "Otro"];
const avatares = ["https://i.ibb.co/hF6VHB5F/1ec8541e-1.png", "https://i.ibb.co/kLMbfDM/c876007d.png", "https://i.ibb.co/TqMHL17S/44-sin-t-tulo2.png", "https://i.ibb.co/Gf3LYb3q/39-sin-t-tulo4.png", "https://i.ibb.co/chtYqpFv/39-sin-t-tulo3.png", "https://i.ibb.co/fdXfwHnC/22-sin-t-tulo.png", "https://i.ibb.co/JRWddJSh/blooder.png", "https://i.ibb.co/M5Mjpg30/22-sin-t-tulo4.png", "https://i.ibb.co/kVzNDn0R/roba-venas2.png", "https://i.ibb.co/r2CvYDzq/1767980417276.png", "https://i.ibb.co/dwVqvWSc/49-sin-t-tulo.png", "https://i.ibb.co/99w1588C/45-sin-t-tulo.png", "https://i.ibb.co/zHL2NFf8/57-sin-t-tulo.png", "https://i.ibb.co/PZJj37WD/57-sin-t-tulo2.png", "https://i.ibb.co/W4bCrNhK/57-sin-t-tulo3.png", "https://i.ibb.co/TBJ4SSF3/59-sin-t-tulo.png", "https://i.ibb.co/rgcQpZr/58-sin-t-tulo.png", "https://i.ibb.co/Qv0KF6wC/60-sin-t-tulo.png", "https://i.ibb.co/m548FFDK/61-sin-t-tulo.png", "https://i.ibb.co/9kNb2pLF/62-sin-t-tulo.png", "https://i.ibb.co/MX6b1Yk/64-sin-t-tulo.png", "https://i.ibb.co/CF0jfPj/66-sin-t-tulo.png", "https://i.ibb.co/fVWZgb6Q/65-sin-t-tulo.png", "https://i.ibb.co/B55wWK3W/67-sin-t-tulo.png", "https://i.ibb.co/7dyQd1vf/75-sin-t-tulo8.png", "https://i.ibb.co/DDWcKxNy/75-sin-t-tulo4.png", "https://i.ibb.co/GQjLDjk9/75-sin-t-tulo.png", "https://i.ibb.co/4ZbzqqGz/83-sin-t-tulo.png", "https://i.ibb.co/nqN37BDq/82-sin-t-tulo2.png", "https://i.ibb.co/vCdRv7qG/86-sin-t-tulo2.png", "https://i.ibb.co/wNs2x97p/86-sin-t-tulo.png", "https://i.ibb.co/d0GndZNk/91-sin-t-tulo.png"];

// --- ESTADO USUARIO (FORZADO A TU ID 1) ---
localStorage.setItem('nai_user_id', '1'); 
let myId = "1";
let currentProfile = {};

document.addEventListener('DOMContentLoaded', async () => {
    await cargarPerfilUsuario();
    cargarEtiquetas();
    cargarFeed('comunidad');
    configurarSubida();
});

// --- PERFILES ---
async function cargarPerfilUsuario() {
    let { data } = await _supabase.from('perfiles').select('*').eq('user_id', myId).single();
    if(!data) {
        const nuevo = { user_id: myId, alias: "Naikin 👑", bio: "Dueño de Nai-Nai", avatar: avatares[0], gua: 100, estado: "👑" };
        await _supabase.from('perfiles').insert([nuevo]);
        currentProfile = nuevo;
    } else {
        currentProfile = data;
    }
    actualizarDOMPerfil();
}

function actualizarDOMPerfil() {
    document.getElementById('p-avatar').src = currentProfile.avatar;
    document.getElementById('p-alias').innerText = currentProfile.alias;
    document.getElementById('p-id').innerText = `ID: ${myId}`;
    document.getElementById('p-bio').innerText = currentProfile.bio;
    document.getElementById('p-gua').innerText = currentProfile.gua;
    document.getElementById('p-estado').innerText = currentProfile.estado;
}

// --- BOTÓN REGLAS (ARREGLADO) ---
window.mostrarReglas = function() {
    alert("📜 REGLAS DE NAI-NAI:\n1. No contenido ofensivo.\n2. Respeta a los socios.\n3. Diviértete subiendo buen contenido.\n\n¡Si rompes las reglas, baneo directo! 🥊");
}

// --- BOTÓN COMPARTIR (ARREGLADO PARA EVITAR ERROR 413) ---
window.compartirVideo = function(url) {
    navigator.clipboard.writeText(url).then(() => {
        alert("¡Enlace copiado al portapapeles! 🔗 Compártelo donde quieras.");
    }).catch(() => {
        alert("Enlace del video: " + url);
    });
}

// --- FEED Y VIDEOS ---
async function cargarFeed(tipo) {
    const contenedor = (tipo === 'comunidad') ? document.getElementById('feed-comunidad') : document.getElementById('lista-mis-videos');
    contenedor.innerHTML = "<p style='text-align:center'>Cargando...</p>";

    let query = _supabase.from('videos').select('*').order('id', { ascending: false });
    if(tipo === 'mis-videos') query = query.eq('owner_id', myId);

    const { data } = await query;
    if(!data) return;

    contenedor.innerHTML = "";
    for (const v of data) {
        const { data: autor } = await _supabase.from('perfiles').select('alias, avatar, estado').eq('user_id', v.owner_id).single();
        
        const card = document.createElement('div');
        card.className = "post-card";
        
        card.innerHTML = `
            <div class="card-header">
                <div class="user-info" onclick="abrirPerfilAjeno('${v.owner_id}')">
                    <img src="${autor ? autor.avatar : v.avatar}" class="avatar-mini">
                    <div>
                        <div class="user-name">${autor ? autor.alias : v.usuario} ${autor ? autor.estado : ''}</div>
                        <div class="post-tag">${v.etiquetas ? v.etiquetas[0] : 'General'}</div>
                    </div>
                </div>
                ${v.owner_id == myId ? `<button onclick="borrarVideo(${v.id})" style="color:#ff4444; background:none; border:none;"><i class="fas fa-trash"></i></button>` : ''}
            </div>
            <div class="video-wrapper">
                <video id="vid-${v.id}" src="${v.video_url}" controls loop playsinline style="${v.config_orientacion === 'vertical' ? 'aspect-ratio:9/16; object-fit:cover;' : ''}"></video>
                <button class="btn-fullscreen" onclick="toggleFull('vid-${v.id}')"><i class="fas fa-expand"></i></button>
            </div>
            <div class="card-actions">
                <button class="action-btn" onclick="darLike(this, ${v.id})"><i class="far fa-heart"></i> <span>${v.likes_count || 0}</span></button>
                <button class="action-btn" onclick="compartirVideo('${v.video_url}')"><i class="fas fa-share-alt"></i></button>
            </div>
            <div class="card-meta">
                <div class="video-title">${v.titulo}</div>
                <div class="video-desc">${v.descripcion}</div>
            </div>
        `;
        contenedor.appendChild(card);
    }
}

// --- RESTO DE FUNCIONES (EDITOR, SUBIDA, ETC.) ---
window.verPerfilNaikin = () => abrirPerfilAjeno("1");
window.abrirPerfilAjeno = async (id) => {
    const modal = document.getElementById('modal-perfil-ajeno');
    modal.style.display = 'flex';
    const { data: p } = await _supabase.from('perfiles').select('*').eq('user_id', id).single();
    document.getElementById('contenido-perfil-ajeno').innerHTML = `
        <img src="${p.avatar}" style="width:80px; border-radius:50%;">
        <h2>${p.alias}</h2>

        
