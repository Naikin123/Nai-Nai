// CONFIGURACIÓN SUPABASE (Tus llaves)
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// VARIABLES GLOBALES
let usuarioActual = null;
let perfilData = null;
let filtroActual = 'none';

// IMÁGENES DE PERFIL (Tus links)
const AVATARES = [
    "https://i.ibb.co/hF6VHB5F/1ec8541e-1.png", "https://i.ibb.co/kLMbfDM/c876007d.png",
    "https://i.ibb.co/TqMHL17S/44-sin-t-tulo2.png", "https://i.ibb.co/Gf3LYb3q/39-sin-t-tulo4.png"
]; 
// (Nota: He puesto solo 4 para no llenar el código, el sistema elegirá el 1ro por defecto, puedes agregar el resto luego)

// --- 1. INICIO Y CARGA ---
window.onload = async () => {
    // Verificar Referidos
    if (!localStorage.getItem('nai_ref_ok')) {
        document.getElementById('pantalla-referidos').style.display = 'flex';
        return;
    }

    // Verificar Sesión
    const { data: { session } } = await _supabase.auth.getSession();
    const invitadoID = localStorage.getItem('nai_invitado_id');

    if (session) {
        cargarApp(session.user.id, 'google', session.user.user_metadata);
    } else if (invitadoID) {
        cargarApp(invitadoID, 'invitado', null);
    } else {
        document.getElementById('auth-container').style.display = 'flex';
    }
};

window.guardarReferido = () => {
    const referido = document.getElementById('ref-input').value;
    localStorage.setItem('nai_ref_dato', referido || 'Nadie');
    localStorage.setItem('nai_ref_ok', 'true');
    location.reload();
};

window.entrarInvitado = () => {
    localStorage.setItem('nai_invitado_id', 'INV-' + Date.now());
    location.reload();
};

window.loginGoogle = async () => {
    await _supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href } });
};

// --- 2. LÓGICA DE LA APP ---
async function cargarApp(uid, tipo, meta) {
    usuarioActual = uid;
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app-interface').style.display = 'block';

    // Obtener o Crear Perfil
    let { data: perfil, error } = await _supabase.from('perfiles').select('*').eq('user_id', uid).single();

    if (!perfil) {
        const nuevoPerfil = {
            user_id: uid,
            alias: meta ? meta.full_name : "Invitado",
            avatar: meta ? meta.avatar_url : AVATARES[0],
            referido_por: localStorage.getItem('nai_ref_dato')
        };
        const { data } = await _supabase.from('perfiles').insert([nuevoPerfil]).select().single();
        perfil = data;
    }
    perfilData = perfil;
    
    // Actualizar UI Perfil
    actualizarInterfazPerfil();
    cargarFeed();
}

function actualizarInterfazPerfil() {
    document.getElementById('p-alias').innerText = perfilData.alias;
    document.getElementById('p-avatar').src = perfilData.avatar;
    document.getElementById('p-gua').innerText = perfilData.gua;
    document.getElementById('p-cuenta-nai').innerText = perfilData.cuenta_nai || "Cuenta Estándar";
    
    // Checks de privacidad
    document.getElementById('check-priv-ver').checked = perfilData.privacidad_ver;
    document.getElementById('check-priv-com').checked = perfilData.privacidad_comentar;
}

// --- 3. FEED VERTICAL (TIKTOK) ---
async function cargarFeed() {
    const { data: videos } = await _supabase.from('videos').select('*').order('created_at', { ascending: false });
    const contenedor = document.getElementById('feed-vertical');
    
    if(!videos || videos.length === 0) {
        contenedor.innerHTML = "<div style='color:white; text-align:center; padding-top:50vh;'>No hay videos aún. ¡Sube el primero!</div>";
        return;
    }

    contenedor.innerHTML = videos.map(v => {
        // Marca de agua dinámica
        let marcaAguaHTML = "";
        if (v.con_marca_agua) {
            marcaAguaHTML = `<div class="watermark-overlay">@${v.autor_cuenta_nai || v.autor_alias}</div>`;
        }

        return `
        <div class="video-card">
            <video src="${v.video_url}" loop onclick="togglePlay(this)" playsinline></video>
            
            ${marcaAguaHTML}

            <div class="overlay-info">
                <h3>@${v.autor_alias} ${v.autor_cuenta_nai ? '✅' : ''}</h3>
                <p>${v.titulo}</p>
                ${v.fuente_original ? `<small style="color:#faa;">Fuente: Externa</small>` : ''}
            </div>

            <div class="overlay-actions">
                <button class="action-btn" onclick="darLike('${v.id}', '${v.user_id}', this)">❤️<br><span style="font-size:0.6rem;">${v.likes}</span></button>
                <button class="action-btn">💬</button>
                <button class="action-btn">🔗</button>
            </div>
        </div>
        `;
    }).join('');
}

window.togglePlay = (vid) => {
    if (vid.paused) vid.play();
    else vid.pause();
};

