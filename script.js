// CONFIGURACIÓN SUPABASE
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// DATOS
const etiquetas = ["Gracioso", "Divertido", "Pelea", "Educativo", "Noticias", "Documental", "Historias", "Juegos", "Blogs", "Ciencias", "Humor", "Entretenimiento", "Deportes", "Tecnología", "Cultura", "Música", "Cine", "Series", "Arte", "Comedia", "Debate", "Tutoriales", "Investigación", "Salud", "Viajes", "Gastronomía", "Moda", "Jardinería", "Animales", "Familia", "Negocios", "Ajedrez", "Juegos de Naikin", "Carreras universitarias", "Otro"];
const avatares = ["https://i.ibb.co/hF6VHB5F/1ec8541e-1.png", "https://i.ibb.co/kLMbfDM/c876007d.png", "https://i.ibb.co/TqMHL17S/44-sin-t-tulo2.png", "https://i.ibb.co/Gf3LYb3q/39-sin-t-tulo4.png", "https://i.ibb.co/chtYqpFv/39-sin-t-tulo3.png", "https://i.ibb.co/fdXfwHnC/22-sin-t-tulo.png", "https://i.ibb.co/JRWddJSh/blooder.png", "https://i.ibb.co/M5Mjpg30/22-sin-t-tulo4.png", "https://i.ibb.co/kVzNDn0R/roba-venas2.png", "https://i.ibb.co/r2CvYDzq/1767980417276.png", "https://i.ibb.co/dwVqvWSc/49-sin-t-tulo.png", "https://i.ibb.co/99w1588C/45-sin-t-tulo.png", "https://i.ibb.co/zHL2NFf8/57-sin-t-tulo.png", "https://i.ibb.co/PZJj37WD/57-sin-t-tulo2.png", "https://i.ibb.co/W4bCrNhK/57-sin-t-tulo3.png", "https://i.ibb.co/TBJ4SSF3/59-sin-t-tulo.png", "https://i.ibb.co/rgcQpZr/58-sin-t-tulo.png", "https://i.ibb.co/Qv0KF6wC/60-sin-t-tulo.png", "https://i.ibb.co/m548FFDK/61-sin-t-tulo.png", "https://i.ibb.co/9kNb2pLF/62-sin-t-tulo.png", "https://i.ibb.co/MX6b1Yk/64-sin-t-tulo.png", "https://i.ibb.co/CF0jfPj/66-sin-t-tulo.png", "https://i.ibb.co/fVWZgb6Q/65-sin-t-tulo.png", "https://i.ibb.co/B55wWK3W/67-sin-t-tulo.png", "https://i.ibb.co/7dyQd1vf/75-sin-t-tulo8.png", "https://i.ibb.co/DDWcKxNy/75-sin-t-tulo4.png", "https://i.ibb.co/GQjLDjk9/75-sin-t-tulo.png", "https://i.ibb.co/4ZbzqqGz/83-sin-t-tulo.png", "https://i.ibb.co/nqN37BDq/82-sin-t-tulo2.png", "https://i.ibb.co/vCdRv7qG/86-sin-t-tulo2.png", "https://i.ibb.co/wNs2x97p/86-sin-t-tulo.png", "https://i.ibb.co/d0GndZNk/91-sin-t-tulo.png"];

// --- ESTADO USUARIO (FORZADO A ID 1) ---
// Como cambiaste tu ID en Supabase a 1, forzamos al navegador a reconocerte así
localStorage.setItem('nai_user_id', '1'); 
let myId = "1";
let currentProfile = {};

document.addEventListener('DOMContentLoaded', async () => {
    await cargarPerfilUsuario();
    cargarEtiquetas();
    cargarFeed('comunidad');
    configurarSubida();
});

