// --- 1. CONFIGURACIÓN DE SUPABASE ---
// Asegúrate de que estas claves sean las de tu proyecto
const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- 2. FUNCIÓN PARA CARGAR VIDEOS (Lectura) ---
async function cargarVideos() {
    const contenedor = document.getElementById("feed-videos");
    
    // Mostramos que está cargando
    if(!contenedor) return;
    contenedor.innerHTML = '<p style="color:white; text-align:center;">Cargando videos...</p>';

    try {
        // Pedimos los videos a la tabla 'videos'
        const { data, error } = await supabase
            .from('videos')
            .select('*')
            .order('created_at', { ascending: false }); // Ordenar del más nuevo al más viejo

        if (error) throw error;

        // Limpiamos el contenedor antes de mostrar
        contenedor.innerHTML = "";

        if (data.length === 0) {
            contenedor.innerHTML = '<p style="color:white; text-align:center;">No hay videos aún.</p>';
            return;
        }

        // Creamos una tarjeta por cada video
        data.forEach(video => {
            const card = document.createElement("div");
            card.className = "post-card";
            
            // Usamos TUS nombres de columnas: video_url, user_name, avatar_url
            // Si alguna columna viene vacía, ponemos valores por defecto
            const urlVideo = video.video_url || "";
            const nombreUsuario = video.user_name || "Anónimo";
            const urlAvatar = video.avatar_url || "https://i.ibb.co/jkcM4khz/file.png";

            card.innerHTML = `
                <div class="user-info">
                    <img src="${urlAvatar}" class="avatar" alt="Avatar">
                    <span>${nombreUsuario}</span>
                </div>
                <video src="${urlVideo}" controls loop playsinline style="width: 100%; border-radius: 10px;"></video>
            `;
            contenedor.appendChild(card);
        });

    } catch (error) {
        console.error("Error cargando videos:", error);
        contenedor.innerHTML = '<p style="color:red; text-align:center;">Error al cargar videos. Intenta refrescar.</p>';
    }
}

// --- 3. FUNCIÓN PARA SUBIR VIDEO (Escritura) ---
async function subirVideoASupabase(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validación simple de tamaño (opcional, máx 50MB)
    if (file.size > 50 * 1024 * 1024) {
        alert("El video es muy pesado. Intenta con uno más corto.");
        return;
    }

    alert("⏳ Subiendo video... Por favor no cierres la página.");

    try {
        // A. Crear nombre único para el archivo
        const archivoNombre = `video_${Date.now()}_${Math.floor(Math.random() * 1000)}.mp4`;
        
        // B. Subir el archivo al Bucket 'videos'
        const { data: datosStorage, error: errorStorage } = await supabase.storage
            .from('videos')
            .upload(archivoNombre, file);

        if (errorStorage) throw new Error("Error subiendo archivo: " + errorStorage.message);

        // C. Obtener el link público del video
        const { data: datosUrl } = supabase.storage
            .from('videos')
            .getPublicUrl(archivoNombre);
        
        const linkPublico = datosUrl.publicUrl;

        // D. Guardar la información en la Tabla 'videos'
        // IMPORTANTE: Aquí usamos las columnas que creaste: video_url, user_name, avatar_url
        const { error: errorTabla } = await supabase
            .from('videos')
            .insert([{ 
                video_url: linkPublico, 
                user_name: "Usuario Nuevo", 
                avatar_url: "https://i.ibb.co/jkcM4khz/file-000000000bd461fb894402f0ff51670d.png" 
            }]);

        if (errorTabla) throw new Error("Error guardando en base de datos: " + errorTabla.message);

        // E. Éxito
        alert('✅ ¡Video publicado con éxito!');
        
        // Recargar para ver el video nuevo
        cargarVideos(); 

    } catch (error) {
        console.error(error);
        alert('❌ Ocurrió un error: ' + error.message);
    }
}

// --- 4. INICIALIZACIÓN ---
// Cargar videos cuando la página abra
window.addEventListener('DOMContentLoaded', cargarVideos);

// Hacer la función de subida accesible globalmente (para el HTML onchange)
window.subirVideoASupabase = subirVideoASupabase;
