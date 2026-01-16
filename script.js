const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 1. FUNCIÓN PARA CARGAR LOS VIDEOS (Mejorada)
async function cargarVideos() {
    const contenedor = document.getElementById("feed-videos");
    if (!contenedor) return;

    try {
        // Traemos todos los datos de la tabla 'videos'
        const { data, error } = await _supabase
            .from('videos')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            contenedor.innerHTML = '<p style="color:white; text-align:center; padding:20px;">Aún no hay videos. ¡Sé el primero!</p>';
            return;
        }

        contenedor.innerHTML = ""; // Limpiamos antes de cargar

        data.forEach(v => {
            // Buscamos el link en video_url o url
            const link = v.video_url || v.url; 
            if (link) {
                const card = document.createElement("div");
                card.className = "post-card";
                card.style = "margin-bottom: 30px; background: #000; border-radius: 15px; overflow: hidden; border: 1px solid #333;";
                card.innerHTML = `
                    <div style="display:flex; align-items:center; padding: 12px;">
                        <img src="${v.avatar || 'https://i.ibb.co/jkcM4khz/file.png'}" style="width:40px; height:40px; border-radius:50%; margin-right:10px; border: 1px solid #00f2ea;">
                        <span style="color:white; font-weight:bold; font-size:14px;">${v.usuario || 'Nai-Kin'}</span>
                    </div>
                    <video src="${link}" controls loop playsinline style="width:100%; display:block; background:#111; max-height: 500px;"></video>
                `;
                contenedor.appendChild(card);
            }
        });
    } catch (err) {
        console.error("Error al cargar videos:", err);
    }
}

// 2. FUNCIÓN PARA SUBIR VIDEO
async function subirVideoASupabase(event) {
    const file = event.target.files[0];
    if (!file) return;

    const status = document.createElement("div");
    status.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:99999; display:flex; align-items:center; justify-content:center; color:#00f2ea; text-align:center;";
    status.innerHTML = `<div><h2 id="msg">SUBIENDO...</h2><h1 id="p">0%</h1></div>`;
    document.body.appendChild(status);

    try {
        const fileName = `${Date.now()}_video.mp4`;
        
        // Subida al Storage
        const { data: storageData, error: storageError } = await _supabase.storage
            .from('videos')
            .upload(fileName, file, {
                onUploadProgress: (p) => {
                    document.getElementById("p").innerText = Math.round((p.loaded / p.total) * 100) + "%";
                }
            });

        if (storageError) throw storageError;

        const { data: { publicUrl } } = _supabase.storage.from('videos').getPublicUrl(fileName);

        // Insertar en la tabla
        const { error: tableError } = await _supabase.from('videos').insert([{ 
            video_url: publicUrl, 
            usuario: "Nai-Kin",
            avatar: "https://i.ibb.co/jkcM4khz/file.png"
        }]);

        if (tableError) throw tableError;

        document.getElementById("msg").innerText = "¡LOGRADO!";
        setTimeout(() => location.reload(), 1000);

    } catch (error) {
        status.remove();
        alert('Error: ' + error.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarVideos();
    const input = document.querySelector('input[type="file"]');
    if (input) input.addEventListener('change', subirVideoASupabase);
});
