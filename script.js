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
            contenedor.innerHTML = '<p style="color:white; text-align:center; padding:20px;">Todavía no hay videos visibles.</p>';
            return;
        }

        data.forEach(v => {
            const linkVideo = v.url || v.video_url;
            if (linkVideo) {
                const card = document.createElement("div");
                card.className = "post-card";
                card.style = "margin-bottom: 20px; background: #111; border-radius: 12px; padding: 10px;";
                card.innerHTML = `
                    <div style="display:flex; align-items:center; margin-bottom:10px;">
                        <img src="${v.avatar || 'https://i.ibb.co/jkcM4khz/file.png'}" style="width:40px; height:40px; border-radius:50%; margin-right:10px;">
                        <span style="color:white; font-weight:bold;">${v.usuario || 'Nai-Kin'}</span>
                    </div>
                    <video src="${linkVideo}" controls loop playsinline style="width:100%; border-radius:8px; background:black;"></video>
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

    const status = document.createElement("div");
    status.style = "position:fixed; top:20px; left:50%; transform:translateX(-50%); background:#00f2ea; color:black; padding:15px 25px; border-radius:30px; z-index:10000; font-weight:bold;";
    status.innerHTML = `🚀 Subiendo: <span id="percent">0%</span>`;
    document.body.appendChild(status);

    try {
        const fileName = `${Date.now()}_video.mp4`;
        
        // --- PRUEBA 1: Intentar con 'VIDEOS' ---
        let { data: storageData, error: storageError } = await _supabase.storage
            .from('VIDEOS')
            .upload(fileName, file, {
                onUploadProgress: (p) => {
                    const percent = Math.round((p.loaded / p.total) * 100);
                    document.getElementById("percent").innerText = percent + "%";
                }
            });

        let finalBucket = 'VIDEOS';

        // --- PRUEBA 2: Si falló, intentar con 'videos' ---
        if (storageError) {
            console.log("Reintentando con minúsculas...");
            const retry = await _supabase.storage
                .from('videos')
                .upload(fileName, file);
            
            if (retry.error) throw retry.error; // Si ambos fallan, lanza error
            storageError = null;
            finalBucket = 'videos';
        }

        const { data: { publicUrl } } = _supabase.storage
            .from(finalBucket)
            .getPublicUrl(fileName);

        const { error: tableError } = await _supabase
            .from('videos')
            .insert([{ 
                url: publicUrl, 
                usuario: "Nai-Kin", 
                avatar: "https://i.ibb.co/jkcM4khz/file.png"
            }]);

        if (tableError) throw tableError;

        status.innerHTML = "✅ ¡Logrado!";
        setTimeout(() => location.reload(), 1000);

    } catch (error) {
        alert('❌ Error: ' + error.message);
        status.remove();
    }
}

window.subirVideoASupabase = subirVideoASupabase;
document.addEventListener('DOMContentLoaded', cargarVideos);
