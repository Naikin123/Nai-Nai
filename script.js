// --- CONFIGURACIÓN DE CONEXIÓN ---
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'TU_CLAVE_COMPLETA_AQUÍ'; // <--- PEGA TU CLAVE (la que empieza con eyJ)

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
let currentVideoId = null;

// --- SISTEMA DE AUTENTICACIÓN ---

_supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("Evento de Auth:", event);
    if (session) {
        myId = session.user.id;
        // Ocultar pantalla de inicio, mostrar app
        document.getElementById('auth-container').style.display = 'none';
        const appContent = document.getElementById('contenido-app');
        if(appContent) appContent.style.display = 'block';
        
        await cargarPerfilUsuario(session.user);
    } else {
        const invId = localStorage.getItem('nai_invitado_id');
        if (invId) {
            myId = invId;
            document.getElementById('auth-container').style.display = 'none';
            if(document.getElementById('contenido-app')) document.getElementById('contenido-app').style.display = 'block';
            await cargarPerfilInvitado();
        } else {
            document.getElementById('auth-container').style.display = 'flex';
            if(document.getElementById('contenido-app')) document.getElementById('contenido-app').style.display = 'none';
        }
    }
});

window.loginConGoogle = async function() {
    const { error } = await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + window.location.pathname,
            queryParams: { prompt: 'select_account' }
        }
    });
    if (error) alert("Error de Google: " + error.message);
}

window.continuarComoInvitado = () => {
    localStorage.setItem('nai_invitado_id', 'INV-' + Math.floor(Math.random() * 9999));
    location.reload(); 
};

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
    console.log("Perfil cargado:", currentProfile.alias);
}

async function cargarPerfilInvitado() {
    currentProfile = { alias: "Invitado", avatar: avatares[0], gua: 0, estado: "🕶️" };
}

// --- FUNCIONES DE LA APP ---

window.darLike = async (btn, id) => {
    const { error } = await _supabase.rpc('incrementar_like', { video_id: id });
    if(!error) {
        const span = btn.querySelector('span');
        span.innerText = parseInt(span.innerText) + 1;
        btn.style.color = "#ff4444";
    }
}

window.enviarComentario = async () => {
    const texto = document.getElementById('input-comentario').value;
    if(!texto || !currentProfile) return;
    
    const { error } = await _supabase.from('comentarios').insert([{
        video_id: currentVideoId, 
        user_id: myId, 
        usuario: currentProfile.alias, 
        texto: texto
    }]);
    
    if(!error) {
        document.getElementById('input-comentario').value = "";
        abrirComentarios(currentVideoId);
    }
}

window.logout = async () => {
    localStorage.removeItem('nai_invitado_id');
    await _supabase.auth.signOut();
    location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
    // Aquí puedes llamar a tus funciones de carga de videos si las tienes
    console.log("Nai-Nai listo.");
});

window.loginConGoogle = async function() {
    console.log("Botón presionado");
    alert("Iniciando conexión con Google..."); // Si sale esto, el botón funciona

    try {
        const { data, error } = await _supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // Esto asegura que use la URL actual de tu página
                redirectTo: window.location.origin + window.location.pathname,
                queryParams: {
                    prompt: 'select_account'
                }
            }
        });

        if (error) {
            console.error("Error de Supabase:", error.message);
            alert("Error de configuración: " + error.message);
        }
    } catch (err) {
        console.error("Error inesperado:", err);
        alert("Ocurrió un error inesperado al conectar.");
    }
};