window.darLike = async (vidID, autorID, btn) => {
    // Animación visual inmediata
    btn.style.color = "#ff0055";
    btn.style.transform = "scale(1.2)";
    setTimeout(() => btn.style.transform = "scale(1)", 200);

    // Backend: +1 Like y +1 GUA al autor
    await _supabase.rpc('increment_likes', { row_id: vidID }); // (Requiere función RPC en Supabase, o update manual simple abajo)
    
    // Update manual simple (si no tienes RPC configurado)
    let { data: vid } = await _supabase.from('videos').select('likes').eq('id', vidID).single();
    await _supabase.from('videos').update({ likes: vid.likes + 1 }).eq('id', vidID);

    // Sumar GUA al autor
    let { data: autor } = await _supabase.from('perfiles').select('gua').eq('user_id', autorID).single();
    if(autor) await _supabase.from('perfiles').update({ gua: autor.gua + 1 }).eq('user_id', autorID);
};

// --- 4. EDITOR Y SUBIDA ---
window.abrirEditor = () => document.getElementById('modal-editor').style.display = 'flex';
window.cerrarModal = (id) => document.getElementById(id).style.display = 'none';

window.cargarVideoFile = (event) => {
    const file = event.target.files[0];
    if (file) {
        document.getElementById('preview-v').src = URL.createObjectURL(file);
        document.getElementById('preview-v').play();
    }
};

window.setFilter = (filtro) => {
    filtroActual = filtro;
    document.getElementById('preview-v').style.filter = filtro;
};

window.toggleFuente = () => {
    const esOriginal = document.getElementById('v-original').value === 'true';
    document.getElementById('v-fuente').style.display = esOriginal ? 'none' : 'block';
};

window.subirVideo = async () => {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    const titulo = document.getElementById('v-titulo').value;
    
    if (!file || !titulo) return alert("Falta video o título");

    alert("Subiendo video... Por favor espera.");
    
    const fileName = `vid_${Date.now()}`;
    const { error: uploadError } = await _supabase.storage.from('videos-bucket').upload(fileName, file);
    
    if (uploadError) return alert("Error al subir archivo: " + uploadError.message);

    const { data: { publicUrl } } = _supabase.storage.from('videos-bucket').getPublicUrl(fileName);

    await _supabase.from('videos').insert([{
        user_id: usuarioActual,
        video_url: publicUrl,
        titulo: titulo,
        es_original: document.getElementById('v-original').value === 'true',
        fuente_original: document.getElementById('v-fuente').value,
        con_marca_agua: document.getElementById('v-watermark').checked,
        autor_alias: perfilData.alias,
        autor_cuenta_nai: perfilData.cuenta_nai,
        // Aquí podríamos guardar el filtro usado si quisiéramos aplicarlo via CSS al reproducir
    }]);

    alert("¡Video publicado!");
    location.reload();
};

// --- 5. CUENTA .NAI Y PRIVACIDAD ---
window.abrirPerfil = () => document.getElementById('modal-perfil').style.display = 'flex';
window.abrirOpcionesAvanzadas = () => {
    cerrarModal('modal-perfil');
    document.getElementById('modal-opciones').style.display = 'flex';
};

window.gestionarCuentaNai = async () => {
    if (perfilData.cuenta_nai) {
        if(confirm("¿Quieres eliminar tu cuenta .Nai y perder sus beneficios?")) {
            await _supabase.from('perfiles').update({ cuenta_nai: null, password_nai: null }).eq('user_id', usuarioActual);
            location.reload();
        }
    } else {
        const nombre = prompt("Elige tu nombre único (debe terminar en .Nai):");
        if (!nombre || !nombre.endsWith('.Nai')) return alert("Formato incorrecto. Debe terminar en .Nai");
        
        const pass = prompt("Crea una contraseña segura para tu cuenta .Nai:");
        if(!pass) return;

        const { error } = await _supabase.from('perfiles').update({ cuenta_nai: nombre, password_nai: pass }).eq('user_id', usuarioActual);
        
        if (error) alert("Ese nombre ya existe o hubo un error.");
        else {
            alert("¡Bienvenido a la familia .Nai!");
            location.reload();
        }
    }
};

window.cambiarPrivacidad = async (campo) => {
    const check = document.getElementById(campo === 'ver' ? 'check-priv-ver' : 'check-priv-com');
    const nuevoValor = check.checked;
    
    const historial = confirm("¿Aplicar cambio también al historial pasado?\n\nAceptar = Todo el historial\nCancelar = Solo nuevos");
    
    // Actualizamos perfil
    const updateObj = {};
    if (campo === 'ver') updateObj.privacidad_ver = nuevoValor;
    else updateObj.privacidad_comentar = nuevoValor;
    
    await _supabase.from('perfiles').update(updateObj).eq('user_id', usuarioActual);
    
    // (Opcional) Aquí iría la lógica backend para actualizar videos pasados si el usuario dijo "Aceptar"
    alert("Privacidad actualizada.");
};

window.cerrarSesion = () => {
    localStorage.removeItem('nai_invitado_id');
    _supabase.auth.signOut();
    location.reload();
};
