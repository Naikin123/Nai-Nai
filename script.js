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
            contenedor.innerHTML = '<p style="color:white; text-align:center; padding:20px;">No hay videos aún.</p>';
            return;
        }

        data.forEach(v => {
            // Usamos los nombres exactos de tus columnas
            const linkVideo = v.video_url || v.url;
            const nombreUser = v.user_name || v.usuario || 'Nai-Kin';
            const linkAvatar = v.avatar_url || v.avatar || 'https://i.ibb.co/jkcM4khz/file.png';

            if (linkVideo) {
                const card = document.createElement("div");
                card.className = "post-card";
                card.style = "margin-bottom: 25px; background: #111; border-radius: 15px; padding: 12px; border: 1px solid #333;";
                card.innerHTML = `
                    <div style="display:flex; align-items:center; margin-bottom:12px;">
                        <img src="${linkAvatar}" style="width:45px; height:45px; border-radius:50%; margin-right:12px;">
                        <span style="color:white; font-weight:bold;">${nombreUser}</span>
                    </div>
                    <video src="${linkVideo}" controls loop playsinline style="width:100%; border-radius:10px; background:black;"></video>
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
        
        // Intentamos con 'VIDEOS' que es el que funcionó
        const { data: storageData, error: storageError } = await _supabase.storage
            .from('VIDEOS')
            .upload(fileName, file, {
                onUploadProgress: (p) => {
                    const percent = Math.round((p.loaded / p.total) * 100);
                    const el = document.getElementById("percent");
                    if(el) el.innerText = percent + "%";
                }
            });

        if (storageError) throw storageError;

        const { data: { publicUrl } } = _supabase.storage
            .from('VIDEOS')
            .getPublicUrl(fileName);

        // --- CORRECCIÓN CLAVE AQUÍ ---
        // Usamos los nombres que tu base de datos reconoce
        const { error: tableError } = await _supabase
            .from('videos')
            .insert([{ 
                video_url: publicUrl, 
                user_name: "Nai-Kin", 
                avatar_url: "https://i.ibb.co/jkcM4khz/file.png"
            }]);

        if (tableError) throw tableError;

        status.innerHTML = "✅ ¡Publicado!";
        setTimeout(() => location.reload(), 1000);

    } catch (error) {
        alert('❌ Error: ' + error.message);
        status.remove();
    }
}

window.subirVideoASupabase = subirVideoASupabase;
document.addEventListener('DOMContentLoaded', cargarVideos);

