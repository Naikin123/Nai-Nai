// CONFIGURACIÓN SUPABASE
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// DATOS
const etiquetas = ["Gracioso", "Divertido", "Pelea", "Educativo", "Noticias", "Documental", "Historias", "Juegos", "Blogs", "Ciencias", "Humor", "Entretenimiento", "Deportes", "Tecnología", "Cultura", "Música", "Cine", "Series", "Arte", "Comedia", "Debate", "Tutoriales", "Investigación", "Salud", "Viajes", "Gastronomía", "Moda", "Jardinería", "Animales", "Familia", "Negocios", "Ajedrez", "Juegos de Naikin", "Carreras universitarias", "Otro"];
const avatares = ["https://i.ibb.co/hF6VHB5F/1ec8541e-1.png", "https://i.ibb.co/kLMbfDM/c876007d.png", "https://i.ibb.co/TqMHL17S/44-sin-t-tulo2.png", "https://i.ibb.co/Gf3LYb3q/39-sin-t-tulo4.png", "https://i.ibb.co/chtYqpFv/39-sin-t-tulo3.png", "https://i.ibb.co/fdXfwHnC/22-sin-t-tulo.png", "https://i.ibb.co/JRWddJSh/blooder.png", "https://i.ibb.co/M5Mjpg30/22-sin-t-tulo4.png", "https://i.ibb.co/kVzNDn0R/roba-venas2.png", "https://i.ibb.co/r2CvYDzq/1767980417276.png", "https://i.ibb.co/dwVqvWSc/49-sin-t-tulo.png", "https://i.ibb.co/99w1588C/45-sin-t-tulo.png", "https://i.ibb.co/zHL2NFf8/57-sin-t-tulo.png", "https://i.ibb.co/PZJj37WD/57-sin-t-tulo2.png", "https://i.ibb.co/W4bCrNhK/57-sin-t-tulo3.png", "https://i.ibb.co/TBJ4SSF3/59-sin-t-tulo.png", "https://i.ibb.co/rgcQpZr/58-sin-t-tulo.png", "https://i.ibb.co/Qv0KF6wC/60-sin-t-tulo.png", "https://i.ibb.co/m548FFDK/61-sin-t-tulo.png", "https://i.ibb.co/9kNb2pLF/62-sin-t-tulo.png", "https://i.ibb.co/MX6b1Yk/64-sin-t-tulo.png", "https://i.ibb.co/CF0jfPj/66-sin-t-tulo.png", "https://i.ibb.co/fVWZgb6Q/65-sin-t-tulo.png", "https://i.ibb.co/B55wWK3W/67-sin-t-tulo.png", "https://i.ibb.co/7dyQd1vf/75-sin-t-tulo8.png", "https://i.ibb.co/DDWcKxNy/75-sin-t-tulo4.png", "https://i.ibb.co/GQjLDjk9/75-sin-t-tulo.png", "https://i.ibb.co/4ZbzqqGz/83-sin-t-tulo.png", "https://i.ibb.co/nqN37BDq/82-sin-t-tulo2.png", "https://i.ibb.co/vCdRv7qG/86-sin-t-tulo2.png", "https://i.ibb.co/wNs2x97p/86-sin-t-tulo.png", "https://i.ibb.co/d0GndZNk/91-sin-t-tulo.png"];

// ESTADO USUARIO LOCAL
let myId = localStorage.getItem('nai_user_id');
if(!myId) {
    myId = String(Math.floor(Math.random() * 10000) + 1);
    localStorage.setItem('nai_user_id', myId);
}
let currentProfile = {}; // Aquí se carga la info de la DB

document.addEventListener('DOMContentLoaded', async () => {
    await cargarPerfilUsuario(); // Cargar mis datos de Supabase
    configurarTabs();
    cargarEtiquetas();
    cargarFeed('comunidad');
    configurarSubida();
});

