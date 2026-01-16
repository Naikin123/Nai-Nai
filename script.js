const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

async function cargarVideos() {
    const contenedor = document.getElementById("feed-videos");
    if (!contenedor) return;
    try {
        const { data, error } = await _supabase.from('videos').select('*').order('id', { ascending: false });
        if (error) throw error;
        contenedor.innerHTML = ""; 
        data.forEach(v => {
            const link = v.video_url || v.url; 
            if (link) {
                const card = document.createElement("div");
                card.className = "post-card";
                card.style = "margin-bottom: 25px; background: #111; border-radius: 15px; padding: 12px; border: 1px solid #333;";
                card.innerHTML = `
                    <div style="display:flex; align-items:center; margin-bottom:12px;">
                        <img src="${v.avatar || 'https://i.ibb.co/jkcM4khz/file.png'}" style="width:45px; height:45px; border-radius:50%; margin-right:12px; border: 2px solid #00f2ea;">
                        <span style="color:white; font-weight:bold;">${v.usuario || 'Nai-Kin'}</span>
                    </div>
                    <video src="${link}" controls loop playsinline style="width:100%; border-radius:10px; background:black;"></video>
                `;
                contenedor.appendChild(card);
            }
        });
    } catch (err) { console.error(err); }
}

async function subirVideoASupabase(event) {
    const file = event.target.files[0];
    if (!file) return;

    const status = document.createElement("div");
    status.id = "cartel-carga";
    status.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:99999; display:flex; align-items:center; justify-content:center; color:#00f2ea; font-family:sans-serif; padding:20px;";
    status.innerHTML = `
        <div style="border: 4px solid #00f2ea; padding: 40px; border-radius: 20px; text-align:center; background:#000; width:90%; max-width:400px;">
            <h2 style="margin:0;">SUBIENDO...</h2>
            <div style="font-size: 60px; font-weight:bold; margin: 20px 0;" id="percent">0%</div>
            <p id="msg-estado" style="color:white;">Iniciando subida...</p>
        </div>
    `;
    document.body.appendChild(status);

    try {
        const fileName = `${Date.now()}_video.mp4`;
        
        // 1. Subir al Bucket
        const { data: storageData, error: storageError } = await _supabase.storage
            .from('videos')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
                onUploadProgress: (p) => {
                    const percent = Math.round((p.loaded / p.total) * 100);
                    document.getElementById("percent").innerText = percent + "%";
                }
            });

        if (storageError) throw new Error("Error en Storage: " + storageError.message);

        document.getElementById("msg-estado").innerText = "Guardando en base de datos...";

        const { data: { publicUrl } } = _supabase.storage.from('videos').getPublicUrl(fileName);

        // 2. Insertar en Tabla (Usando video_url que ya creamos)
        const { error: tableError } = await _supabase.from('videos').insert([{ 
            video_url: publicUrl, 
            usuario: "Nai-Kin",
            avatar: "https://i.ibb.co/jkcM4khz/file.png"
        }]);

        if (tableError) throw new Error("Error en Tabla: " + tableError.message);

        status.innerHTML = "<div style='text-align:center;'><h1 style='color:#2ecc71; font-size:50px;'>✅</h1><h2 style='color:#2ecc71'>¡PUBLICADO!</h2></div>";
        setTimeout(() => location.reload(), 2000);

    } catch (error) {
        console.error(error);
        alert(error.message); // Esto nos dirá qué falló exactamente
        if(status) status.remove();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarVideos();
    const inputFiles = document.querySelectorAll('input[type="file"]');
    inputFiles.forEach(input => {
        input.addEventListener('change', subirVideoASupabase);
    });
});
