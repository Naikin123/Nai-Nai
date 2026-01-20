// --- 1. CONFIGURACIÓN ---
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Variables Globales
let usuarioActual = null;
let perfilData = null;
let etiquetasSeleccionadas = [];
let avatarTemp = "";

// LISTA DE AVATARES
const AVATARES = [
    "https://i.ibb.co/hF6VHB5F/1ec8541e-1.png", "https://i.ibb.co/kLMbfDM/c876007d.png",
    "https://i.ibb.co/TqMHL17S/44-sin-t-tulo2.png", "https://i.ibb.co/Gf3LYb3q/39-sin-t-tulo4.png",
    "https://i.ibb.co/chtYqpFv/39-sin-t-tulo3.png", "https://i.ibb.co/fdXfwHnC/22-sin-t-tulo.png",
    "https://i.ibb.co/JRWddJSh/blooder.png", "https://i.ibb.co/M5Mjpg30/22-sin-t-tulo4.png",
    "https://i.ibb.co/kVzNDn0R/roba-venas2.png", "https://i.ibb.co/r2CvYDzq/1767980417276.png",
    "https://i.ibb.co/dwVqvWSc/49-sin-t-tulo.png", "https://i.ibb.co/99w1588C/45-sin-t-tulo.png",
    "https://i.ibb.co/zHL2NFf8/57-sin-t-tulo.png", "https://i.ibb.co/PZJj37WD/57-sin-t-tulo2.png",
    "https://i.ibb.co/W4bCrNhK/57-sin-t-tulo3.png", "https://i.ibb.co/TBJ4SSF3/59-sin-t-tulo.png",
    "https://i.ibb.co/rgcQpZr/58-sin-t-tulo.png", "https://i.ibb.co/Qv0KF6wC/60-sin-t-tulo.png",
    "https://i.ibb.co/m548FFDK/61-sin-t-tulo.png", "https://i.ibb.co/9kNb2pLF/62-sin-t-tulo.png",
    "https://i.ibb.co/MX6b1Yk/64-sin-t-tulo.png", "https://i.ibb.co/CF0jfPj/66-sin-t-tulo.png",
    "https://i.ibb.co/fVWZgb6Q/65-sin-t-tulo.png", "https://i.ibb.co/B55wWK3W/67-sin-t-tulo.png",
    "https://i.ibb.co/7dyQd1vf/75-sin-t-tulo8.png", "https://i.ibb.co/DDWcKxNy/75-sin-t-tulo4.png",
    "https://i.ibb.co/GQjLDjk9/75-sin-t-tulo.png", "https://i.ibb.co/4ZbzqqGz/83-sin-t-tulo.png",
    "https://i.ibb.co/nqN37BDq/82-sin-t-tulo2.png", "https://i.ibb.co/vCdRv7qG/86-sin-t-tulo2.png",
    "https://i.ibb.co/wNs2x97p/86-sin-t-tulo.png", "https://i.ibb.co/d0GndZNk/91-sin-t-tulo.png"
];

// LISTA DE ETIQUETAS
const TAGS = [
    "Epico", "Juegos", "Corto", "Largo", "Vtuber", "Ciencia", 
    "Vlogs", "Cocina", "Música", "Tutorial", "Cine", "Humor", 
    "Terror", "ASMR", "Arte", "IA", "Noticias", "Random"
];

// --- 2. SISTEMA DE INICIO (El cerebro) ---
window.onload = async () => {
    // Verificar si hay sesión de Google
    const { data: { session } } = await _supabase.auth.getSession();
    const invitadoId = localStorage.getItem('nai_invitado_id');

    if (session) {
        // Es usuario Google
        await iniciarApp(session.user.id, 'google', session.user.user_metadata);
    } else if (invitadoId) {
        // Es invitado
        await iniciarApp(invitadoId, 'invitado', null);
    } else {
        // No hay nadie
        mostrarLogin();
    }
};

function mostrarLogin() {
    document.getElementById('auth-container').style.display = 'flex';
    document.getElementById('contenido-app').style.display = 'none';
}

