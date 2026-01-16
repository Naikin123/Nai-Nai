const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

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
            contenedor.innerHTML = '<p style="color:white; text-align:center; padding:20px;">Todavía no hay videos.</p>';
            return;
        }

        data.forEach(v => {
            const linkVideo = v.url || v.video_url;
            if (linkVideo) {
                const card = document.createElement("div");
                card.className = "post-card";
                card.style = "margin-bottom: 25px; background: #111; border-radius: 15px; padding: 12px; border: 1px solid #333;";
                card.innerHTML = `
                    <div style="display:flex; align-items:center; margin-bottom:12px;">
                        <img src="${v.avatar || 'https://i.ibb.co/jkcM4khz/file.png'}" style="width:45px; height:45px; border-radius:50%; margin-right:12px; border: 2px solid #00f2ea;">
                        <span style="color:white; font-weight:bold; font-size:1.1em;">${v.usuario || 'Nai-Kin'}</span>
                    </div>
                    <video src="${linkVideo}" controls loop playsinline style="width:100%; border-radius:10px; background:black; box-shadow: 0 4px 15px rgba(0,0,0,0.5);"></video>
                `;
                contenedor.appendChild(card);
            }
        });
    } catch (err) {
        console.error(err);
    }
}

async function subirVideoASupabase(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Crear barra de progreso visual
    const status = document.createElement("div");
    status.style = "position:fixed; top:20px; left:50%; transform:translateX(-50%); background:#00f2ea; color:black; padding:15px 25px; border-radius:30px; z-index:10000; font-weight:bold; box-shadow:0 0 20px rgba(0,242,234,0.5);";
    status.innerHTML = `🚀 Subiendo: <span id="percent">0%</span>`;
    document.body.appendChild(status);

    try {
        const fileName = `${Date.now()}_video.mp4`;
        
        // Intentamos con 'VIDEOS' (mayúsculas) que es como sale en tus políticas
        const { data: storageData, error: storageError } = await _supabase.storage
            .from('VIDEOS')
            .upload(fileName, file, {
                onUploadProgress: (p) => {
                    const percent = Math.round((p.loaded / p.total) * 100);
                    document.getElementById("percent").innerText = percent + "%";
                }
            });

        if (storageError) throw storageError;

        const { data: { publicUrl } } = _supabase.storage
            .from('VIDEOS')
            .getPublicUrl(fileName);

        // Guardar en tabla con tus columnas: url, usuario, avatar
        const { error: tableError } = await _supabase
            .from('videos')
            .insert([{ 
                url: publicUrl, 
                usuario: "Nai-Kin", 
                avatar: "https://i.ibb.co/jkcM4khz/file.png"
            }]);

        if (tableError) throw tableError;

        status.style.background = "#2ecc71";
        status.innerHTML = "✅ ¡Video publicado!";
        setTimeout(() => location.reload(), 1500);

    } catch (error) {
        alert('❌ Error al subir: ' + error.message);
        status.remove();
    }
}

window.subirVideoASupabase = subirVideoASupabase;
document.addEventListener('DOMContentLoaded', cargarVideos);
                
