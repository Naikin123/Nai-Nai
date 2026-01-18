// --- CONFIGURACIÓN ---
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- DATOS ---
const etiquetas = ["Gracioso", "Divertido", "Pelea", "Educativo", "Noticias", "Juegos", "Humor", "Deportes", "Tecnología", "Música", "Cine", "Arte", "Comedia", "Tutoriales", "Salud", "Animales", "Naikin", "Otro"];
const avatares = ["https://i.ibb.co/hF6VHB5F/1ec8541e-1.png", "https://i.ibb.co/kLMbfDM/c876007d.png", "https://i.ibb.co/TqMHL17S/44-sin-t-tulo2.png", "https://i.ibb.co/Gf3LYb3q/39-sin-t-tulo4.png", "https://i.ibb.co/chtYqpFv/39-sin-t-tulo3.png", "https://i.ibb.co/fdXfwHnC/22-sin-t-tulo.png", "https://i.ibb.co/JRWddJSh/blooder.png", "https://i.ibb.co/M5Mjpg30/22-sin-t-tulo4.png"];

// --- INICIALIZACIÓN ---
// Forzamos tu ID a 1 para que seas el jefe siempre
localStorage.setItem('nai_user_id', '1');
let myId = '1';
let currentProfile = {};

document.addEventListener('DOMContentLoaded', async () => {
    console.log("Iniciando Nai-Nai...");
    await cargarPerfilUsuario();
    cargarEtiquetas();
    cargarFeed('comunidad');
    configurarSubida();
});

// --- PERFILES ---
async function cargarPerfilUsuario() {
    let { data } = await _supabase.from('perfiles').select('*').eq('user_id', myId).single();
    
    if(!data) {
        // Si no existe, lo creamos
        const nuevo = { 
            user_id: myId, 
            alias: "Naikin 👑", 
            bio: "Dueño de la App", 
            avatar: avatares[0], 
            estado: "👑", 
            gua: 100 
        };
        await _supabase.from('perfiles').insert([nuevo]);
        currentProfile = nuevo;
    } else {
        currentProfile = data;
    }
    actualizarDOMPerfil();
}

function actualizarDOMPerfil() {
    if(document.getElementById('p-alias')) {
        document.getElementById('p-avatar').src = currentProfile.avatar;
        document.getElementById('p-alias').innerText = currentProfile.alias;
        document.getElementById('p-id').innerText = `ID: ${myId}`;
        document.getElementById('p-bio').innerText = currentProfile.bio;
        document.getElementById('p-gua').innerText = currentProfile.gua;
        document.getElementById('p-estado').innerText = currentProfile.estado;
        
        const linkEl = document.getElementById('p-link');
        if(currentProfile.link) {
            linkEl.style.display = "inline-block";
            linkEl.href = currentProfile.link;
        }
    }
}

// --- FUNCIONES DE BOTONES ---

// 1. Botón Reglas
window.mostrarReglas = function() {
    alert("📜 REGLAS:\n1. Respeto ante todo.\n2. No contenido +18.\n3. Diviértete. 🥊");
}

// 2. Botón Naikin VIP
window.verPerfilNaikin = function() {
    abrirPerfilAjeno("1");
}

// 3. Compartir Video
window.compartirVideo = function(url) {
    navigator.clipboard.writeText(url).then(() => {
        alert("Enlace copiado! 🔗");
    }).catch(() => {
        alert("Copia este link: " + url);
    });
}

