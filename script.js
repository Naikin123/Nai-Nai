const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 1. CARGAR VIDEOS
async function cargarVideos() {
    const contenedor = document.getElementById("feed-videos");
    if (!contenedor) return;

    try {
        const { data, error } = await _supabase
            .from('videos')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;
        contenedor.innerHTML = ""; 

        if (!data || data.length === 0) {
            contenedor.innerHTML = '<p style="color:white; text-align:center; padding:20px;">No hay videos aún. ¡Sé el primero!</p>';
            return;
        }

        data.forEach(v => {
            const linkVideo = v.url || v.video_url;
            if (linkVideo) {
                const card = document.createElement("div");
                card.className = "post-card";
                card.style = "margin-bottom: 20px; background: #111; border-radius: 12px; padding: 10px;";
                card.innerHTML = `
                    <div class="user-info" style="display:flex; align-items:center; margin-bottom:10px;">
                        <img src="${v.avatar || v.avatar_url || 'https://i.ibb.co/jkcM4khz/file.png'}" style="width:40px; height:40px; border-radius:50%; margin-right:10px;">
                        <span style="color:white; font-weight:bold;">${v.usuario || v.user_name || 'Nai-Kin'}</span>
                    </div>
                    <video src="${linkVideo}" controls loop playsinline style="width:100%; border-radius:8px; background:black;"></video>
                `;
                contenedor.appendChild(card);
            }
        });
    } catch (err) {
        console.error("Error al cargar:", err);
    }
}

// 2. SUBIR VIDEO CON PORCENTAJE
async function subirVideoASupabase(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Crear aviso de progreso visual
    const status = document.createElement("div");
    status.id = "upload-status";
    status.style = "position:fixed; top:20px; left:50%; transform:translateX(-50%); background:white; padding:15px; border-radius:10px; z-index:9999; box-shadow:0 5px 15px rgba(0,0,0,0.3); color:black; font-weight:bold; text-align:center;";
    status.innerHTML = `Subiendo: <span id="percent">0%</span>`;
    document.body.appendChild(status);

    try {
        const fileName = `${Date.now()}_video.mp4`;
        
        // Subida con monitoreo de progreso
        const { data: storageData, error: storageError } = await _supabase.storage
            .from('videos')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
                // Aquí calculamos el porcentaje
                onUploadProgress: (progress) => {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    document.getElementById("percent").innerText = percent + "%";
                }
            });

        if (storageError) throw storageError;

        const { data: { publicUrl } } = _supabase.storage
            .from('videos')
            .getPublicUrl(fileName);

        // Insertar en tabla (intentamos con los nombres que tengas)
        const { error: tableError } = await _supabase
            .from('videos')
            .insert([{ 
                url: publicUrl, 
                usuario: "Nai-Kin", 
                avatar: "https://i.ibb.co/jkcM4khz/file.png"
            }]);

        if (tableError) throw tableError;

        status.innerHTML = "✅ ¡Listo! Recargando...";
        setTimeout(() => location.reload(), 1500);

    } catch (error) {
        alert('❌ Error: ' + error.message);
        if(status) status.remove();
    }
}

window.subirVideoASupabase = subirVideoASupabase;
document.addEventListener('DOMContentLoaded', cargarVideos);
