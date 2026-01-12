// --- 1. CONEXIÓN CON SUPABASE ---
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// --- 2. CONFIGURACIÓN Y DATOS ---
const categorias = [
    "Gracioso", "Epico", "Educativo", "Motivacional", "Animación",
    "Videojuegos", "Tutorial", "Vlog", "Musical", "Recetas"
];

let usuarioActual = "Nai-kin"; // Nombre por defecto
let avatarActual = "https://i.ibb.co/jkcM4khz/file-000000000bd461fb894402f0ff51670d.png";

// --- 3. INICIO ---
window.onload = () => {
    cargarTags();
    cargarGaleria();
    cargarVideosDeSupabase(); 
};

// --- 4. SUBIR VIDEO (Función Maestra) ---
async function subirVideoASupabase(event) {
    const file = event.target.files[0];
    if (!file) return;

    alert("Subiendo video... Por favor espera.");

    // A. Subir el video a la carpeta "videos-bucket"
    const fileName = `${Date.now()}_${file.name}`;
    
    const { data: storageData, error: storageError } = await supabase.storage
        .from('videos-bucket') // Asegúrate de que tu bucket se llame así
        .upload(fileName, file);

    if (storageError) {
        alert('Error al subir archivo: ' + storageError.message);
        return;
    }

    // B. Obtener el Link Público del video
    const { data: { publicUrl } } = supabase.storage
        .from('videos-bucket')
        .getPublicUrl(fileName);

    // C. Guardar la info en la Tabla "videos"
    const { error: tableError } = await supabase
        .from('videos')
        .insert([{ 
            video_url: publicUrl, 
            user_name: usuarioActual, 
            avatar_url: avatarActual
            // description: 'Video nuevo' (si agregaste esa columna)
        }]);

    if (tableError) {
        alert('Error al guardar en la base de datos: ' + tableError.message);
    } else {
        alert('¡Video publicado con éxito!');
        location.reload(); 
    }
}

// --- 5. CARGAR VIDEOS DE LA TABLA ---
async function cargarVideosDeSupabase() {
    const contenedor = document.getElementById("feed-videos");
    contenedor.innerHTML = '<p style="text-align:center; color:#00f2ff;">Cargando videos...</p>';

    // Leemos la TABLA "videos" ordenados por fecha (el más nuevo primero)
    const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        contenedor.innerHTML = '<p>Error cargando videos.</p>';
        console.error(error);
    } else {
        contenedor.innerHTML = ""; // Limpiar mensaje de carga
        
        if (!data || data.length === 0) {
            contenedor.innerHTML = "<p style='text-align:center;'>No hay videos aún.</p>";
            return;
        }

        // Crear una tarjeta por cada fila de la tabla
        data.forEach(fila => {
            crearTarjetaVideo(fila.video_url, fila.user_name, fila.avatar_url);
        });
    }
}

// --- 6. DIBUJAR LA TARJETA DEL VIDEO ---
function crearTarjetaVideo(url, usuario, avatar) {
    const contenedor = document.getElementById("feed-videos");
    let card = document.createElement("div");
    card.className = "post-card";
    
    // Si no hay avatar o usuario en la base de datos, usamos unos por defecto
    const userDisplay = usuario || "Anónimo";
    const avatarDisplay = avatar || "https://i.pravatar.cc/150";

    card.innerHTML = `
        <div class="post-header">
            <div style="display: flex; align-items:center; gap:10px;">
                <img src="${avatarDisplay}" style="width: 35px; height:35px; border-radius: 50%; object-fit: cover;">
                <div>
                    <div style="font-weight:bold;">${userDisplay}</div>
                    <small style="color:#00f2ff;">Video Sugerido</small>
                </div>
            </div>
        </div>
        <video src="${url}" controls playsinline style="width: 100%; border-radius: 10px; margin-top: 10px;"></video>
        <div class="acciones">
            <button class="btn-icon">❤️ Like</button>
            <button class="btn-icon">💬 Comentar</button>
        </div>
    `;
    contenedor.appendChild(card); 
}

// --- 7. FUNCIONES EXTRAS (Diseño) ---
function cargarTags() {
    const cont = document.getElementById("listaTags");
    if(!cont) return; 
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
    const modal = document.getElementById("modalPerfil");
    if(modal) modal.style.display = "flex";
}

function cargarGaleria() {
    const grid = document.getElementById("galeria");
    if(!grid) return;
    
    fotos.forEach(src => {
        let img = document.createElement("img");
        img.src = src;
        img.onclick = () => {
            avatarActual = src;
            const imgMini = document.getElementById("miAvatarMini");
            if(imgMini) imgMini.src = src;
            document.getElementById("modalPerfil").style.display = 'none';
        };
        grid.appendChild(img);
    });
}
