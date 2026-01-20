// --- 1. CONFIGURACIÓN ---
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let perfilActual = null;
let etiquetasSel = [];
let avatarTemp = "";

// TUS IMÁGENES
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
const TAGS = ["Humor", "Científico", "Epico", "Juegos", "Corto", "Vlogs", "Cocina", "Música", "Terror", "Arte", "Noticias"];

// --- INICIO ---
window.onload = async () => {
    const { data: { session } } = await _supabase.auth.getSession();
    const invitadoId = localStorage.getItem('nai_invitado_id');
    
    if (session) iniciar(session.user.id, 'google', session.user.user_metadata);
    else if (invitadoId) iniciar(invitadoId, 'invitado', null);
    else document.getElementById('auth-container').style.display = 'flex';
};

async function iniciar(uid, tipo, meta) {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('contenido-app').style.display = 'block';

    let { data: perfil } = await _supabase.from('perfiles').select('*').eq('user_id', uid).single();

    if (!perfil) {
        const nuevo = {
            user_id: uid,
            alias: meta ? meta.full_name : "Invitado",
            avatar: meta ? meta.avatar_url : AVATARES[0],
            tipo_cuenta: tipo
        };
        const { data } = await _supabase.from('perfiles').insert([nuevo]).select().single();
        perfil = data;
    }
    perfilActual = perfil;
    actualizarUI();
    cargarFeed();
}

function actualizarUI() {
    if(!perfilActual) return;
    document.getElementById('p-alias').innerText = perfilActual.alias;
    document.getElementById('p-avatar').src = perfilActual.avatar;
    document.getElementById('p-gua').innerText = perfilActual.gua;
    
    const socialLink = document.getElementById('p-link-social');
    if(perfilActual.link_social) {
        socialLink.href = perfilActual.link_social;
        socialLink.style.display = 'block';
    } else {
        socialLink.style.display = 'none';
    }
}

// --- LÓGICA CUENTA .NAI (REVERSIBLE) ---
window.abrirEditorPerfil = () => {
    document.getElementById('modal-perfil').style.display = 'flex';
    document.getElementById('edit-alias').value = perfilActual.alias;
    document.getElementById('edit-social').value = perfilActual.link_social || '';
    avatarTemp = perfilActual.avatar;
    
    // Configurar botón Nai
    const btnNai = document.getElementById('btn-nai-action');
    if (perfilActual.alias.endsWith('.Nai')) {
        btnNai.innerText = "❌ Quitar Cuenta .Nai";
        btnNai.style.background = "#555";
    } else {
        btnNai.innerText = "✨ Convertir en Cuenta .Nai";
        btnNai.style.background = "#4a00e0";
    }

    // Grid Avatares
    document.getElementById('grid-avatares').innerHTML = AVATARES.map(url => `
        <img src="${url}" class="avatar-option ${url === perfilActual.avatar ? 'selected' : ''}" 
        onclick="selAvatar(this, '${url}')">
    `).join('');
};

window.gestionarCuentaNai = () => {
    const esNai = perfilActual.alias.endsWith('.Nai');
    document.getElementById('modal-perfil').style.display = 'none'; // Ocultar editor
    document.getElementById('modal-nai-confirm').style.display = 'flex'; // Mostrar confirmación
    
    const texto = document.getElementById('nai-mensaje-texto');
    const btn = document.querySelector('#modal-nai-confirm .btn-confirmar');
    
    if (esNai) {
        texto.innerText = "¿Seguro que quieres quitar el '.Nai' de tu nombre? Perderás las ventajas asociadas.";
        btn.innerText = "QUITAR .NAI";
        btn.onclick = () => procesarCambioNai(false);
    } else {
        texto.innerText = "Esto ayuda a que te registres a otros proyectos míos con esta cuenta y te dará ventajas futuras.";
        btn.innerText = "ACEPTAR";
        btn.onclick = () => procesarCambioNai(true);
    }
};

