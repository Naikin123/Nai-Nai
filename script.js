// --- CONFIGURACIÓN DE CONEXIÓN ---
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'TU_CLAVE_COMPLETA_AQUÍ'; // <--- PEGA TU CLAVE COMPLETA AQUÍ

const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- VARIABLES GLOBALES ---
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

let myId = null;
let currentProfile = null;

// --- SISTEMA DE AUTENTICACIÓN (REPARADO) ---

// 1. Escuchar cambios de sesión (Google nos avisa aquí)
_supabase.auth.onAuthStateChange(async (event, session) => {
    if (session) {
        console.log("Sesión activa:", session.user);
        myId = session.user.id;
        document.getElementById('auth-container').style.display = 'none';
        await cargarPerfilUsuario(session.user);
    } else {
        const invId = localStorage.getItem('nai_invitado_id');
        if (invId) {
            myId = invId;
            document.getElementById('auth-container').style.display = 'none';
            await cargarPerfilInvitado();
        } else {
            document.getElementById('auth-container').style.display = 'flex';
        }
    }
});

// 2. Función para Login con Google
window.loginConGoogle = async function() {
    const { error } = await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin 
        }
    });
    if (error) alert("Error: " + error.message);
}

// 3. Función para Invitado
window.continuarComoInvitado = () => {
    if(!localStorage.getItem('nai_invitado_id')) {
        localStorage.setItem('nai_invitado_id', 'INV-' + Math.floor(Math.random() * 9999));
    }
    location.reload(); // Recargamos para que onAuthStateChange detecte al invitado
};

// 4. Cargar Perfil de Google
async function cargarPerfilUsuario(user) {
    let { data: perfil } = await _supabase.from('perfiles').select('*').eq('user_id', user.id).single();
    
    if(!perfil) {
        perfil = { 
            user_id: user.id, 
            alias: user.user_metadata.full_name || "Socio Nai", 
            avatar: user.user_metadata.avatar_url || avatares[0], 
            gua: 100,
            estado: "🔥"
        };
        await _supabase.from('perfiles').insert([perfil]);
    }
    currentProfile = perfil;
    actualizarPantallaPrincipal();
}

// 5. Cargar Perfil de Invitado
async function cargarPerfilInvitado() {
    currentProfile = { alias: "Invitado", avatar: avatares[0], gua: 0, estado: "🕶️" };
    actualizarPantallaPrincipal();
}

function actualizarPantallaPrincipal() {
    // Aquí pon el código para mostrar tu app y ocultar los botones de inicio
    console.log("App lista para:", currentProfile.alias);
    // document.getElementById('contenido-app').style.display = 'block';
}

// --- FUNCIONES DE LA APP (COMENTARIOS, LIKES, ETC) ---

window.darLike = async (btn, id) => {
    await _supabase.rpc('incrementar_like', { video_id: id });
    const span = btn.querySelector('span');
    span.innerText = parseInt(span.innerText) + 1;
    btn.style.color = "#ff4444";
}

window.enviarComentario = async () => {
    const texto = document.getElementById('input-comentario').value;
    if(!texto || !currentProfile) return;
    await _supabase.from('comentarios').insert([{
        video_id: currentVideoId, 
        user_id: myId, 
        usuario: currentProfile.alias, 
        texto: texto
    }]);
    document.getElementById('input-comentario').value = "";
    abrirComentarios(currentVideoId);
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // No necesitamos llamar a checkUser, onAuthStateChange lo hace solo.
});
