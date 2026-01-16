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
        if (!data || data.length === 0) {
            contenedor.innerHTML = '<p style="color:gray; text-align:center; padding:20px;">No hay videos aún.</p>';
            return;
        }
        data.forEach(v => {
            const link = v.video_url || v.url; 
            if (link) {
                const card = document.createElement("div");
                card.className = "post-card";
                card.style = "margin-bottom: 25px; background: #111; border-radius: 15px; padding: 10px; border: 1px solid #333;";
                card.innerHTML = `
                    <div style="display:flex; align-items:center; margin-bottom:10px;">
                        <img src="${v.avatar || 'https://i.ibb.co/jkcM4khz/file.png'}" style="width:40px; height:40px; border-radius:50%; margin-right:10px; border: 2px solid #00f2ea;">
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
    status.id = "overlay-carga";
    status.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:99999; display:flex; align-items:center; justify-content:center; color:#00f2ea; text-align:center; font-family:sans-serif; padding:20px;";
    status.innerHTML = `
        <div id="box-carga" style="border: 2px solid #00f2ea; padding: 30px; border-radius: 20px; background:#000; width:100%; max-width:350px;">
            <h2 id="txt-estado">ENVIANDO...</h2>
            <h1 id="num-porcentaje" style="font-size:60px; margin:10px 0;">0%</h1>
            <p id="txt-detalle" style="color:white; font-size:12px;">Subiendo archivo...</p>
        </div>
    `;
    document.body.appendChild(status);

    try {
        const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
        const { data, error: storageError } = await _supabase.storage
            .from('videos')
            .upload(fileName, file, {
                onUploadProgress: (p) => {
                    const progreso = Math.round((p.loaded / p.total) * 100);
                    document.getElementById("num-porcentaje").innerText = progreso + "%";
                }
            });

        if (storageError) throw new Error("ERROR STORAGE: " + storageError.message);

        const { data: { publicUrl } } = _supabase.storage.from('videos').getPublicUrl(fileName);

        const { error: tableError } = await _supabase.from('videos').insert([{ 
            video_url: publicUrl, 
            usuario: "Nai-Kin",
            avatar: "https://i.ibb.co/jkcM4khz/file.png"
        }]);

        if (tableError) throw new Error("ERROR TABLA: " + tableError.message);

        document.getElementById("box-carga").style.borderColor = "#2ecc71";
        document.getElementById("txt-estado").innerText = "¡COMPLETO!";
        setTimeout(() => location.reload(), 1500);

    } catch (error) {
        document.getElementById("box-carga").style.borderColor = "red";
        document.getElementById("txt-estado").innerText = "ERROR";
        document.getElementById("txt-detalle").innerText = error.message;
        setTimeout(() => status.remove(), 4000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarVideos();
    const btn = document.querySelector('input[type="file"]');
    if (btn) btn.addEventListener('change', subirVideoASupabase);
});
        
