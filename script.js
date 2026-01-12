// --- 1. CONEXIÓN CON SUPABASE ---
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

const fotos = [
    "https://i.ibb.co/jkcM4khz/file-000000000bd461fb894402f0ff51670d.png",
    "https://i.ibb.co/XZTpkLPW/file-00000000566061f7b0aca36e6e40d8c0.png",
    "https://i.ibb.co/hRTfBsKL/47-sin-t-tulo11.png"
];

// --- 3. INICIO ---
window.onload = () => {
    cargarTags();
    cargarGaleria();
    cargarVideosDeSupabase(); 
};

// --- 4. FUNCIÓN MAESTRA: SUBIR VIDEO ---
async function subirVideoASupabase(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validación simple de tamaño (opcional, máx 50MB)
    if (file.size > 50 * 1024 * 1024) {
        alert("El video es muy pesado. Intenta con uno más corto.");
        return;
    }

    alert("Subiendo video... Por favor no cierres la página.");

    try {
        // A. Nombre único para evitar que se sobrescriban
        const fileName = `${Date.now()}_${file.name.replace(/\s/g, '')}`; // Quita espacios
        
        // B. Subir al Storage (Bucket: videos-bucket)
        const { data: storageData, error: storageError } = await supabase.storage
            .from('videos-bucket') 
            .upload(fileName, file);

        if (storageError) throw storageError;

        // C. Obtener URL Pública
        const { data: { publicUrl } } = supabase.storage
            .from('videos-bucket')
            .getPublicUrl(fileName);

        // D. Guardar en la Tabla (videos)
        const { error: tableError } = await supabase
            .from('videos')
            .insert([{ 
                video_url: publicUrl, 
                user_name: usuarioActual, 
                avatar_url: avatarActual
            }]);

        if (tableError) throw tableError;

        alert('¡Video publicado con éxito!');
        location.reload(); 

    } catch (error) {
        console.error(error);
        alert('Error: ' + error.message);
    }
}

// --- 5. CARGAR VIDEOS ---
async function cargarVideosDeSupabase() {
    const contenedor = document.getElementById("feed-videos");
    
    // Consultar tabla
    const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false }); // Más nuevos primero

    if (error) {
        contenedor.innerHTML = '<p style="text-align:center;">Error al cargar videos.</p>';
        console.error(error);
        return;
    }

    contenedor.innerHTML = ""; // Limpiar mensaje de carga
    
    if (!data || data.length === 0) {
        contenedor.innerHTML = "<p style='text-align:center; color:#777;'>No hay videos aún. ¡Sé el primero!</p>";
        return;
    }

    // Dibujar cada video
    data.forEach(fila => {
        crearTarjetaVideo(fila.video_url, fila.user_name, fila.avatar_url);
    });
}

// --- 6. DIBUJAR TARJETA (HTML) ---
function crearTarjetaVideo(url, usuario, avatar) {
    const contenedor = document.getElementById("feed-videos");
    let card = document.createElement("div");
    card.className = "post-card";
    
    const userDisplay = usuario || "Anónimo";
    const avatarDisplay = avatar || "https://i.pravatar.cc/150";

    card.innerHTML = `
        <div class="post-header">
            <div style="display: flex; align-items:center; gap:10px;">
                <img src="${avatarDisplay}" style="width: 35px; height:35px; border-radius: 50%; object-fit: cover; border: 1px solid #333;">
                <div>
                    <div style="font-weight:bold; font-size: 0.95rem;">${userDisplay}</div>
                    <small style="color:#00f2ff; font-size: 0.75rem;">Video Nuevo</small>
                </div>
            </div>
            <button class="btn-naria">Seguir</button>
        </div>
        
        <video src="${url}" controls playsinline loop></video>
        
        <div class="acciones">
            <button class="btn-icon">❤️</button>
            <button class="btn-icon">💬</button>
            <button class="btn-icon">✈️</button>
        </div>
    `;
    contenedor.appendChild(card); 
}

// --- 7. EXTRAS (Diseño) ---
function cargarTags() {
    const cont = document.getElementById("listaTags");
    if(!cont) return; 
    cont.innerHTML = `<span class="tag-pill activo">Todo</span>`;
    categorias.forEach(cat => {
        cont.innerHTML += `<span class="tag-pill">${cat}</span>`;
    });
}

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
            document.getElementById("miAvatarMini").src = src;
            document.getElementById("modalPerfil").style.display = 'none';
        };
        grid.appendChild(img);
    });
}
