// --- CONFIGURACIÓN SUPABASE ---
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- DATOS MAESTROS ---
const etiquetas = [
    "Gracioso", "Divertido", "Pelea", "Educativo", "Noticias", "Documental", "Historias", 
    "Juegos", "Blogs", "Ciencias", "Humor", "Entretenimiento", "Deportes", "Tecnología", 
    "Cultura", "Música", "Cine", "Series", "Arte", "Comedia", "Debate", "Tutoriales", 
    "Investigación", "Salud", "Viajes", "Gastronomía", "Moda", "Jardinería", "Animales", 
    "Familia", "Negocios", "Ajedrez", "Juegos de Naikin", "Carreras universitarias", "Otro"
];

const avatares = [
    "https://i.ibb.co/hF6VHB5F/1ec8541e-1.png", "https://i.ibb.co/kLMbfDM/c876007d.png", "https://i.ibb.co/TqMHL17S/44-sin-t-tulo2.png",
    "https://i.ibb.co/Gf3LYb3q/39-sin-t-tulo4.png", "https://i.ibb.co/chtYqpFv/39-sin-t-tulo3.png", "https://i.ibb.co/fdXfwHnC/22-sin-t-tulo.png",
    "https://i.ibb.co/JRWddJSh/blooder.png", "https://i.ibb.co/M5Mjpg30/22-sin-t-tulo4.png", "https://i.ibb.co/kVzNDn0R/roba-venas2.png",
    "https://i.ibb.co/r2CvYDzq/1767980417276.png", "https://i.ibb.co/dwVqvWSc/49-sin-t-tulo.png", "https://i.ibb.co/99w1588C/45-sin-t-tulo.png",
    "https://i.ibb.co/zHL2NFf8/57-sin-t-tulo.png", "https://i.ibb.co/PZJj37WD/57-sin-t-tulo2.png", "https://i.ibb.co/W4bCrNhK/57-sin-t-tulo3.png",
    "https://i.ibb.co/TBJ4SSF3/59-sin-t-tulo.png", "https://i.ibb.co/rgcQpZr/58-sin-t-tulo.png", "https://i.ibb.co/Qv0KF6wC/60-sin-t-tulo.png",
    "https://i.ibb.co/m548FFDK/61-sin-t-tulo.png", "https://i.ibb.co/9kNb2pLF/62-sin-t-tulo.png", "https://i.ibb.co/MX6b1Yk/64-sin-t-tulo.png",
    "https://i.ibb.co/CF0jfPj/66-sin-t-tulo.png", "https://i.ibb.co/fVWZgb6Q/65-sin-t-tulo.png", "https://i.ibb.co/B55wWK3W/67-sin-t-tulo.png",
    "https://i.ibb.co/7dyQd1vf/75-sin-t-tulo8.png", "https://i.ibb.co/DDWcKxNy/75-sin-t-tulo4.png", "https://i.ibb.co/GQjLDjk9/75-sin-t-tulo.png",
    "https://i.ibb.co/4ZbzqqGz/83-sin-t-tulo.png", "https://i.ibb.co/nqN37BDq/82-sin-t-tulo2.png", "https://i.ibb.co/vCdRv7qG/86-sin-t-tulo2.png",
    "https://i.ibb.co/wNs2x97p/86-sin-t-tulo.png", "https://i.ibb.co/d0GndZNk/91-sin-t-tulo.png"
];

let currentUser = { id: null, avatar: null, gua: 100 }; // GUA iniciales
let fileToUpload = null;

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    identificarUsuario();
    cargarEtiquetas();
    cargarVideosComunidad();
    configurarInputSubida();
    actualizarInterfazPerfil();
});

// 1. SISTEMA DE USUARIO
function identificarUsuario() {
    // Simulamos un sistema de ID persistente
    let storedId = localStorage.getItem('nai_user_id');
    let storedAvatar = localStorage.getItem('nai_user_avatar');

    if (!storedId) {
        storedId = Math.floor(Math.random() * 10000) + 1; // ID random por ahora (simula orden de llegada)
        localStorage.setItem('nai_user_id', storedId);
        // Avatar por defecto el primero
        storedAvatar = avatares[0];
        localStorage.setItem('nai_user_avatar', storedAvatar);
    }
    
    currentUser.id = storedId;
    currentUser.avatar = storedAvatar || avatares[0];
}

function actualizarInterfazPerfil() {
    document.getElementById('id-usuario-display').innerText = `Usuario ID: ${currentUser.id}`;
    document.getElementById('avatar-actual').src = currentUser.avatar;
    document.getElementById('miAvatarMini').src = currentUser.avatar; // En navbar si existiera
}

