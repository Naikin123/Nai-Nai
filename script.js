// --- 1. CONEXIÓN CON SUPABASE ---
// ¡Borra el texto entre comillas y pega tus llaves reales!
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
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
const url = document.getElementById('videoUrl').value;
    
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

async function subirVideoASupabase(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 1. Subir el video a la carpeta "videos-bucket"
    const fileName = `${Date.now()}_${file.name}`;
    const { data: storageData, error: storageError } = await supabase.storage
        .from('videos-bucket')
        .upload(fileName, file);

    if (storageError) {
        alert('Error al subir archivo: ' + storageError.message);
        return;
    }

    // 2. Obtener la URL pública del video que acabamos de subir
    const { data: { publicUrl } } = supabase.storage
        .from('videos-bucket')
        .getPublicUrl(fileName);

    // 3. Guardar esa URL en tu tabla de "videos"
    const { error: tableError } = await supabase
        .from('videos')
        .insert([{ 
            video_url: publicUrl, 
            user_name: 'TuNombre', // Aquí puedes poner un prompt para el nombre
            avatar_url: 'https://i.pravatar.cc/150' 
        }]);

    if (tableError) {
        alert('Error al guardar en tabla: ' + tableError.message);
    } else {
        alert('¡Video publicado con éxito!');
        location.reload(); // Recarga la página para ver el video
    }
}

<input type="file" id="fileInput" accept="video/*"

