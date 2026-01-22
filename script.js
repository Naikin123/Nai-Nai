const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let uActual = null;
let pActual = null;
const AVATARES = ["https://i.ibb.co/hF6VHB5F/1ec8541e-1.png", "https://i.ibb.co/kLMbfDM/c876007d.png", "https://i.ibb.co/TqMHL17S/44-sin-t-tulo2.png", "https://i.ibb.co/Gf3LYb3q/39-sin-t-tulo4.png", "https://i.ibb.co/chtYqpFv/39-sin-t-tulo3.png", "https://i.ibb.co/fdXfwHnC/22-sin-t-tulo.png", "https://i.ibb.co/JRWddJSh/blooder.png", "https://i.ibb.co/M5Mjpg30/22-sin-t-tulo4.png", "https://i.ibb.co/kVzNDn0R/roba-venas2.png", "https://i.ibb.co/r2CvYDzq/1767980417276.png", "https://i.ibb.co/dwVqvWSc/49-sin-t-tulo.png", "https://i.ibb.co/99w1588C/45-sin-t-tulo.png", "https://i.ibb.co/zHL2NFf8/57-sin-t-tulo.png", "https://i.ibb.co/PZJj37WD/57-sin-t-tulo2.png", "https://i.ibb.co/W4bCrNhK/57-sin-t-tulo3.png", "https://i.ibb.co/TBJ4SSF3/59-sin-t-tulo.png", "https://i.ibb.co/rgcQpZr/58-sin-t-tulo.png", "https://i.ibb.co/Qv0KF6wC/60-sin-t-tulo.png", "https://i.ibb.co/m548FFDK/61-sin-t-tulo.png", "https://i.ibb.co/9kNb2pLF/62-sin-t-tulo.png", "https://i.ibb.co/MX6b1Yk/64-sin-t-tulo.png", "https://i.ibb.co/CF0jfPj/66-sin-t-tulo.png", "https://i.ibb.co/fVWZgb6Q/65-sin-t-tulo.png", "https://i.ibb.co/B55wWK3W/67-sin-t-tulo.png", "https://i.ibb.co/7dyQd1vf/75-sin-t-tulo8.png", "https://i.ibb.co/DDWcKxNy/75-sin-t-tulo4.png", "https://i.ibb.co/GQjLDjk9/75-sin-t-tulo.png", "https://i.ibb.co/4ZbzqqGz/83-sin-t-tulo.png", "https://i.ibb.co/nqN37BDq/82-sin-t-tulo2.png", "https://i.ibb.co/vCdRv7qG/86-sin-t-tulo2.png", "https://i.ibb.co/wNs2x97p/86-sin-t-tulo.png", "https://i.ibb.co/d0GndZNk/91-sin-t-tulo.png"];

window.onload = async () => {
    if (!localStorage.getItem('ref_done')) {
        document.getElementById('pantalla-referidos').style.display = 'flex';
        document.getElementById('auth-container').style.display = 'none';
    } else {
        checkSession();
    }
};

async function guardarReferido() {
    const val = document.getElementById('ref-input').value;
    localStorage.setItem('ref_val', val || 'directo');
    localStorage.setItem('ref_done', 'true');
    location.reload();
}

async function checkSession() {
    const { data: { session } } = await _supabase.auth.getSession();
    const invId = localStorage.getItem('nai_inv_id');
    if (session) initApp(session.user.id, 'google', session.user.user_metadata);
    else if (invId) initApp(invId, 'invitado', null);
}

async function initApp(uid, tipo, meta) {
    uActual = uid;
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app').style.display = 'block';

    let { data: p } = await _supabase.from('perfiles').select('*').eq('user_id', uid).single();
    if (!p) {
        const n = { user_id: uid, alias: meta ? meta.full_name : "Invitado", avatar: AVATARES[0], referido_por: localStorage.getItem('ref_val') };
        const { data } = await _supabase.from('perfiles').insert([n]).select().single();
        p = data;
    }
    pActual = p;
    actualizarUI();
    cargarFeed();
}

function actualizarUI() {
    document.getElementById('p-alias').innerText = pActual.alias;
    document.getElementById('p-avatar').src = pActual.avatar;
    document.getElementById('p-gua-val').innerText = pActual.gua;
    document.getElementById('p-cuenta-nai').innerText = pActual.cuenta_nai || "";
    document.getElementById('priv-ver').checked = pActual.privacidad_ver;
    document.getElementById('priv-com').checked = pActual.privacidad_comentar;
}

