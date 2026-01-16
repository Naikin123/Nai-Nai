const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 1. CARGAR VIDEOS (Busca en cualquier columna)
async function cargarVideos() {
    const contenedor = document.getElementById("feed-videos");
    if (!contenedor) return;

    try {
        const { data, error } = await _supabase.from('videos').select('*').order('id', { ascending: false });
        if (error) throw error;
        contenedor.innerHTML = ""; 

        if (!data || data.length === 0) {
            contenedor.innerHTML = '<p style="color:white; text-align:center; padding:20px;">No hay videos aún.</p>';
            return;
        }

        data.forEach(v => {
            const link = v.video_url || v.url || v.link; // Prueba varios nombres
            if (link) {
                const card = document.createElement("div");
                card.className = "post-card";
                card.style = "margin-bottom: 25px; background: #111; border-radius: 15px; padding: 12px; border: 1px solid #333;";
                card.innerHTML = `
                    <div style="display:flex; align-items:center; margin-bottom:12px;">
                        <img src="https://i.ibb.co/jkcM4khz/file.png" style="width:45px; height:45px; border-radius:50%; margin-right:12px; border: 2px solid #00f2ea;">
                        <span style="color:white; font-weight:bold;">Usuario</span>
                    </div>
                    <video src="${link}" controls loop playsinline style="width:100%; border-radius:10px; background:black;"></video>
                `;
                contenedor.appendChild(card);
            }
        });
    } catch (err) { console.error(err); }
}

// 2. SUBIR VIDEO (Intenta múltiples nombres de columna)
async function subirVideoASupabase(event) {
    const file = event.target.files[0];
    if (!file) return;

    const status = document.createElement("div");
    status.style = "position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.95); color:#00f2ea; padding:30px; border-radius:20px; z-index:99999; text-align:center; border: 2px solid #00f2ea; width: 80%;";
    status.innerHTML = `<h2>Subiendo...</h2><div style="font-size: 40px; font-weight:bold;" id="percent">0%</div>`;
    document.body.appendChild(status);

    try {
        const fileName = `${Date.now()}_video.mp4`;
        const { data: storageData, error: storageError } = await _supabase.storage
            .from('videos')
            .upload(fileName, file, {
                onUploadProgress: (p) => {
                    const percent = Math.round((p.loaded / p.total) * 100);
                    document.getElementById("percent").innerText = percent + "%";
                }
            });

        if (storageError) throw storageError;

        const { data: { publicUrl } } = _supabase.storage.from('videos').getPublicUrl(fileName);

        // --- PRUEBA DE COLUMNAS ---
        // Intentamos insertar con 'video_url', si falla, intentamos con 'url'
        let errorFinal;
        
        const prueba1 = await _supabase.from('videos').insert([{ video_url: publicUrl }]);
        if (!prueba1.error) { exitoso(); return; }

        const prueba2 = await _supabase.from('videos').insert([{ url: publicUrl }]);
        if (!prueba2.error) { exitoso(); return; }

        // Si llega aquí, es que fallaron ambos
        throw new Error("No encontré las columnas 'video_url' ni 'url' en tu tabla.");

        function exitoso() {
            status.innerHTML = "<h2 style='color:#2ecc71'>✅ ¡LOGRADO!</h2>";
            setTimeout(() => location.reload(), 1500);
        }

    } catch (error) {
        status.remove();
        alert('❌ Error: ' + error.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarVideos();
    const btn = document.querySelector('input[type="file"]');
    if (btn) btn.addEventListener('change', subirVideoASupabase);
});
