// 1. URL de tu proyecto
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';

// 2. Tu clave larga (Key) que empieza con eyJ...
const supabaseKey = 'TU_CLAVE_COMPLETA_AQUÍ'; 

const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);


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

let myId = "1"; // Eres el dueño
let currentVideoUrl = "";

// --- SISTEMA DE COMPARTIR REDES ---
window.abrirShare = (url) => {
    currentVideoUrl = url;
    document.getElementById('modal-share').style.display = 'flex';
}

window.shareWhatsApp = () => {
    const text = encodeURIComponent("¡Mira este video en Nai-Nai! 🎥 " + currentVideoUrl);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
}

window.shareDiscord = () => {
    navigator.clipboard.writeText(currentVideoUrl);
    alert("¡Link copiado! Pégalo en Discord. (Discord no permite envío directo desde web sin bot)");
}

window.copiarLink = () => {
    navigator.clipboard.writeText(currentVideoUrl);
    alert("Copiado al portapapeles 🔗");
}

window.cerrarShare = () => document.getElementById('modal-share').style.display='none';

// --- REGLAS ---
window.mostrarReglas = () => {
    alert("📜 REGLAS DE NAI-NAI:\n1. No contenido ofensivo.\n2. Respeta a la comunidad.\n3. Prohibido el spam.\n4. Si eres Naikin, eres el jefe.");
}

// --- COMENTARIOS ---
let currentVideoId = null;
window.abrirComentarios = async (id) => {
    currentVideoId = id;
    document.getElementById('modal-comentarios').style.display = 'flex';
    const { data } = await _supabase.from('comentarios').select('*').eq('video_id', id).order('id', {ascending: true});
    const lista = document.getElementById('lista-comentarios');
    lista.innerHTML = data.map(c => `
        <div style="margin-bottom:10px; font-size:0.9rem;">
            <b style="color:#00f2ea;">${c.usuario}:</b> ${c.texto}
        </div>
    `).join('') || "No hay comentarios aún.";
}

window.enviarComentario = async () => {
    const texto = document.getElementById('input-comentario').value;
    if(!texto) return;
    await _supabase.from('comentarios').insert([{
        video_id: currentVideoId, user_id: myId, usuario: currentProfile.alias, texto: texto
    }]);
    document.getElementById('input-comentario').value = "";
    abrirComentarios(currentVideoId);
}

window.cerrarComentarios = () => document.getElementById('modal-comentarios').style.display='none';

// --- LIKES (REPARADO) ---
window.darLike = async (btn, id) => {
    await _supabase.rpc('incrementar_like', { video_id: id });
    const span = btn.querySelector('span');
    span.innerText = parseInt(span.innerText) + 1;
    btn.style.color = "#ff4444";
}

// (El resto de funciones como cargarFeed y cargarPerfil se mantienen de la versión anterior para no romper nada)


// --- SISTEMA DE AUTENTICACIÓN ---

// Verificar sesión al cargar
async function checkUser() {
    const { data: { user } } = await _supabase.auth.getUser();
    
    if (user) {
        myId = user.id; // El ID ahora viene de Google
        document.getElementById('auth-container').style.display = 'none';
        await cargarPerfilUsuario();
    } else {
        document.getElementById('auth-container').style.display = 'flex';
    }
}

// Función para Login con Google
window.loginGoogle = async function() {
    const { data, error } = await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin
        }
    });
    if (error) alert("Error al conectar con Google: " + error.message);
}

// Función para Cerrar Sesión
window.logout = async function() {
    await _supabase.auth.signOut();
    location.reload();
}

// Modificamos el cargarPerfilUsuario para que use el email de Google si es nuevo
async function cargarPerfilUsuario() {
    const { data: { user } } = await _supabase.auth.getUser();
    let { data: perfil } = await _supabase.from('perfiles').select('*').eq('user_id', user.id).single();
    
    if(!perfil) {
        const nuevo = { 
            user_id: user.id, 
            alias: user.user_metadata.full_name || "Nuevo Socio", 
            avatar: user.user_metadata.avatar_url || avatares[0], 
            gua: 100,
            estado: "🔥"
        };
        await _supabase.from('perfiles').insert([nuevo]);
        currentProfile = nuevo;
    } else {
        currentProfile = perfil;
    }
    actualizarDOMPerfil();
}

// Reemplaza tu inicialización por esta:
document.addEventListener('DOMContentLoaded', async () => {
    await checkUser(); // Ahora checkUser manda sobre el inicio
    cargarEtiquetas();
    cargarFeed('comunidad');
    configurarSubida();
});
// --- NUEVA LÓGICA DE INICIO ---

window.continuarComoInvitado = () => {
    // Si es invitado, le asignamos un ID basado en su navegador
    if(!localStorage.getItem('nai_invitado_id')) {
        localStorage.setItem('nai_invitado_id', 'INV-' + Math.floor(Math.random() * 9999));
    }
    myId = localStorage.getItem('nai_invitado_id');
    document.getElementById('auth-container').style.display = 'none';
    cargarPerfilUsuario();
};

async function checkUser() {
    const { data: { user } } = await _supabase.auth.getUser();
    
    if (user) {
        myId = user.id;
        document.getElementById('auth-container').style.display = 'none';
        await cargarPerfilUsuario();
    } else {
        // Si no hay usuario de Google, checamos si ya era invitado
        if(localStorage.getItem('nai_invitado_id')) {
            myId = localStorage.getItem('nai_invitado_id');
            document.getElementById('auth-container').style.display = 'none';
            cargarPerfilUsuario();
        } else {
            document.getElementById('auth-container').style.display = 'flex';
        }
    }
}

// El login de Google se queda igual
window.loginGoogle = async function() {
    const { data, error } = await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
    });
};
    
async function loginConGoogle() {
    const { data, error } = await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin // Esto hace que regrese a tu página después de loguearse
        }
    });
    if (error) console.error("Error al entrar con Google:", error.message);
}

async function loginConGoogle() {
    await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            // Esto le dice a Google que te regrese a tu página real, no a localhost
            redirectTo: window.location.origin 
        }
    });
}

async function loginConGoogle() {
    const { data, error } = await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            // Esto redirige automáticamente a tu página real
            redirectTo: window.location.origin 
        }
    });
    if (error) console.error("Error:", error.message);
}
