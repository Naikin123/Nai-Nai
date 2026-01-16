const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 1. FUNCIÓN PARA CARGAR VIDEOS
async function cargarVideos() {
    const contenedor = document.getElementById("feed-videos");
    if (!contenedor) return;

    try {
        // Traemos todos los videos
        const { data, error } = await _supabase
            .from('videos')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;

        contenedor.innerHTML = ""; 

        if (!data || data.length === 0) {
            contenedor.innerHTML = '<p style="color:white; text-align:center; padding-top:20px;">No hay videos visibles aún.</p>';
            return;
        }

        data.forEach(v => {
            // TRUCO: Intentamos leer con ambos nombres por si acaso
            const linkVideo = v.url || v.video_url;
            const nombreUser = v.usuario || v.user_name || 'Anónimo';
            const linkAvatar = v.avatar || v.avatar_url || 'https://i.ibb.co/jkcM4khz/file.png';

            if (linkVideo) {
                const card = document.createElement("div");
                card.className = "post-card";
                card.innerHTML = `
                    <div class="user-info">
                        <img src="${linkAvatar}" class="avatar">
                        <span>${nombreUser}</span>
                    </div>
                    <video src="${linkVideo}" controls loop playsinline style="width:100%; border-radius:12px; margin-top:10px; background:#000;"></video>
                `;
                contenedor.appendChild(card);
            }
        });
    } catch (err) {
        console.error("Error cargando:", err);
    }
}

// 2. FUNCIÓN PARA SUBIR (Con los nombres que sí funcionaron)
async function subirVideoASupabase(event) {
    const file = event.target.files[0];
    if (!file) return;

    alert("⏳ Iniciando subida... por favor espera el mensaje de éxito.");

    try {
        const fileName = `${Date.now()}_video.mp4`;
        
        // A. Subir al Bucket 'videos'
        const { error: storageError } = await _supabase.storage
            .from('videos')
            .upload(fileName, file);

        if (storageError) throw storageError;

        // B. Obtener Link
        const { data: { publicUrl } } = _supabase.storage
            .from('videos')
            .getPublicUrl(fileName);

        // C. Guardar en Tabla 'videos' (Usando 'url', 'usuario', 'avatar')
        const { error: tableError } = await _supabase
            .from('videos')
            .insert([{ 
                url: publicUrl, 
                usuario: "Nai-Kin", 
                avatar: "https://i.ibb.co/jkcM4khz/file.png"
            }]);

        if (tableError) throw tableError;

        alert('✅ ¡Video subido con éxito!');
        
        // Recargar para ver el nuevo video
        window.location.reload();

    } catch (error) {
        alert('❌ Error: ' + error.message);
        console.error(error);
    }
}

// 3. LÍNEAS MÁGICAS PARA ACTIVAR EL BOTÓN
window.subirVideoASupabase = subirVideoASupabase;
document.addEventListener('DOMContentLoaded', cargarVideos);