window.procesarCambioNai = (activar) => {
    let nuevoNombre = perfilActual.alias;
    if (activar) {
        if (!nuevoNombre.endsWith('.Nai')) nuevoNombre = nuevoNombre.trim() + '.Nai';
    } else {
        if (nuevoNombre.endsWith('.Nai')) nuevoNombre = nuevoNombre.replace('.Nai', '').trim();
    }
    document.getElementById('edit-alias').value = nuevoNombre;
    document.getElementById('modal-nai-confirm').style.display = 'none';
    document.getElementById('modal-perfil').style.display = 'flex';
    
    // Actualizar botón visualmente
    const btnNai = document.getElementById('btn-nai-action');
    btnNai.innerText = activar ? "❌ Quitar Cuenta .Nai" : "✨ Convertir en Cuenta .Nai";
    btnNai.style.background = activar ? "#555" : "#4a00e0";
};

window.guardarCambiosPerfil = async () => {
    const alias = document.getElementById('edit-alias').value;
    const social = document.getElementById('edit-social').value;
    const tipo = alias.endsWith('.Nai') ? 'app' : 'google'; // O invitado, simple lógica

    await _supabase.from('perfiles').update({
        alias: alias,
        avatar: avatarTemp,
        link_social: social,
        tipo_cuenta: tipo
    }).eq('user_id', perfilActual.user_id);
    
    location.reload();
};

window.selAvatar = (el, url) => {
    document.querySelectorAll('.avatar-option').forEach(img => img.classList.remove('selected'));
    el.classList.add('selected');
    avatarTemp = url;
};

// --- SUBIR VIDEO (CON REGLAS Y LINKS) ---
window.verificarOriginalidad = () => {
    const esOriginal = document.getElementById('v-original').value === 'true';
    document.getElementById('campo-fuente').style.display = esOriginal ? 'none' : 'block';
};

window.abrirModalSubida = () => {
    etiquetasSel = [];
    document.getElementById('lista-tags').innerHTML = TAGS.map(t => `<span class="tag-option" onclick="toggleTag(this, '${t}')">${t}</span>`).join('');
    document.getElementById('modal-subida').style.display = 'flex';
};

window.toggleTag = (el, tag) => {
    if (etiquetasSel.includes(tag)) {
        etiquetasSel = etiquetasSel.filter(t => t !== tag);
        el.classList.remove('selected');
    } else {
        if (etiquetasSel.length >= 3) return alert("Máximo 3 etiquetas");
        etiquetasSel.push(tag);
        el.classList.add('selected');
    }
};

window.procesarSubida = async () => {
    const file = document.getElementById('v-archivo').files[0];
    const titulo = document.getElementById('v-titulo').value;
    const esOriginal = document.getElementById('v-original').value === 'true';
    const fuente = document.getElementById('v-fuente').value;

    if (!file || !titulo) return alert("Falta archivo o título.");
    if (!esOriginal && !fuente) return alert("¡Debes poner el link de la fuente original!");

    // Validar GUA bajo
    if (perfilActual.gua < 50) {
        if(!confirm("⚠️ Tu nivel de GUA es bajo. Tu video estará bajo vigilancia estricta. ¿Continuar?")) return;
    }

    alert("Subiendo...");
    const path = `public/${Date.now()}_${Math.floor(Math.random()*999)}`;
    const { error: upErr } = await _supabase.storage.from('videos-bucket').upload(path, file);
    if(upErr) return alert("Error subida: " + upErr.message);

    const { data: { publicUrl } } = _supabase.storage.from('videos-bucket').getPublicUrl(path);

    await _supabase.from('videos').insert([{
        user_id: perfilActual.user_id,
        video_url: publicUrl,
        titulo: titulo,
        descripcion: document.getElementById('v-desc').value,
        link_externo: document.getElementById('v-link-ext').value,
        es_original: esOriginal,
        fuente_original: fuente,
        orientacion: document.getElementById('v-orientacion').value,
        comentarios_activos: document.getElementById('v-comentarios').value === 'true',
        etiquetas: etiquetasSel.join(','),
        autor_alias: perfilActual.alias,
        autor_avatar: perfilActual.avatar
    }]);

    alert("¡Video subido!");
    location.reload();
};