async function iniciarApp(uid, tipo, metadata) {
    // Ocultar login y mostrar app
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('contenido-app').style.display = 'block';

    // Buscar perfil en DB
    let { data: perfil, error } = await _supabase
        .from('perfiles')
        .select('*')
        .eq('user_id', uid) // Como ahora es TEXT, esto NO fallará
        .single();

    // Si no existe, crearlo
    if (!perfil) {
        console.log("Creando perfil nuevo...");
        const nuevoPerfil = {
            user_id: uid,
            alias: metadata ? metadata.full_name : "Invitado",
            avatar: metadata ? metadata.avatar_url : AVATARES[0],
            tipo_cuenta: tipo,
            gua: 100
        };
        const { data } = await _supabase.from('perfiles').insert([nuevoPerfil]).select().single();
        perfil = data;
    }

    perfilData = perfil;
    usuarioActual = uid;
    actualizarInterfaz();
    cargarFeed();
}

function actualizarInterfaz() {
    if (!perfilData) return;
    document.getElementById('p-alias').innerText = perfilData.alias;
    document.getElementById('p-avatar').src = perfilData.avatar;
    document.getElementById('p-gua').innerText = perfilData.gua;
    
    // Bloquear input si ya es .Nai
    const inputAlias = document.getElementById('edit-alias');
    if (inputAlias) inputAlias.disabled = perfilData.alias.endsWith('.Nai');
}

// --- 3. FUNCIONES DE BOTONES DE ACCESO ---
window.loginConGoogle = async () => {
    await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
    });
};

window.entrarComoInvitado = () => {
    const idGenerado = 'INV-' + Date.now();
    localStorage.setItem('nai_invitado_id', idGenerado);
    location.reload();
};

window.logout = async () => {
    localStorage.removeItem('nai_invitado_id');
    await _supabase.auth.signOut();
    location.reload();
};

// --- 4. FUNCIONES DE PERFIL (.NAI) ---
window.abrirEditorPerfil = () => {
    document.getElementById('modal-perfil').style.display = 'flex';
    document.getElementById('edit-alias').value = perfilData.alias;
    avatarTemp = perfilData.avatar;
    
    // Cargar Avatares
    const grid = document.getElementById('grid-avatares');
    grid.innerHTML = AVATARES.map(url => `
        <img src="${url}" class="avatar-option ${url === perfilData.avatar ? 'selected' : ''}" 
        onclick="selectAvatar(this, '${url}')">
    `).join('');
};

window.selectAvatar = (el, url) => {
    document.querySelectorAll('.avatar-option').forEach(img => img.classList.remove('selected'));
    el.classList.add('selected');
    avatarTemp = url;
};

window.convertirEnCuentaApp = () => {
    const input = document.getElementById('edit-alias');
    if (!input.value.endsWith('.Nai')) {
        input.value = input.value.trim().replace(/\s+/g, '') + '.Nai';
        alert("¡Nombre transformado! Si guardas, será permanente.");
    }
};

window.guardarCambiosPerfil = async () => {
    const nuevoAlias = document.getElementById('edit-alias').value;
    const nuevoTipo = nuevoAlias.endsWith('.Nai') ? 'app' : perfilData.tipo_cuenta;

    const { error } = await _supabase.from('perfiles').update({
        alias: nuevoAlias,
        avatar: avatarTemp,
        tipo_cuenta: nuevoTipo
    }).eq('user_id', usuarioActual);

    if (error) {
        alert("Error al guardar: " + error.message);
    } else {
        perfilData.alias = nuevoAlias;
        perfilData.avatar = avatarTemp;
        perfilData.tipo_cuenta = nuevoTipo;
        actualizarInterfaz();
        window.cerrarEditorPerfil();
    }
};

window.cerrarEditorPerfil = () => document.getElementById('modal-perfil').style.display = 'none';

// --- 5. SUBIR VIDEO ---
window.abrirModalSubida = () => {
    document.getElementById('modal-subida').style.display = 'flex';
    etiquetasSeleccionadas = [];
    document.getElementById('lista-tags').innerHTML = TAGS.map(tag => `
        <span class="tag-option" onclick="toggleTag(this, '${tag}')">${tag}</span>
    `).join('');
};

window.toggleTag = (el, tag) => {
    if (etiquetasSeleccionadas.includes(tag)) {
        etiquetasSeleccionadas = etiquetasSeleccionadas.filter(t => t !== tag);
        el.classList.remove('selected');
    } else {
        if (etiquetasSeleccionadas.length >= 3) return alert("Máximo 3 etiquetas");
        etiquetasSeleccionadas.push(tag);
        el.classList.add('selected');
    }
};