// --- FEED Y CARGA DE VIDEOS ---
async function cargarFeed(tipo) {
    const contenedor = (tipo === 'comunidad') ? document.getElementById('feed-comunidad') : document.getElementById('lista-mis-videos');
    if(!contenedor) return;
    
    contenedor.innerHTML = "<p style='text-align:center'>Cargando...</p>";

    let query = _supabase.from('videos').select('*').order('id', { ascending: false });
    if(tipo === 'mis-videos') query = query.eq('owner_id', myId);

    const { data } = await query;
    if(!data) return;

    contenedor.innerHTML = "";
    for (const v of data) {
        // Buscar datos del autor
        const { data: autor } = await _supabase.from('perfiles').select('alias, avatar, estado').eq('user_id', v.owner_id).single();
        
        const card = document.createElement('div');
        card.className = "post-card";
        
        // Botón de borrar solo si es mío
        const btnBorrar = (v.owner_id == myId) 
            ? `<button onclick="borrarVideo(${v.id})" style="color:red; background:none; border:none;"><i class="fas fa-trash"></i></button>` 
            : '';

        card.innerHTML = `
            <div class="card-header">
                <div class="user-info" onclick="abrirPerfilAjeno('${v.owner_id}')">
                    <img src="${autor ? autor.avatar : v.avatar}" class="avatar-mini">
                    <div>
                        <div class="user-name">${autor ? autor.alias : v.usuario} ${autor ? autor.estado : ''}</div>
                        <div class="post-tag">${v.etiquetas ? v.etiquetas[0] : 'General'}</div>
                    </div>
                </div>
                ${btnBorrar}
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

// --- PERFILES AJENOS ---
window.abrirPerfilAjeno = async function(id) {
    const modal = document.getElementById('modal-perfil-ajeno');
    modal.style.display = 'flex';
    document.getElementById('contenido-perfil-ajeno').innerHTML = "<p>Cargando...</p>";
    
    const { data: p } = await _supabase.from('perfiles').select('*').eq('user_id', id).single();
    
    if(p) {
        document.getElementById('contenido-perfil-ajeno').innerHTML = `
            <img src="${p.avatar}" style="width:80px; height:80px; border-radius:50%; border:2px solid #00f2ea; object-fit:cover;">
            <h2>${p.alias} ${p.estado || ''}</h2>
            <p>ID: ${p.user_id}</p>
            <p>"${p.bio || ''}"</p>
            <div style="background:#222; padding:5px; margin:10px;"><b>${p.gua} GUA</b></div>
            <button onclick="document.getElementById('modal-perfil-ajeno').style.display='none'" class="btn-cancel">Cerrar</button>
        `;
    } else {
        document.getElementById('contenido-perfil-ajeno').innerHTML = "<p>Usuario no encontrado</p><button onclick='document.getElementById(\"modal-perfil-ajeno\").style.display=\"none\"' class='btn-cancel'>Cerrar</button>";
    }
}

// --- SUBIDA VIDEO ---
let fileToUpload = null;
function configurarSubida() {
    const input = document.getElementById('input-video-file');
    if(input) input.addEventListener('change', (e) => {
        fileToUpload = e.target.files[0];
        document.getElementById('modal-upload').style.display = 'flex';
    });
}

window.confirmarSubida = async function() {
    const btn = document.querySelector('.btn-confirm');
    btn.innerText = "SUBIENDO...";
    btn.disabled = true;

    try {
        const nombre = `${Date.now()}_ID${myId}.mp4`;
        await _supabase.storage.from('videos').upload(nombre, fileToUpload);
        const { data: { publicUrl } } = _supabase.storage.from('videos').getPublicUrl(nombre);
        
        await _supabase.from('videos').insert([{
            video_url: publicUrl,
            owner_id: myId,
            titulo: document.getElementById('up-titulo').value || 'Video',
            descripcion: document.getElementById('up-desc').value || '',
            etiquetas: [document.getElementById('up-etiqueta').value],
            config_orientacion: document.getElementById('up-orientacion').value
        }]);
        location.reload();
    } catch (e) {
        alert("Error: " + e.message);
        btn.innerText = "Reintentar";
        btn.disabled = false;
    }
}

// --- EXTRAS ---
window.darLike = async (btn, id) => {
    await _supabase.rpc('incrementar_like', { video_id: id });
    btn.querySelector('span').innerText = parseInt(btn.querySelector('span').innerText) + 1;
};
window.borrarVideo = async (id) => { if(confirm("¿Borrar?")) { await _supabase.from('videos').delete().eq('id', id); location.reload(); }};
window.toggleFull = (id) => { const v = document.getElementById(id); v.requestFullscreen ? v.requestFullscreen() : v.webkitRequestFullscreen(); };
window.cancelarSubida = () => document.getElementById('modal-upload').style.display='none';
window.cerrarEditor = () => document.getElementById('modal-editor').style.display='none';
window.cambiarTab = function(tab) {
    document.querySelectorAll('.seccion-app').forEach(e => e.style.display='none');
    document.querySelectorAll('.tab-btn').forEach(e => e.classList.remove('activo'));
    document.getElementById('tab-'+tab).style.display='block';
    if(tab === 'comunidad') cargarFeed('comunidad');
    if(tab === 'mis-videos') cargarFeed('mis-videos');
    if(tab === 'perfil') document.querySelectorAll('.tab-btn')[2].classList.add('activo');
};
window.abrirEditorPerfil = () => {
    document.getElementById('edit-alias').value = currentProfile.alias;
    document.getElementById('edit-bio').value = currentProfile.bio;
    document.getElementById('modal-editor').style.display = 'flex';
};
window.guardarPerfil = async () => {
    await _supabase.from('perfiles').update({
        alias: document.getElementById('edit-alias').value,
        bio: document.getElementById('edit-bio').value,
        estado: document.getElementById('edit-estado').value,
        avatar: document.getElementById('edit-avatar-preview').src
    }).eq('user_id', myId);
    location.reload();
};
function cargarEtiquetas() {
    const bar = document.getElementById('barra-etiquetas');
    const sel = document.getElementById('up-etiqueta');
    etiquetas.forEach(tag => {
        bar.innerHTML += `<span class="tag-pill">${tag}</span>`;
        sel.innerHTML += `<option value="${tag}">${tag}</option>`;
    });
}
window.abrirSelectorAvatar = () => {
    const grid = document.getElementById('grid-avatars');
    grid.innerHTML = "";
    avatares.forEach(url => {
        const img = document.createElement('img'); img.src = url;
        img.onclick = () => { document.getElementById('edit-avatar-preview').src = url; document.getElementById('modal-avatar').style.display='none'; };
        grid.appendChild(img);
    });
    document.getElementById('modal-avatar').style.display='flex';
};
