// --- 1. CONFIGURACIÓN ---
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// DATOS GLOBALES
let usuarioActual = null; // Objeto del usuario (Supabase)
let perfilActual = null;  // Datos del perfil (tabla perfiles)
let etiquetasSeleccionadas = [];
let avatarSeleccionadoTemp = "";

// LISTA DE IMÁGENES DE PERFIL
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

// ETIQUETAS DISPONIBLES
const TAGS = [
    "Epico", "Juegos", "Corto", "Largo", "Vtuber", "Ciencia", 
    "Vlogs", "Cocina", "Música", "Tutorial", "Cine", "Humor", 
    "Terror", "ASMR", "Arte", "IA", "Noticias", "Random"
];

// --- 2. INICIO Y SESIÓN ---
_supabase.auth.onAuthStateChange(async (event, session) => {
    const auth = document.getElementById('auth-container');
    const app = document.getElementById('contenido-app');

    if (session) {
        // Usuario Logueado (Google)
        usuarioActual = session.user;
        await cargarDatosPerfil(usuarioActual.id, 'google', session.user.user_metadata);
        auth.style.display = 'none';
        app.style.display = 'block';
    } else {
        // Verificar Invitado
        const invitadoId = localStorage.getItem('nai_invitado_id');
        if (invitadoId) {
            usuarioActual = { id: invitadoId, role: 'invitado' };
            await cargarDatosPerfil(invitadoId, 'invitado', null);
            auth.style.display = 'none';
            app.style.display = 'block';
        } else {
            // Nadie
            auth.style.display = 'flex';
            app.style.display = 'none';
        }
    }
    cargarFeed();
});

// FUNCIONES DE LOGIN
window.loginConGoogle = async () => {
    await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
    });
};

window.entrarComoInvitado = () => {
    localStorage.setItem('nai_invitado_id', 'INV-' + Date.now());
    location.reload();
};

window.logout = async () => {
    localStorage.removeItem('nai_invitado_id');
    await _supabase.auth.signOut();
    location.reload();
};

// --- 3. GESTIÓN DE PERFIL ---
async function cargarDatosPerfil(uid, tipo, metadata) {
    let { data: perfil } = await _supabase.from('perfiles').select('*').eq('user_id', uid).single();

    if (!perfil) {
        // Crear perfil nuevo si no existe
        const nuevoPerfil = {
            user_id: uid,
            alias: metadata ? metadata.full_name : "Invitado",
            avatar: metadata ? metadata.avatar_url : AVATARES[0],
            tipo_cuenta: tipo,
            gua: 100
        };
        const { data, error } = await _supabase.from('perfiles').insert([nuevoPerfil]).select().single();
        if(!error) perfil = data;
    }
    perfilActual = perfil;
    actualizarUIUsuario();
}

function actualizarUIUsuario() {
    if(!perfilActual) return;
    document.getElementById('p-alias').innerText = perfilActual.alias;
    document.getElementById('p-avatar').src = perfilActual.avatar;
    document.getElementById('p-gua').innerText = perfilActual.gua;
}

// --- 4. EDITOR DE PERFIL ---
window.abrirEditorPerfil = () => {
    document.getElementById('edit-alias').value = perfilActual.alias;
    avatarSeleccionadoTemp = perfilActual.avatar;
    
    // Generar Grid de Avatares
    const grid = document.getElementById('grid-avatares');
    grid.innerHTML = AVATARES.map(url => `
        <img src="${url}" class="avatar-option ${url === perfilActual.avatar ? 'selected' : ''}" 
        onclick="seleccionarAvatar(this, '${url}')">
    `).join('');
    
    document.getElementById('modal-perfil').style.display = 'flex';
};

window.seleccionarAvatar = (img, url) => {
    document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
    img.classList.add('selected');
    avatarSeleccionadoTemp = url;
};

window.convertirEnCuentaApp = () => {
    const aliasInput = document.getElementById('edit-alias');
    if (!aliasInput.value.includes('.Nai')) {
        aliasInput.value = aliasInput.value.trim() + '.Nai';
    }
};

window.guardarCambiosPerfil = async () => {
    const nuevoAlias = document.getElementById('edit-alias').value;
    const tipo = nuevoAlias.endsWith('.Nai') ? 'app' : perfilActual.tipo_cuenta;

    const { error } = await _supabase.from('perfiles').update({
        alias: nuevoAlias,
        avatar: avatarSeleccionadoTemp,
        tipo_cuenta: tipo
    }).eq('user_id', perfilActual.user_id);

    if (error) alert("Error al guardar: " + error.message);
    else {
        perfilActual.alias = nuevoAlias;
        perfilActual.avatar = avatarSeleccionadoTemp;
        perfilActual.tipo_cuenta = tipo;
        actualizarUIUsuario();
        cerrarEditorPerfil();
    }
};

window.cerrarEditorPerfil = () => document.getElementById('modal-perfil').style.display = 'none';

// --- 5. SISTEMA DE SUBIDA DE VIDEOS ---
window.abrirModalSubida = () => {
    // Generar Etiquetas
    const listaTags = document.getElementById('lista-tags');
    etiquetasSeleccionadas = [];
    listaTags.innerHTML = TAGS.map(tag => `
        <span class="tag-option" onclick="toggleTag(this, '${tag}')">${tag}</span>
    `).join('');
    
    document.getElementById('modal-subida').style.display = 'flex';
};