window.procesarSubida = async () => {
    const file = document.getElementById('v-archivo').files[0];
    const titulo = document.getElementById('v-titulo').value;
    
    if (!file || !titulo) return alert("Falta video o título");

    // ADVERTENCIA SI ES INVITADO
    if (perfilData.tipo_cuenta === 'invitado') {
        const aceptar = confirm("⚠️ AVISO DE RESPONSABILIDAD\n\nAl no tener cuenta registrada, Nai-Nai no se hace responsable si este contenido es borrado o editado.\n\n¿Aceptar y subir?");
        if (!aceptar) return;
    }

    alert("⏳ Subiendo video... esto puede tardar unos segundos.");
    
    // 1. Subir Archivo
    const nombreArchivo = `${Date.now()}_${Math.floor(Math.random()*1000)}`;
    const { data, error } = await _supabase.storage.from('videos-bucket').upload(nombreArchivo, file);
    
    if (error) return alert("Error al subir archivo: " + error.message);

    // 2. Obtener URL
    const { data: urlData } = _supabase.storage.from('videos-bucket').getPublicUrl(nombreArchivo);

    // 3. Guardar Datos
    const { error: dbError } = await _supabase.from('videos').insert([{
        user_id: usuarioActual,
        video_url: urlData.publicUrl,
        titulo: titulo,
        descripcion: document.getElementById('v-desc').value,
        orientacion: document.getElementById('v-orientacion').value,
        comentarios_activos: document.getElementById('v-comentarios').value === 'true',
        etiquetas: etiquetasSeleccionadas.join(','),
        autor_alias: perfilData.alias,
        autor_avatar: perfilData.avatar
    }]);

    if (dbError) {
        alert("Error guardando datos: " + dbError.message);
    } else {
        alert("✅ ¡Video Publicado!");
        window.cerrarModalSubida();
        cargarFeed();
    }
};

window.cerrarModalSubida = () => document.getElementById('modal-subida').style.display = 'none';

// --- 6. FEED ---
async function cargarFeed() {
    const feed = document.getElementById('feed-comunidad');
    feed.innerHTML = '<p style="text-align:center; padding:20px;">Cargando videos...</p>';

    const { data: videos, error } = await _supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

    if (!videos || videos.length === 0) {
        feed.innerHTML = '<p style="text-align:center; padding:20px;">No hay videos aún.</p>';
        return;
    }

    feed.innerHTML = videos.map(v => {
        const tags = v.etiquetas ? v.etiquetas.split(',').map(t => `<span class="tag-badge">#${t}</span>`).join('') : '';
        const estiloVideo = v.orientacion === 'vertical' ? 'aspect-ratio: 9/16; max-height: 500px;' : 'aspect-ratio: 16/9;';
        
        return `
            <div class="video-card">
                <div class="video-header">
                    <img src="${v.autor_avatar || AVATARES[0]}" class="avatar-mini">
                    <div>
                        <b>${v.autor_alias}</b>
                        <div style="font-size:0.75rem; color:#888;">${new Date(v.created_at).toLocaleDateString()}</div>
                    </div>
                </div>
                <video src="${v.video_url}" controls style="width:100%; ${estiloVideo} background:#000;"></video>
                <div class="video-info">
                    <h3>${v.titulo}</h3>
                    <p>${v.descripcion || ''}</p>
                    <div style="margin:5px 0;">${tags}</div>
                    <div style="display:flex; gap:15px; margin-top:10px;">
                        <button style="background:none; border:none; color:#00f2ea;">❤️ ${v.likes}</button>
                        ${v.comentarios_activos ? '<button style="background:none; border:none; color:white;">💬 Comentar</button>' : '<span style="color:gray; font-size:0.8rem;">🚫 Comentarios desactivados</span>'}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// CAMBIO DE PESTAÑAS
window.cambiarTab = (tab) => {
    document.querySelectorAll('.seccion-app').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('activo'));
    
    document.getElementById('tab-' + tab).style.display = 'block';
    
    // Activar botón visualmente
    const btns = document.querySelectorAll('.tab-btn');
    if (tab === 'comunidad') btns[0].classList.add('activo');
    if (tab === 'perfil') btns[1].classList.add('activo');
    
    if (tab === 'perfil') {
        // Cargar videos propios
        // (Aquí podrías agregar lógica para filtrar videos propios)
    }
};
        