// --- 1. GESTIÓN DE PERFILES ---
async function cargarPerfilUsuario() {
    let { data, error } = await _supabase.from('perfiles').select('*').eq('user_id', myId).single();
    
    if(!data) {
        const nuevoPerfil = {
            user_id: myId,
            alias: "NAIKIN 👑",
            bio: "El dueño de la app.",
            avatar: avatares[0],
            estado: "👑",
            gua: 1000
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
    } else {
        linkEl.style.display = "none";
    }
}

// --- 2. NAIKIN VIP Y PERFILES ---
window.verPerfilNaikin = async function() {
    // Apuntamos al ID 1 que es el tuyo
    abrirPerfilAjeno("1"); 
}

window.abrirPerfilAjeno = async function(userId) {
    const modal = document.getElementById('modal-perfil-ajeno');
    const cont = document.getElementById('contenido-perfil-ajeno');
    modal.style.display = 'flex';
    cont.innerHTML = "<p>Cargando socio...</p>";

    const { data: perfil } = await _supabase.from('perfiles').select('*').eq('user_id', userId).single();
    
    if(!perfil) {
        cont.innerHTML = `<h3>Socio no encontrado</h3><button onclick="document.getElementById('modal-perfil-ajeno').style.display='none'" class="btn-cancel">Cerrar</button>`;
        return;
    }

    cont.innerHTML = `
        <img src="${perfil.avatar}" style="width:80px; height:80px; border-radius:50%; border:2px solid #00f2ea; object-fit:cover;">
        <h2>${perfil.alias} ${perfil.estado || ''}</h2>
        <p style="color:gray; font-size:0.8rem;">ID: ${perfil.user_id}</p>
        <p style="margin:10px 0; font-style:italic;">"${perfil.bio || ''}"</p>
        <div style="background:#222; padding:10px; border-radius:10px; margin:10px 0;">
            <b>${perfil.gua} GUA</b>
        </div>
        ${perfil.link ? `<a href="${perfil.link}" target="_blank" style="color:#00f2ea;">🔗 Ver Enlace</a>` : ''}
        <br><br>
        <button onclick="document.getElementById('modal-perfil-ajeno').style.display='none'" class="btn-cancel">Cerrar</button>
    `;
}

// --- 3. FEED DE VIDEOS ---
async function cargarFeed(tipo) {
    const contenedor = (tipo === 'comunidad') ? document.getElementById('feed-comunidad') : document.getElementById('lista-mis-videos');
    contenedor.innerHTML = "<p style='text-align:center'>Cargando videos...</p>";

    let query = _supabase.from('videos').select('*').order('id', { ascending: false });
    if(tipo === 'mis-videos') query = query.eq('owner_id', myId);

    const { data, error } = await query;
    if(error || !data) return;

    contenedor.innerHTML = "";
    for (const v of data) {
        // Obtenemos info real del autor
        const { data: autor } = await _supabase.from('perfiles').select('alias, avatar, estado').eq('user_id', v.owner_id).single();
        
        const card = document.createElement('div');
        card.className = "post-card";
        
        let btnBorrar = (v.owner_id == myId) 
            ? `<button onclick="borrarVideo(${v.id})" style="color:#ff4444; background:none; border:none; cursor:pointer;"><i class="fas fa-trash"></i></button>`
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
                <button class="action-btn" onclick="darLike(this, ${v.id})"><i class="far fa-heart"></i> <span class="likes-text">${v.likes_count || 0}</span></button>
                <button class="action-btn" onclick="alert('Enlace copiado!')"><i class="fas fa-share-alt"></i></button>
            </div>
            <div class="card-meta">
                <div class="video-title">${v.titulo}</div>
                <div class="video-desc">${v.descripcion}</div>
            </div>
        `;
        contenedor.appendChild(card);
    }
}

// --- SUBIDA DE VIDEOS ---
let fileToUpload = null;
function configurarSubida() {
    const input = document.getElementById('input-video-file');
    if(input) {
        input.addEventListener('change', (e) => {
            if(e.target.files[0]) {
                fileToUpload = e.target.files[0];
                document.getElementById('modal-upload').style.display = 'flex';
            }
        });
    }
}

window.confirmarSubida = async function() {
    if(!fileToUpload) return;
    const btn = document.querySelector('.btn-confirm');
    const originalText = btn.innerText;
    btn.innerText = "SUBIENDO...";
    btn.disabled = true;
    
    const nombre = `${Date.now()}_ID${myId}.mp4`;
    const { error: upErr } = await _supabase.storage.from('videos').upload(nombre, fileToUpload);
    
    if(upErr) { 
        alert("Error al subir al storage"); 
        btn.innerText = originalText;
        btn.disabled = false;
        return; 
    }
    
    const { data: { publicUrl } } = _supabase.storage.from('videos').getPublicUrl(nombre);
    
    await _supabase.from('videos').insert([{
        video_url: publicUrl,
        owner_id: myId,
        usuario: currentProfile.alias,
        avatar: currentProfile.avatar,
        titulo: document.getElementById('up-titulo').value || 'Video sin título',
        descripcion: document.getElementById('up-desc').value || '',
        etiquetas: [document.getElementById('up-etiqueta').value],
        config_orientacion: document.getElementById('up-orientacion').value
    }]);
    
    location.reload();
}

// --- FUNCIONES INTERFAZ ---
window.cambiarTab = function(tab) {
    document.querySelectorAll('.seccion-app').forEach(e => e.style.display='none');
    document.querySelectorAll('.tab-btn').forEach(e => e.classList.remove('activo'));
    document.getElementById('tab-'+tab).style.display='block';
    
    if(tab === 'comunidad') { cargarFeed('comunidad'); document.querySelectorAll('.tab-btn')[0].classList.add('activo'); }
    if(tab === 'mis-videos') { cargarFeed('mis-videos'); document.querySelectorAll('.tab-btn')[1].classList.add('activo'); }
    if(tab === 'perfil') { document.querySelectorAll('.tab-btn')[2].classList.add('activo'); actualizarDOMPerfil(); }
}

function cargarEtiquetas() {
    const bar = document.getElementById('barra-etiquetas');
    const sel = document.getElementById('up-etiqueta');
    if(!bar || !sel) return;
    etiquetas.forEach(tag => {
        bar.innerHTML += `<span class="tag-pill" onclick="alert('Filtrando por ${tag}...')">${tag}</span>`;
        sel.innerHTML += `<option value="${tag}">${tag}</option>`;
    });
}

window.abrirEditorPerfil = function() {
    document.getElementById('edit-alias').value = currentProfile.alias;
    document.getElementById('edit-bio').value = currentProfile.bio;
    document.getElementById('edit-link').value = currentProfile.link || "";
    document.getElementById('edit-estado').value = currentProfile.estado;
    document.getElementById('edit-avatar-preview').src = currentProfile.avatar;
    document.getElementById('modal-editor').style.display = 'flex';
}

window.guardarPerfil = async function() {
    const nuevosDatos = {
        alias: document.getElementById('edit-alias').value,
        bio: document.getElementById('edit-bio').value,
        link: document.getElementById('edit-link').value,
        estado: document.getElementById('edit-estado').value,
        avatar: document.getElementById('edit-avatar-preview').src
    };
    await _supabase.from('perfiles').update(nuevosDatos).eq('user_id', myId);
    currentProfile = { ...currentProfile, ...nuevosDatos };
    actualizarDOMPerfil();
    document.getElementById('modal-editor').style.display = 'none';
    alert("Perfil de dueño actualizado!");
}

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
    if(confirm("¿Seguro que quieres borrar tu video?")) {
        await _supabase.from('videos').delete().eq('id', id);
        location.reload();
    }
}

window.toggleFull = function(id) {
    const v = document.getElementById(id);
    if(v.requestFullscreen) v.requestFullscreen();
    else if(v.webkitRequestFullscreen) v.webkitRequestFullscreen();
}
window.cancelarSubida = () => document.getElementById('modal-upload').style.display='none';
window.cerrarEditor = () => document.getElementById('modal-editor').style.display='none';
    
