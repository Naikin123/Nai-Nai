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
            contenedor.innerHTML = '<p style="color:white; text-align:center; padding:20px;">No hay videos aún.</p>';
            return;
        }

        data.forEach(v => {
            // Usamos video_url que es como se llama en tu base de datos
            const linkVideo = v.video_url || v.url;
            const nombreUser = v.user_name || v.usuario || 'Nai-Kin';
            const linkAvatar = v.avatar_url || v.avatar || 'https://i.ibb.co/jkcM4khz/file.png';

            if (linkVideo) {
                const card = document.createElement("div");
                card.className = "post-card";
                card.style = "margin-bottom: 25px; background: #111; border-radius: 15px; padding: 12px; border: 1px solid #333;";
                card.innerHTML = `
                    <div style="display:flex; align-items:center; margin-bottom:12px;">
                        <img src="${linkAvatar}" style="width:45px; height:45px; border-radius:50%; margin-right:12px; border: 2px solid #00f2ea;">
                        <span style="color:white; font-weight:bold;">${nombreUser}</span>
                    </div>
                    <video src="${linkVideo}" controls loop playsinline style="width:100%; border-radius:10px; background:black;"></video>
                `;
                contenedor.appendChild(card);
            }
        });
    } catch (err) {
        console.error("Error al cargar:", err);
    }
}

// 2. SUBIR VIDEO
async function subirVideoASupabase(event) {
    const file = event.target.files[0];
    if (!file) return;

    // AVISO: Muestra que detectó el archivo
    alert("¡Video detectado! Empezando subida...");

    // BARRA DE PROGRESO
    const status = document.createElement("div");
    status.style = "position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.9); color:#00f2ea; padding:30px; border-radius:20px; z-index:99999; text-align:center; border: 2px solid #00f2ea; width: 80%;";
    status.innerHTML = `
        <h2 style="margin:0 0 10px 0;">Subiendo...</h2>
        <div style="font-size: 40px; font-weight:bold;" id="percent">0%</div>
        <p style="color:white; margin-top:10px;">Por favor espera</p>
    `;
    document.body.appendChild(status);

    try {
        const fileName = `${Date.now()}_video.mp4`;
        
        // CORRECCIÓN: Usamos 'videos' en minúsculas (Tu captura 1000044673.png lo confirma)
        const { data: storageData, error: storageError } = await _supabase.storage
            .from('videos')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
                onUploadProgress: (progress) => {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    const el = document.getElementById("percent");
                    if(el) el.innerText = percent + "%";
                }
            });

        if (storageError) throw storageError;

        const { data: { publicUrl } } = _supabase.storage
            .from('videos')
            .getPublicUrl(fileName);

        // CORRECCIÓN: Usamos video_url, user_name, avatar_url
        const { error: tableError } = await _supabase
            .from('videos')
            .insert([{ 
                video_url: publicUrl,       
                user_name: "Nai-Kin",       
                avatar_url: "https://i.ibb.co/jkcM4khz/file.png"
            }]);

        if (tableError) throw tableError;

        status.innerHTML = "<h2 style='color:#2ecc71'>✅ ¡Subido con éxito!</h2>";
        setTimeout(() => location.reload(), 1500);

    } catch (error) {
        // Si falla, borramos el cartel de carga y mostramos el error
        status.remove();
        alert('❌ Error: ' + error.message);
    }
}

window.subirVideoASupabase = subirVideoASupabase;
document.addEventListener('DOMContentLoaded', cargarVideos);
