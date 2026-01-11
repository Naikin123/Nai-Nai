// --- 1. CONEXIÓN CON SUPABASE ---
// ¡Borra el texto entre comillas y pega tus llaves reales!
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'sb_publishable_3H89NpZFdz1q9IDWZ0KtDQ_IX8F7xvn';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// --- 2. CONFIGURACIÓN Y DATOS ---
const categorias = [
    "Gracioso", "Epico", "Educativo", "Motivacional", "Animación",
    "Videojuegos", "Tutorial", "Vlog", "Musical", "Recetas"
];

let usuarioActual = "Nai-kin";
let avatarActual = "https://i.ibb.co/jkcM4khz/file-000000000bd461fb894402f0ff51670d.png";

// --- 3. INICIO ---
window.onload = () => {
    cargarTags();
    cargarGaleria();
    cargarVideosDeSupabase(); // Cargar videos reales
};

// --- 4. SUBIR VIDEO REAL A SUPABASE ---
async function subirVideoASupabase(event) {
    const file = event.target.files[0];
    if (!file) return;

    alert("Subiendo video... espera unos segundos.");

    // Nombre único para el archivo
    const nombreArchivo = 'video_' + Date.now() + '.mp4';

    // 1. Subir al "Storage" (Bucket llamado 'videos')
    const { data, error } = await supabase
        .storage
        .from('videos')
        .upload(nombreArchivo, file);

    if (error) {
        alert("Error al subir: " + error.message);
        console.error(error);
    } else {
        alert("¡Video subido con éxito a la Nube!");
        // Recargar la lista para ver el nuevo video
        cargarVideosDeSupabase();
    }
}

// --- 5. CARGAR VIDEOS DE SUPABASE ---
async function cargarVideosDeSupabase() {
    const contenedor = document.getElementById("feed-videos");
    contenedor.innerHTML = '<p style="text-align:center; color:#00f2ff;">Cargando videos de la red...</p>';

    // Pedimos la lista de archivos al Bucket 'videos'
    const { data, error } = await supabase
        .storage
        .from('videos')
        .list();

    if (error) {
        contenedor.innerHTML = '<p>Error cargando videos.</p>';
    } else {
        contenedor.innerHTML = ""; // Limpiar
        if (data.length === 0) {
            contenedor.innerHTML = "<p style='text-align:center;'>No hay videos aún. ¡Sube el primero!</p>";
            return;
        }

        // Mostrar cada video encontrado
        data.forEach(archivo => {
            // Obtener la URL pública del video
            const { data: publicUrlData } = supabase.storage.from('videos').getPublicUrl(archivo.name);
            const urlVideo = publicUrlData.publicUrl;

            crearTarjetaVideo(urlVideo, archivo.name);
        });
    }
}

// --- 6. DIBUJAR LA TARJETA DEL VIDEO ---
function crearTarjetaVideo(url, titulo) {
    const contenedor = document.getElementById("feed-videos");
    let card = document.createElement("div");
    card.className = "post-card";
    
    card.innerHTML = `
        <div class="post-header">
            <div style="display: flex; align-items:center; gap:10px;">
                <img src="${avatarActual}" style="width: 35px; height:35px; border-radius: 50%;">
                <div>
                    <div style="font-weight:bold;">Usuario Nai-Nai</div>
                    <small style="color:#00f2ff;">Nuevo Video</small>
                </div>
            </div>
        </div>
        <video src="${url}" controls loop playsinline></video>
        <div class="acciones">
            <button class="btn-icon">❤️ Like</button>
        </div>
    `;
    contenedor.prepend(card); // Pone el más nuevo arriba
}

// --- 7. FUNCIONES EXTRAS (Diseño) ---
function cargarTags() {
    const cont = document.getElementById("listaTags");
    cont.innerHTML = `<span class="tag-pill activo">Todo</span>`;
    categorias.forEach(cat => {
        cont.innerHTML += `<span class="tag-pill">${cat}</span>`;
    });
}

const fotos = [
    "https://i.ibb.co/jkcM4khz/file-000000000bd461fb894402f0ff51670d.png",
    "https://i.ibb.co/XZTpkLPW/file-00000000566061f7b0aca36e6e40d8c0.png",
    "https://i.ibb.co/hRTfBsKL/47-sin-t-tulo11.png"
];

function abrirPerfil() {
    document.getElementById("modalPerfil").style.display = "flex";
}

function cargarGaleria() {
    const grid = document.getElementById("galeria");
    fotos.forEach(src => {
        let img = document.createElement("img");
        img.src = src;
        img.onclick = () => {
            avatarActual = src;
            document.getElementById("miAvatarMini").src = src;
            document.getElementById("modalPerfil").style.display = 'none';
        };
        grid.appendChild(img);
    });
}

function cambiarTab(modo) {
    alert("Cambiando pestaña a: " + modo);
}