// 2. NAVEGACIÓN (TABS)
window.cambiarTab = function(tabName) {
    // Ocultar todos
    document.querySelectorAll('.seccion-app').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('activo'));
    
    // Mostrar seleccionado
    document.getElementById(`tab-${tabName}`).style.display = 'block';
    
    // Activar botón
    const buttons = document.querySelectorAll('.tab-btn');
    if(tabName === 'comunidad') buttons[0].classList.add('activo');
    if(tabName === 'mis-videos') {
        buttons[1].classList.add('activo');
        cargarMisVideos(); // Recargar mis videos al entrar
    }
    if(tabName === 'perfil') buttons[2].classList.add('activo');
};

// 3. ETIQUETAS
function cargarEtiquetas() {
    const contenedor = document.getElementById('barra-etiquetas');
    const selectSubida = document.getElementById('up-etiqueta');
    
    contenedor.innerHTML = `<span class="tag-pill activo" onclick="filtrarPorEtiqueta('Todos', this)">Todos</span>`;
    
    etiquetas.forEach(tag => {
        // En la barra superior
        const span = document.createElement('span');
        span.className = 'tag-pill';
        span.innerText = tag;
        span.onclick = function() { filtrarPorEtiqueta(tag, this); };
        contenedor.appendChild(span);
        
        // En el select de subida
        const option = document.createElement('option');
        option.value = tag;
        option.innerText = tag;
        selectSubida.appendChild(option);
    });
}

// 4. FLUJO DE SUBIDA
function configurarInputSubida() {
    const input = document.getElementById('input-video-file');
    input.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            fileToUpload = e.target.files[0];
            // Abrir Modal
            document.getElementById('modal-upload').style.display = 'flex';
        }
    });
}

window.cancelarSubida = function() {
    fileToUpload = null;
    document.getElementById('input-video-file').value = "";
    document.getElementById('modal-upload').style.display = 'none';
};

window.toggleFuente = function(val) {
    document.getElementById('up-fuente').style.display = (val === 'no') ? 'block' : 'none';
};

window.confirmarSubida = async function() {
    if (!fileToUpload) return;
    
    const titulo = document.getElementById('up-titulo').value || `Video de ID ${currentUser.id}`;
    const desc = document.getElementById('up-desc').value || "";
    const etiqueta = document.getElementById('up-etiqueta').value;
    const config = {
        comentarios: document.getElementById('up-comentarios').checked,
        audio: document.getElementById('up-audio').checked,
        orientacion: document.getElementById('up-orientacion').value,
        es_propio: document.getElementById('up-propio').value === 'si',
        fuente: document.getElementById('up-fuente').value
    };

    // Validar Reglas
    if (etiqueta === 'Humor' || etiqueta === 'Educativo') {
        // Pasa
    } else {
        // Podríamos poner un aviso de +18 aquí
    }

    // UI de carga
    const btn = document.querySelector('.btn-confirm');
    btn.innerText = "SUBIENDO...";
    btn.disabled = true;

    try {
        const fileName = `${Date.now()}_${currentUser.id}_vid.mp4`;
        
        // 1. Subir Video
        const { error: uploadError } = await _supabase.storage.from('videos').upload(fileName, fileToUpload);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = _supabase.storage.from('videos').getPublicUrl(fileName);

        // 2. Guardar Datos
        const { error: dbError } = await _supabase.from('videos').insert([{
            video_url: publicUrl,
            usuario: `ID ${currentUser.id}`, // Usamos el ID como nombre
            avatar: currentUser.avatar,
            titulo: titulo,
            descripcion: desc,
            etiquetas: [etiqueta], // Array
            config_comentarios: config.comentarios,
            config_orientacion: config.orientacion,
            es_propio: config.es_propio,
            fuente_externa: config.fuente,
            owner_id: currentUser.id // Guardamos quién lo subió para el perfil
        }]);

        if (dbError) throw dbError;

        alert("¡Video publicado con éxito!");
        location.reload();

    } catch (err) {
        alert("Error: " + err.message);
        btn.innerText = "Reintentar";
        btn.disabled = false;
    }
};

// 5. RENDERIZADO DE VIDEOS (COMUNIDAD)
async function cargarVideosComunidad() {
    const contenedor = document.getElementById('feed-comunidad');
    const { data, error } = await _supabase.from('videos').select('*').order('id', { ascending: false });
    
    if (error) { contenedor.innerHTML = "Error de conexión"; return; }
    
    contenedor.innerHTML = "";
    data.forEach(v => {
        const card = crearTarjetaVideo(v, false); // false = modo comunidad
        contenedor.appendChild(card);
    });
}

// 6. RENDERIZADO DE MIS VIDEOS
async function cargarMisVideos() {
    const contenedor = document.getElementById('lista-mis-videos');
    // Filtramos solo los que coincidan con el usuario actual (por nombre/ID)
    // NOTA: Como no hay auth real, filtramos por el campo usuario que guardamos como "ID X"
    const { data } = await _supabase.from('videos').select('*').eq('usuario', `ID ${currentUser.id}`).order('id', { ascending: false });
    
    contenedor.innerHTML = "";
    if(!data || data.length === 0) {
        contenedor.innerHTML = "<p style='text-align:center; color:gray;'>Aún no has subido videos.</p>";
        return;
    }

    data.forEach(v => {
        const card = crearTarjetaVideo(v, true); // true = modo edición (borrar)
        contenedor.appendChild(card);
    });
}

