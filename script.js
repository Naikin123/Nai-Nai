// Llaves de Supabase (Correctas)
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let uAct = null; // Usuario ID actual
let pDat = null; // Datos del perfil actual
let filtroSel = 'none';

// AVATARES POR DEFECTO (Solo 4 para ejemplo, el sistema funciona con todos)
const DEF_AVATARS = [
    "https://i.ibb.co/hF6VHB5F/1ec8541e-1.png",
    "https://i.ibb.co/kLMbfDM/c876007d.png"
];

// --- INICIO ---
window.onload = async () => {
    if (!localStorage.getItem('nai_ref')) {
        document.getElementById('pantalla-referidos').style.display = 'flex';
    } else {
        checkSesion();
    }
};

window.guardarReferido = () => {
    localStorage.setItem('nai_ref', document.getElementById('ref-input').value || 'Nadie');
    location.reload();
};

async function checkSesion() {
    const { data: { session } } = await _supabase.auth.getSession();
    const inv = localStorage.getItem('nai_inv');
    if (session) init(session.user.id, session.user.user_metadata);
    else if (inv) init(inv, null);
    else document.getElementById('auth-container').style.display = 'flex';
}

async function init(uid, meta) {
    uAct = uid;
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app-interface').style.display = 'block';

    // Cargar o Crear Perfil
    let { data: p, error } = await _supabase.from('perfiles').select('*').eq('user_id', uid).single();
    if (!p) {
        // Si es nuevo, usamos un avatar por defecto
        p = { 
            user_id: uid, 
            alias: meta?.full_name || "Nuevo Usuario", 
            avatar: DEF_AVATARS[0], // Avatar inicial obligatorio
            referido_por: localStorage.getItem('nai_ref')
        };
        await _supabase.from('perfiles').insert([p]);
        // Volvemos a pedirlo para asegurar que tenemos el objeto completo de la DB
        const { data: pNuevo } = await _supabase.from('perfiles').select('*').eq('user_id', uid).single();
        p = pNuevo;
    }
    pDat = p;
    updatePerfilUI();
    cargarFeed();
}

// --- GESTIÓN DE PERFIL (CORREGIDA) ---
function updatePerfilUI() {
    if (!pDat) return;
    // Ahora el alias es un input para poder editarlo
    document.getElementById('p-alias-input').value = pDat.alias;
    // Aseguramos que si el avatar es null, muestre uno por defecto
    document.getElementById('p-avatar').src = pDat.avatar || DEF_AVATARS[0];
    document.getElementById('p-gua').innerText = pDat.gua;
    document.getElementById('p-cuenta-nai').innerText = pDat.cuenta_nai || "Cuenta Estándar";
    document.getElementById('check-priv-ver').checked = pDat.privacidad_ver;
    document.getElementById('check-priv-com').checked = pDat.privacidad_comentar;
}

// Guardar cambio de nombre (Alias)
window.guardarAlias = async () => {
    const nuevoAlias = document.getElementById('p-alias-input').value;
    if (!nuevoAlias) return alert("El nombre no puede estar vacío.");
    await _supabase.from('perfiles').update({ alias: nuevoAlias }).eq('user_id', uAct);
    alert("Nombre actualizado.");
    location.reload();
};

// Subir foto propia (NUEVO)
window.subirAvatarPropio = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const path = `avatars/${uAct}_${Date.now()}`;
    alert("Subiendo tu foto...");
    // Subir al bucket 'avatars'
    const { error: upErr } = await _supabase.storage.from('avatars').upload(path, file);
    if (upErr) return alert("Error al subir imagen: " + upErr.message);

    // Obtener URL pública
    const { data: { publicUrl } } = _supabase.storage.from('avatars').getPublicUrl(path);
    
    // Actualizar perfil con la nueva URL
    await _supabase.from('perfiles').update({ avatar: publicUrl }).eq('user_id', uAct);
    alert("¡Foto de perfil actualizada!");
    location.reload();
};

// --- EDITOR Y SUBIDA (CORREGIDO) ---
window.cargarVideoFile = (e) => {
    const f = e.target.files[0];
    if(f) document.getElementById('preview-v').src = URL.createObjectURL(f);
};
window.setFilter = (f) => {
    filtroSel = f;
    document.getElementById('preview-v').style.filter = f;
};
window.subirVideo = async () => {
    const file = document.getElementById('file-input').files[0];
    const titulo = document.getElementById('v-titulo').value;
    const tags = document.getElementById('v-tags').value;

    if(!file || !titulo) return alert("Falta video o título");

    alert("Publicando... (Estilo Neón 😎)");
    const path = `vids/${Date.now()}`;
    await _supabase.storage.from('videos-bucket').upload(path, file);
    const { data: { publicUrl } } = _supabase.storage.from('videos-bucket').getPublicUrl(path);

    await _supabase.from('videos').insert([{
        user_id: uAct,
        video_url: publicUrl,
        titulo: titulo,
        etiquetas: tags, // Guardamos las etiquetas
        con_marca_agua: document.getElementById('v-watermark').checked,
        autor_alias: pDat.alias,
        autor_cuenta_nai: pDat.cuenta_nai,
        // NOTA: El filtro se aplicaría en el reproductor via CSS, no se guarda en la DB por ahora para simplificar.
    }]);
    location.reload();
};

// --- FEED Y LIKES ---
async function cargarFeed() {
    const { data: vids } = await _supabase.from('videos').select('*').order('created_at', { ascending: false });
    const feed = document.getElementById('feed-vertical');
    
    if (!vids.length) { feed.innerHTML = "<h3 class='neon-text' style='text-align:center; margin-top:50%'>Sin videos aún. ¡Sé el primero!</h3>"; return; }

    feed.innerHTML = vids.map(v => `
        <div class="video-card">
            <video src="${v.video_url}" loop onclick="this.paused?this.play():this.pause()"></video>
            ${v.con_marca_agua ? `<div class="watermark">@${v.autor_cuenta_nai || v.autor_alias}</div>` : ''}
            <div class="overlay-info">
                <h3 class="neon-text">@${v.autor_alias} ${v.autor_cuenta_nai ? '💎' : ''}</h3>
                <p>${v.titulo}</p>
                ${v.etiquetas ? `<small style="color:#ccc">${v.etiquetas}</small>` : ''}
            </div>
            <div class="overlay-actions">
                <button class="action-btn" style="color:#ff0055; border-color:#ff0055;" onclick="darLike('${v.id}')">❤️ ${v.likes}</button>
                <button class="action-btn">💬</button>
            </div>
        </div>
    `).join('');
}

async function darLike(vidId) {
    await _supabase.rpc('increment_likes', { row_id: vidId });
    // (Opcional: recargar feed o actualizar contador visualmente)
}

// --- UTILIDADES Y MODALES ---
window.abrirPerfil = () => document.getElementById('modal-perfil').style.display = 'flex';
window.abrirEditor = () => document.getElementById('modal-editor').style.display = 'flex';
window.abrirOpcionesAvanzadas = () => { cerrarModal('modal-perfil'); document.getElementById('modal-opciones').style.display = 'flex'; };
window.cerrarModal = (id) => document.getElementById(id).style.display = 'none';
window.entrarInvitado = () => { localStorage.setItem('nai_inv', 'INV'+Date.now()); location.reload(); };
window.loginGoogle = () => _supabase.auth.signInWithOAuth({provider:'google'});
window.cerrarSesion = () => { localStorage.clear(); location.reload(); };
window.recargarFeed = () => location.reload();