window.toggleTag = (el, tag) => {
    if (etiquetasSeleccionadas.includes(tag)) {
        etiquetasSeleccionadas = etiquetasSeleccionadas.filter(t => t !== tag);
        el.classList.remove('selected');
    } else {
        if(etiquetasSeleccionadas.length < 3) { // Máximo 3 etiquetas
            etiquetasSeleccionadas.push(tag);
            el.classList.add('selected');
        } else {
            alert("Máximo 3 etiquetas");
        }
    }
};

window.procesarSubida = async () => {
    const file = document.getElementById('v-archivo').files[0];
    const titulo = document.getElementById('v-titulo').value;
    
    if (!file || !titulo) return alert("Falta el video o el título");

    // AVISO DE RESPONSABILIDAD (SOLO INVITADOS)
    if (perfilActual.tipo_cuenta === 'invitado') {
        const confirmar = confirm("⚠️ AVISO DE RESPONSABILIDAD:\n\nAl no tener cuenta registrada, Nai-Nai no se hace responsable si este video es robado, eliminado o editado por terceros.\n\n¿Deseas continuar?");
        if (!confirmar) return;
    }

    // Subir archivo
    alert("Subiendo... por favor espera.");
    const fileName = `${Date.now()}_${Math.floor(Math.random()*1000)}`;
    
    const { data: uploadData, error: uploadError } = await _supabase.storage
        .from('videos-bucket')
        .upload(fileName, file);

    if (uploadError) return alert("Error subiendo archivo: " + uploadError.message);

    const { data: urlData } = _supabase.storage.from('videos-bucket').getPublicUrl(fileName);

    // Guardar en Base de Datos
    const { error: dbError } = await _supabase.from('videos').insert([{
        user_id: perfilActual.user_id, // Puede ser ID de Google o ID de Invitado
        video_url: urlData.publicUrl,
        titulo: titulo,
        descripcion: document.getElementById('v-desc').value,
        orientacion: document.getElementById('v-orientacion').value,
        comentarios_activos: document.getElementById('v-comentarios').value === 'true',
        etiquetas: etiquetasSeleccionadas.join(','),
        autor_alias: perfilActual.alias,
        autor_avatar: perfilActual.avatar
    }]);

    if (dbError) alert("Error guardando datos: " + dbError.message);
    else {
        alert("¡Video Publicado!");
        cerrarModalSubida();
        cargarFeed();
        // Sumar GUA (Opcional)
        /* _supabase.from('perfiles').update({ gua: perfilActual.gua + 10 }).eq('user_id', perfilActual.user_id); */
    }
};

window.cerrarModalSubida = () => document.getElementById('modal-subida').style.display = 'none';

// --- 6. FEED (MOSTRAR VIDEOS) ---
async function cargarFeed() {
    const feed = document.getElementById('feed-comunidad');
    const { data: videos, error } = await _supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

    if (!videos || videos.length === 0) {
        feed.innerHTML = "<p style='text-align:center; padding:20px;'>No hay videos aún. ¡Sube el primero!</p>";
        return;
    }

    feed.innerHTML = videos.map(v => {
        const tagsHtml = v.etiquetas ? v.etiquetas.split(',').map(t => `<span class="tag-badge">#${t}</span>`).join('') : '';
        const claseVideo = v.orientacion === 'vertical' ? 'height: 400px; object-fit: cover;' : 'width: 100%;';

        return `
        <div class="video-card">
            <div class="video-header">
                <img src="${v.autor_avatar || 'https://i.ibb.co/hF6VHB5F/1ec8541e-1.png'}" class="avatar-mini">
                <div>
                    <b>${v.autor_alias}</b>
                    <div style="font-size:0.8rem; color:#888;">${new Date(v.created_at).toLocaleDateString()}</div>
                </div>
            </div>
            
            <video src="${v.video_url}" controls style="width:100%; ${claseVideo} background:black;"></video>
            
            <div class="video-info">
                <h4 style="margin:5px 0;">${v.titulo}</h4>
                <p style="font-size:0.9rem; color:#ccc;">${v.descripcion || ''}</p>
                <div style="margin-top:5px;">${tagsHtml}</div>
                <div style="margin-top:10px; display:flex; gap:15px;">
                    <button style="background:none; border:none; color:var(--primary); cursor:pointer;">❤️ ${v.likes} Likes</button>
                    ${v.comentarios_activos ? '<button style="background:none; border:none; color:white;">💬 Comentar</button>' : '<span style="font-size:0.8rem; color:gray;">🚫 Comentarios off</span>'}
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// Cambiar Tabs
window.cambiarTab = (tab) => {
    document.querySelectorAll('.seccion-app').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('activo'));
    document.getElementById('tab-' + tab).style.display = 'block';
    
    // Marcar botón activo (lógica simple)
    const botones = document.querySelectorAll('.tab-btn');
    if(tab === 'comunidad') botones[0].classList.add('activo');
    if(tab === 'perfil') botones[1].classList.add('activo');
};
                         