// --- FEED Y REPORTES GUA ---
async function cargarFeed() {
    const { data: videos } = await _supabase.from('videos').select('*').order('created_at', {ascending:false});
    const feed = document.getElementById('feed-comunidad');
    
    feed.innerHTML = videos.map(v => {
        const tags = v.etiquetas ? v.etiquetas.split(',').map(t => `<span class="tag-badge">#${t}</span>`).join('') : '';
        const estilo = v.orientacion === 'vertical' ? 'aspect-ratio: 9/16; max-height:500px;' : 'aspect-ratio: 16/9;';
        
        // Lógica de créditos en descripción
        let creditosHtml = "";
        if (!v.es_original && v.fuente_original) {
            creditosHtml = `<div style="font-size:0.8rem; color:#ffaaaa; margin-top:5px;">⚠️ Fuente Original: <a href="${v.fuente_original}" target="_blank" style="color:#ffaaaa;">Ver Fuente</a></div>`;
        }
        let linkExtHtml = "";
        if (v.link_externo) {
            linkExtHtml = `<a href="${v.link_externo}" target="_blank" style="display:block; margin-top:5px; color:#00f2ea;">🔗 Enlace Externo</a>`;
        }

        return `
            <div class="video-card">
                <div class="video-header">
                    <img src="${v.autor_avatar}" class="avatar-mini">
                    <div><b>${v.autor_alias}</b></div>
                    <button onclick="reportarVideo('${v.id}', '${v.user_id}')" style="margin-left:auto; background:none; border:none; cursor:pointer;">🚩</button>
                </div>
                <video src="${v.video_url}" controls style="width:100%; ${estilo} background:#000;"></video>
                <div class="video-content">
                    <h3>${v.titulo}</h3>
                    <p>${v.descripcion || ''}</p>
                    ${creditosHtml}
                    ${linkExtHtml}
                    <div style="margin-top:5px;">${tags}</div>
                </div>
            </div>
        `;
    }).join('');
}

// SISTEMA DE REPORTE AUTOMÁTICO (BAJA GUA)
window.reportarVideo = async (vidId, autorId) => {
    if(!confirm("¿Reportar este video? Si es falso, se te restará GUA a ti.")) return;

    // 1. Registrar reporte en video
    await _supabase.rpc('increment_report', { row_id: vidId }); // (Simplificado: Solo sumamos en cliente visualmente o manual)
    
    // 2. BAJAR GUA AL AUTOR AUTOMÁTICAMENTE (-5 puntos)
    // Primero obtenemos el gua actual del autor
    let { data: autor } = await _supabase.from('perfiles').select('gua').eq('user_id', autorId).single();
    if(autor) {
        let nuevoGua = autor.gua - 5;
        await _supabase.from('perfiles').update({ gua: nuevoGua }).eq('user_id', autorId);
        alert("Reporte enviado. La confianza del usuario ha disminuido.");
    }
};

// UTILIDADES
window.cerrarModal = (id) => document.getElementById(id).style.display = 'none';
window.cambiarTab = (tab) => {
    document.querySelectorAll('.seccion-app').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('activo'));
    document.getElementById('tab-'+tab).style.display = 'block';
    // Lógica simple de tabs...
};
window.loginConGoogle = async () => await _supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
window.entrarComoInvitado = () => { localStorage.setItem('nai_invitado_id', 'INV-'+Date.now()); location.reload(); };
window.logout = async () => { localStorage.removeItem('nai_invitado_id'); await _supabase.auth.signOut(); location.reload(); };
        
