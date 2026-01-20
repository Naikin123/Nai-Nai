const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let perfilActual = null;
let etiquetasSeleccionadas = [];
let avatarSeleccionadoTemp = "";

// AVATARES (Los tuyos)
const AVATARES = ["https://i.ibb.co/hF6VHB5F/1ec8541e-1.png", "https://i.ibb.co/kLMbfDM/c876007d.png", "https://i.ibb.co/TqMHL17S/44-sin-t-tulo2.png", "https://i.ibb.co/Gf3LYb3q/39-sin-t-tulo4.png", "https://i.ibb.co/chtYqpFv/39-sin-t-tulo3.png", "https://i.ibb.co/fdXfwHnC/22-sin-t-tulo.png", "https://i.ibb.co/JRWddJSh/blooder.png", "https://i.ibb.co/M5Mjpg30/22-sin-t-tulo4.png", "https://i.ibb.co/kVzNDn0R/roba-venas2.png", "https://i.ibb.co/r2CvYDzq/1767980417276.png", "https://i.ibb.co/dwVqvWSc/49-sin-t-tulo.png", "https://i.ibb.co/99w1588C/45-sin-t-tulo.png", "https://i.ibb.co/zHL2NFf8/57-sin-t-tulo.png", "https://i.ibb.co/PZJj37WD/57-sin-t-tulo2.png", "https://i.ibb.co/W4bCrNhK/57-sin-t-tulo3.png", "https://i.ibb.co/TBJ4SSF3/59-sin-t-tulo.png", "https://i.ibb.co/rgcQpZr/58-sin-t-tulo.png", "https://i.ibb.co/Qv0KF6wC/60-sin-t-tulo.png", "https://i.ibb.co/m548FFDK/61-sin-t-tulo.png", "https://i.ibb.co/9kNb2pLF/62-sin-t-tulo.png", "https://i.ibb.co/MX6b1Yk/64-sin-t-tulo.png", "https://i.ibb.co/CF0jfPj/66-sin-t-tulo.png", "https://i.ibb.co/fVWZgb6Q/65-sin-t-tulo.png", "https://i.ibb.co/B55wWK3W/67-sin-t-tulo.png", "https://i.ibb.co/7dyQd1vf/75-sin-t-tulo8.png", "https://i.ibb.co/DDWcKxNy/75-sin-t-tulo4.png", "https://i.ibb.co/GQjLDjk9/75-sin-t-tulo.png", "https://i.ibb.co/4ZbzqqGz/83-sin-t-tulo.png", "https://i.ibb.co/nqN37BDq/82-sin-t-tulo2.png", "https://i.ibb.co/vCdRv7qG/86-sin-t-tulo2.png", "https://i.ibb.co/wNs2x97p/86-sin-t-tulo.png", "https://i.ibb.co/d0GndZNk/91-sin-t-tulo.png"];

// SESIÓN
_supabase.auth.onAuthStateChange(async (event, session) => {
    const invitadoId = localStorage.getItem('nai_invitado_id');
    if (session) {
        await cargarPerfil(session.user.id, 'google', session.user.user_metadata.full_name);
    } else if (invitadoId) {
        await cargarPerfil(invitadoId, 'invitado', 'Invitado');
    } else {
        document.getElementById('auth-container').style.display = 'flex';
        document.getElementById('contenido-app').style.display = 'none';
    }
});

async function cargarPerfil(uid, tipo, nombreDefecto) {
    let { data: perfil } = await _supabase.from('perfiles').select('*').eq('user_id', uid).single();
    if (!perfil) {
        const nuevo = { user_id: uid, alias: nombreDefecto, avatar: AVATARES[0], tipo_cuenta: tipo };
        const { data } = await _supabase.from('perfiles').insert([nuevo]).select().single();
        perfil = data;
    }
    perfilActual = perfil;
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('contenido-app').style.display = 'block';
    actualizarInterfaz();
    cargarFeed();
}

function actualizarInterfaz() {
    document.getElementById('p-alias').innerText = perfilActual.alias;
    document.getElementById('p-avatar').src = perfilActual.avatar;
    document.getElementById('p-gua').innerText = perfilActual.gua || 0;
    // Bloquear edición de nombre si ya es .Nai
    document.getElementById('edit-alias').disabled = perfilActual.alias.endsWith('.Nai');
}

// LÓGICA CUENTA .NAI
window.convertirEnCuentaApp = () => {
    let input = document.getElementById('edit-alias');
    if (!input.value.endsWith('.Nai')) {
        input.value = input.value.trim() + '.Nai';
        input.disabled = true; // Se bloquea al momento
    }
};

window.guardarCambiosPerfil = async () => {
    const nuevoAlias = document.getElementById('edit-alias').value;
    const nuevoTipo = nuevoAlias.endsWith('.Nai') ? 'app' : perfilActual.tipo_cuenta;

    const { error } = await _supabase.from('perfiles').update({
        alias: nuevoAlias,
        avatar: avatarSeleccionadoTemp || perfilActual.avatar,
        tipo_cuenta: nuevoTipo
    }).eq('user_id', perfilActual.user_id);

    if (error) alert("Error: " + error.message);
    else location.reload();
};

// SUBIR VIDEO MEJORADO
window.procesarSubida = async () => {
    const file = document.getElementById('v-archivo').files[0];
    const titulo = document.getElementById('v-titulo').value;
    if (!file || !titulo) return alert("Pon un título y selecciona un video");

    if (perfilActual.tipo_cuenta === 'invitado') {
        if (!confirm("⚠️ AVISO: Al no estar registrado, no nos hacemos responsables si tus videos son eliminados o robados. ¿Subir?")) return;
    }

    alert("Subiendo... no cierres la página.");
    const path = `public/${Date.now()}_${file.name}`;
    const { data, error } = await _supabase.storage.from('videos-bucket').upload(path, file);

    if (error) return alert("Error subida: " + error.message);

    const { data: url } = _supabase.storage.from('videos-bucket').getPublicUrl(path);

    await _supabase.from('videos').insert([{
        user_id: perfilActual.user_id,
        video_url: url.publicUrl,
        titulo: titulo,
        autor_alias: perfilActual.alias,
        autor_avatar: perfilActual.avatar,
        etiquetas: etiquetasSeleccionadas.join(','),
        orientacion: document.getElementById('v-orientacion').value
    }]);

    alert("¡Publicado con éxito!");
    location.reload();
};

// (Mantén las funciones de abrir/cerrar modales y login del código anterior)

