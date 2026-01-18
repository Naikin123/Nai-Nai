const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Usa tu llave completa
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