// CUENTA .NAI INTELIGENTE
async function toggleCuentaNai() {
    if (pActual.cuenta_nai) {
        if (confirm("¿Quitar cuenta .Nai?")) {
            await _supabase.from('perfiles').update({ cuenta_nai: null, password_nai: null }).eq('user_id', uActual);
            location.reload();
        }
    } else {
        alert("✨ Esto ayuda a que te registres a otros proyectos míos con esta cuenta y te dará ventajas futuras.");
        const n = prompt("Elige tu usuario.Nai:");
        if (!n || !n.endsWith('.Nai')) return alert("Debe terminar en .Nai");
        const pw = prompt("Crea una contraseña:");
        await _supabase.from('perfiles').update({ cuenta_nai: n, password_nai: pw }).eq('user_id', uActual);
        location.reload();
    }
}

// FEED VERTICAL TIKTOK
async function cargarFeed() {
    const { data: vids } = await _supabase.from('videos').select('*').order('created_at', { ascending: false });
    const feed = document.getElementById('feed-vertical');
    feed.innerHTML = vids.map(v => `
        <div class="v-card">
            <video src="${v.video_url}" loop onclick="this.paused?this.play():this.pause()"></video>
            <div class="v-overlay">
                <h3>@${v.autor_alias} ${v.autor_cuenta_nai || ''}</h3>
                <p>${v.titulo}</p>
                ${v.fuente_original ? `<small style="color:pink">Fuente: ${v.fuente_original}</small>` : ''}
                ${v.link_externo ? `<br><a href="${v.link_externo}" style="color:cyan">🔗 Link</a>` : ''}
            </div>
            <div class="v-actions">
                <button onclick="like('${v.id}','${v.user_id}')">❤️<br>${v.likes}</button>
                <button onclick="alert('Próximamente: Comentarios')">💬</button>
                <button onclick="compartir('${v.id}')">🔗</button>
            </div>
            ${v.con_marca_agua ? `<div class="watermark" style="position:absolute; top:20px; right:20px; opacity:0.5">${v.autor_cuenta_nai || v.autor_alias}</div>` : ''}
        </div>
    `).join('');
}

async function like(vid, aid) {
    // Silencioso +1 GUA
    await _supabase.rpc('increment_likes', { row_id: vid });
    let { data: a } = await _supabase.from('perfiles').select('gua').eq('user_id', aid).single();
    await _supabase.from('perfiles').update({ gua: a.gua + 1 }).eq('user_id', aid);
}

// EDITOR
function loadVideo(e) {
    const f = e.target.files[0];
    document.getElementById('preview-v').src = URL.createObjectURL(f);
}

function aplicarFiltro(f) {
    document.getElementById('preview-v').style.filter = f;
}

async function subirVideo() {
    const f = document.getElementById('file-input').files[0];
    const t = document.getElementById('v-titulo').value;
    if (!f || !t) return alert("Falta video o título");

    alert("Subiendo... Nai-Nai está procesando tu video.");
    const path = `v/${Date.now()}`;
    await _supabase.storage.from('videos-bucket').upload(path, f);
    const { data: { publicUrl } } = _supabase.storage.from('videos-bucket').getPublicUrl(path);

    await _supabase.from('videos').insert([{
        user_id: uActual,
        video_url: publicUrl,
        titulo: t,
        fuente_original: document.getElementById('v-fuente').value,
        link_externo: document.getElementById('v-link-ext').value,
        autor_alias: pActual.alias,
        autor_cuenta_nai: pActual.cuenta_nai,
        con_marca_agua: document.getElementById('v-watermark').checked
    }]);
    location.reload();
}

// UTILIDADES
function mostrarSeccion(s) {
    if (s === 'perfil') document.getElementById('modal-perfil').style.display = 'flex';
    else cerrarModales();
}
function cerrarModales() { document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none'); }
function abrirEditor() { document.getElementById('modal-editor').style.display = 'flex'; }
function abrirConfig() { document.getElementById('modal-config').style.display = 'flex'; }
function loginGoogle() { _supabase.auth.signInWithOAuth({ provider: 'google' }); }
function entrarInvitado() { localStorage.setItem('nai_inv_id', 'INV-' + Date.now()); location.reload(); }
function logout() { localStorage.clear(); location.reload(); }
function checkOriginal() { document.getElementById('v-fuente').style.display = document.getElementById('v-original').value === 'false' ? 'block' : 'none'; }
        
