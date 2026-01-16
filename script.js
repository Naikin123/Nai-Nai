const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- 1. CARGAR VIDEOS ---
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
            // Busca video_url (tu base de datos) o url (por si acaso)
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

// --- 2. SUBIR VIDEO (CON BARRA DE PROGRESO VISIBLE) ---
async function subirVideoASupabase(event) {
    const file = event.target.files[0];
    if (!file) return;

    // AVISO INMEDIATO: Si no ves esto, el botón no sirve.
    alert("¡Video detectado! Iniciando subida...");

    // Crear barra de progreso MUY VISIBLE
    const status = document.createElement("div");
    status.id = "upload-status";
    status.style = "position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.9); color:#00f2ea; padding:30px; border-radius:20px; z-index:99999; text-align:center; border: 2px solid #00f2ea; width: 80%;";
    status.innerHTML = `
        <h2 style="margin:0 0 10px 0;">Subiendo...</h2>
        <div style="font-size: 40px; font-weight:bold;" id="percent">0%</div>
        <p style="color:white; margin-top:10px;">No cierres la página</p>
    `;
    document.body.appendChild(status);

    try {
        const fileName = `${Date.now()}_video.mp4`;
        
        // Subimos al bucket 'VIDEOS' (Mayúsculas, como en tu política)
        const { data: storageData, error: storageError } = await _supabase.storage
            .from('VIDEOS')
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
            .from('VIDEOS')
            .getPublicUrl(fileName);

        // AQUÍ ESTABA EL ERROR: Usamos 'video_url' porque tu error dijo que 'url' no existía
        const { error: tableError } = await _supabase
            .from('videos')
            .insert([{ 
                video_url: publicUrl,       // <-- IMPORTANTE: video_url
                user_name: "Nai-Kin",       // <-- IMPORTANTE: user_name
                avatar_url: "https://i.ibb.co/jkcM4khz/file.png" // <-- IMPORTANTE: avatar_url
            }]);

        if (tableError) throw tableError;

        status.innerHTML = "<h2 style='color:#2ecc71'>✅ ¡LISTO!</h2>";
        setTimeout(() => location.reload(), 1500);

    } catch (error) {
        alert('❌ Error: ' + error.message);
        if(status) status.remove();
    }
}

// Conectar funciones
window.subirVideoASupabase = subirVideoASupabase;
document.addEventListener('DOMContentLoaded', cargarVideos);