// --- 1. GESTIÓN DE PERFILES (SQL) ---
async function cargarPerfilUsuario() {
    // Busca si existe en DB
    let { data, error } = await _supabase.from('perfiles').select('*').eq('user_id', myId).single();
    
    if(!data) {
        // Si no existe, creamos uno por defecto
        const nuevoPerfil = {
            user_id: myId,
            alias: `Socio ${myId}`,
            bio: "Nuevo en Nai-Nai",
            avatar: avatares[0],
            estado: "🔥",
            gua: 100
        };
        await _supabase.from('perfiles').insert([nuevoPerfil]);
        currentProfile = nuevoPerfil;
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
    
    const linkEl = document.getElementById('p-link');
    if(currentProfile.link) {
        linkEl.style.display = "inline-block";
        linkEl.href = currentProfile.link;
        linkEl.innerHTML = `<i class="fas fa-link"></i> Abrir Enlace`;
    } else {
        linkEl.style.display = "none";
    }
}

// EDITOR PERFIL
window.abrirEditorPerfil = function() {
    document.getElementById('edit-alias').value = currentProfile.alias;
    document.getElementById('edit-bio').value = currentProfile.bio;
    document.getElementById('edit-link').value = currentProfile.link || "";
    document.getElementById('edit-estado').value = currentProfile.estado;
    document.getElementById('edit-avatar-preview').src = currentProfile.avatar;
    document.getElementById('modal-editor').style.display = 'flex';
}

window.cerrarEditor = function() {
    document.getElementById('modal-editor').style.display = 'none';
}

window.guardarPerfil = async function() {
    const nuevosDatos = {
        alias: document.getElementById('edit-alias').value,
        bio: document.getElementById('edit-bio').value,
        link: document.getElementById('edit-link').value,
        estado: document.getElementById('edit-estado').value,
        avatar: document.getElementById('edit-avatar-preview').src
    };
    
    // Guardar en DB
    const { error } = await _supabase.from('perfiles').update(nuevosDatos).eq('user_id', myId);
    
    if(error) alert("Error al guardar: " + error.message);
    else {
        currentProfile = { ...currentProfile, ...nuevosDatos };
        actualizarDOMPerfil();
        cerrarEditor();
        alert("Perfil actualizado socio! 😎");
    }
}

// --- 2. NAIKIN Y PERFILES AJENOS ---
window.verPerfilNaikin = async function() {
    // Asumimos que Naikin es ID "1" o buscamos por alias si quieres
    // Para este ejemplo, buscamos ID "1". Si tu ID es otro, cámbialo aquí.
    abrirPerfilAjeno("1"); 
}

window.abrirPerfilAjeno = async function(userId) {
    const modal = document.getElementById('modal-perfil-ajeno');
    const cont = document.getElementById('contenido-perfil-ajeno');
    modal.style.display = 'flex';
    cont.innerHTML = "<p>Cargando socio...</p>";

    const { data: perfil } = await _supabase.from('perfiles').select('*').eq('user_id', userId).single();
    
    if(!perfil) {
        cont.innerHTML = `<h3>Usuario no encontrado</h3><button onclick="document.getElementById('modal-perfil-ajeno').style.display='none'" class="btn-cancel">Cerrar</button>`;
        return;
    }

    cont.innerHTML = `
        <img src="${perfil.avatar}" style="width:80px; height:80px; border-radius:50%; border:2px solid #00f2ea;">
        <h2>${perfil.alias} <span style="font-size:1rem;">${perfil.estado || ''}</span></h2>
        <p style="color:gray;">ID: ${perfil.user_id}</p>
        <p class="bio-text">${perfil.bio || 'Sin biografía'}</p>
        <div style="margin:10px;"><b>${perfil.gua} GUA</b></div>
        ${perfil.link ? `<a href="${perfil.link}" target="_blank" class="link-externo">Visitar Enlace</a>` : ''}
        <br><br>
        <button onclick="document.getElementById('modal-perfil-ajeno').style.display='none'" class="btn-cancel">Cerrar</button>
    `;
}

// --- 3. FEED DE VIDEOS ---
async function cargarFeed(tipo) {
    const contenedor = (tipo === 'comunidad') ? document.getElementById('feed-comunidad') : document.getElementById('lista-mis-videos');
    contenedor.innerHTML = "<p style='text-align:center'>Cargando...</p>";

    let query = _supabase.from('videos').select('*').order('id', { ascending: false });
    if(tipo === 'mis-videos') query = query.eq('owner_id', myId);

    const { data, error } = await query;
    if(error) return;

    contenedor.innerHTML = "";
    // Para cada video, necesitamos buscar los datos ACTUALIZADOS del autor en la tabla perfiles
    for (const v of data) {
        // Truco: hacemos fetch del perfil del dueño del video
        const { data: autor } = await _supabase.from('perfiles').select('alias, avatar, estado').eq('user_id', v.owner_id).single();
        
        // Usamos los datos del perfil si existen, si no, los del video (legacy)
        const nombreMostrar = autor ? autor.alias : v.usuario;
        const avatarMostrar = autor ? autor.avatar : v.avatar;
        const estadoMostrar = autor ? autor.estado : '';

        const card = document.createElement('div');
        card.className = "post-card";
        
        // Botonera
        let btnBorrar = (v.owner_id == myId) 
            ? `<button onclick="borrarVideo(${v.id})" style="color:red; background:none; border:none;"><i class="fas fa-trash"></i></button>`
            : '';

        card.innerHTML = `
            <div class="card-header">
                <div class="user-info" onclick="abrirPerfilAjeno('${v.owner_id}')">
                    <img src="${avatarMostrar}" class="avatar-mini">
                    <div>
                        <div class="user-name">${nombreMostrar} ${estadoMostrar}</div>
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
                <button class="action-btn" onclick="darLike(this, ${v.id})"><i class="far fa-heart"></i> <span class="likes-text">${v.likes_count || 0}</span></button>
                <button class="action-btn"><i class="fas fa-share-alt"></i></button>
            </div>
            <div class="card-meta">
                <div class="video-title">${v.titulo}</div>
                <div class="video-desc">${v.descripcion}</div>
            </div>
        `;
        contenedor.appendChild(card);
    }
}

// --- UTILIDADES VARIAS ---
window.toggleFull = function(id) {
    const v = document.getElementById(id);
    if(v.requestFullscreen) v.requestFullscreen();
    else if(v.webkitRequestFullscreen) v.webkitRequestFullscreen();
}

window.darLike = async function(btn, id) {
    const ico = btn.querySelector('i');
    if(ico.classList.contains('fas')) return;
    ico.className = "fas fa-heart animate-heart";
    btn.style.color = "#ff2d55";
    await _supabase.rpc('incrementar_like', { video_id: id });
    const span = btn.querySelector('span');
    span.innerText = parseInt(span.innerText) + 1;
}

window.borrarVideo = async function(id) {
    if(confirm("¿Borrar video?")) {
        await _supabase.from('videos').delete().eq('id', id);
        location.reload();
    }
}

// --- SUBIDA VIDEO ---
let fileToUpload = null;
function configurarSubida() {
    document.getElementById('input-video-file').addEventListener('change', (e) => {
        if(e.target.files[0]) {
            fileToUpload = e.target.files[0];
            document.getElementById('modal-upload').style.display = 'flex';
        }
    });
}
window.confirmarSubida = async function() {
    if(!fileToUpload) return;
    const btn = document.querySelector('.btn-confirm');
    btn.innerText = "SUBIENDO...";
    
    const nombre = `${Date.now()}_${myId}.mp4`;
    const { error: upErr } = await _supabase.storage.from('videos').upload(nombre, fileToUpload);
    if(upErr) { alert("Error subida"); return; }
    
    const { data: { publicUrl } } = _supabase.storage.from('videos').getPublicUrl(nombre);
    
    await _supabase.from('videos').insert([{
        video_url: publicUrl,
        owner_id: myId, // ID IMPORTANTE
        usuario: currentProfile.alias, // Respaldo
        avatar: currentProfile.avatar, // Respaldo
        titulo: document.getElementById('up-titulo').value || 'Video',
        descripcion: document.getElementById('up-desc').value,
        etiquetas: [document.getElementById('up-etiqueta').value],
        config_orientacion: document.getElementById('up-orientacion').value
    }]);
    
    location.reload();
}
window.cancelarSubida = () => document.getElementById('modal-upload').style.display='none';

// --- CONFIG TABS y ETIQUETAS ---
function configurarTabs() { /* Lógica estándar de cambio de tabs */ }
window.cambiarTab = function(tab) {
    document.querySelectorAll('.seccion-app').forEach(e => e.style.display='none');
    document.querySelectorAll('.tab-btn').forEach(e => e.classList.remove('activo'));
    document.getElementById('tab-'+tab).style.display='block';
    
    if(tab === 'comunidad') { cargarFeed('comunidad'); document.querySelectorAll('.tab-btn')[0].classList.add('activo'); }
    if(tab === 'mis-videos') { cargarFeed('mis-videos'); document.querySelectorAll('.tab-btn')[1].classList.add('activo'); }
    if(tab === 'perfil') document.querySelectorAll('.tab-btn')[2].classList.add('activo');
}

function cargarEtiquetas() {
    const bar = document.getElementById('barra-etiquetas');
    const sel = document.getElementById('up-etiqueta');
    etiquetas.forEach(tag => {
        bar.innerHTML += `<span class="tag-pill" onclick="filtrar('${tag}')">${tag}</span>`;
        sel.innerHTML += `<option value="${tag}">${tag}</option>`;
    });
}

// Selector Avatar
window.abrirSelectorAvatar = function() {
    const grid = document.getElementById('grid-avatars');
    grid.innerHTML = "";
    avatares.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.onclick = () => {
            document.getElementById('edit-avatar-preview').src = url;
            document.getElementById('modal-avatar').style.display='none';
        };
        grid.appendChild(img);
    });
    document.getElementById('modal-avatar').style.display='flex';
        }
            