// COMPONENTE TARJETA DE VIDEO
function crearTarjetaVideo(v, esMio) {
    const div = document.createElement('div');
    div.className = 'post-card';
    
    // Lógica de orientación
    const estiloVideo = (v.config_orientacion === 'vertical') ? 'aspect-ratio: 9/16; object-fit: cover;' : '';

    const botonBorrar = esMio 
        ? `<button onclick="borrarVideo(${v.id})" style="background:red; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">Borrar X</button>` 
        : `<button onclick="accionRecomendar(${v.id})" class="action-btn" title="Recomendar"><i class="fas fa-star"></i></button>`;

    div.innerHTML = `
        <div class="card-header">
            <div class="user-info">
                <img src="${v.avatar}" class="avatar-mini">
                <div>
                    <div class="user-name">${v.usuario}</div>
                    <div class="post-tag">${v.etiquetas ? v.etiquetas[0] : 'General'}</div>
                </div>
            </div>
            ${botonBorrar}
        </div>
        
        <div class="video-wrapper">
            <video id="vid-${v.id}" src="${v.video_url}" controls loop playsinline style="${estiloVideo}"></video>
            <button class="btn-fullscreen" onclick="toggleFull(this, 'vid-${v.id}')"><i class="fas fa-expand"></i></button>
        </div>

        <div class="card-actions">
            <button class="action-btn" onclick="darLike(this)"><i class="far fa-heart"></i> <span class="likes-text">Me gusta</span></button>
            <button class="action-btn" onclick="compartirInterno(${v.id})"><i class="fas fa-share-alt"></i></button>
            <button class="action-btn" onclick="encuesta(${v.id})"><i class="fas fa-poll"></i></button>
        </div>

        <div class="card-meta">
            <div class="video-title">${v.titulo || 'Sin título'}</div>
            <div class="video-desc">${v.descripcion || ''}</div>
            ${v.es_propio ? '' : `<div class="video-source">Fuente: ${v.fuente_externa || 'Externa'}</div>`}
            ${v.config_comentarios ? '<div style="color:gray; font-size:0.8rem; margin-top:5px;">Ver comentarios...</div>' : '<div style="color:gray; font-size:0.8rem; margin-top:5px;"><i>Comentarios desactivados</i></div>'}
        </div>
    `;
    return div;
}

// 7. FUNCIONES EXTRA (Fullscreen, Borrar, Reglas, Avatar)
window.toggleFull = function(btn, vidId) {
    const video = document.getElementById(vidId);
    if (!document.fullscreenElement) {
        if(video.requestFullscreen) video.requestFullscreen();
        else if(video.webkitRequestFullscreen) video.webkitRequestFullscreen(); // Safari
    } else {
        if(document.exitFullscreen) document.exitFullscreen();
    }
};

window.borrarVideo = async function(id) {
    if(!confirm("¿Seguro que quieres desaparecer la x?")) return;
    await _supabase.from('videos').delete().eq('id', id);
    alert("Video borrado.");
    location.reload();
};

window.abrirSelectorAvatar = function() {
    const modal = document.getElementById('modal-avatar');
    const grid = document.getElementById('grid-avatars');
    grid.innerHTML = "";
    avatares.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.onclick = () => {
            currentUser.avatar = url;
            localStorage.setItem('nai_user_avatar', url);
            actualizarInterfazPerfil();
            modal.style.display = 'none';
        };
        grid.appendChild(img);
    });
    modal.style.display = 'flex';
};

window.verReglas = function() {
    alert("REGLAS NAI-NAI:\n\n1. Prohibido +18 (salvo humor/educativo etiquetado).\n2. Respeto (No beef sin contexto).\n3. GUA con responsabilidad.\n4. Identificación por ID Obligatoria.");
};

window.filtrarPorEtiqueta = function(tag, element) {
    document.querySelectorAll('.tag-pill').forEach(e => e.classList.remove('activo'));
    element.classList.add('activo');
    
    const videos = document.querySelectorAll('#feed-comunidad .post-card');
    videos.forEach(card => {
        const tagEnCarta = card.querySelector('.post-tag').innerText;
        if (tag === 'Todos' || tagEnCarta === tag) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
};

window.compartirInterno = function(id) {
    const destino = prompt("Ingresa el ID del usuario para enviar:");
    if(destino) alert(`Video enviado al usuario ID ${destino} (Simulado)`);
};

window.encuesta = function(id) {
    prompt("¿Por qué recomiendas este video? (Escribe tu razón)");
    alert("Gracias por tu opinión.");
}

window.darLike = function(btn) {
    btn.style.color = "#00f2ea";
    btn.querySelector('i').className = "fas fa-heart";
                      }
        
