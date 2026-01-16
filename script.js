const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

async function cargarVideos() {
    const contenedor = document.getElementById("feed-videos");
    if (!contenedor) return;
    try {
        // QUITAMOS EL .order('id') PORQUE TU TABLA NO TIENE ESA COLUMNA
        const { data, error } = await _supabase.from('videos').select('*');
        if (error) throw error;
        contenedor.innerHTML = ""; 
        if (!data || data.length === 0) {
            contenedor.innerHTML = '<p style="color:gray; text-align:center; padding:20px;">No hay videos aún.</p>';
            return;
        }
        data.forEach(v => {
            const link = v.video_url; 
            if (link) {
                const card = document.createElement("div");
                card.className = "post-card";
                card.style = "margin-bottom: 25px; background: #111; border-radius: 15px; padding: 10px; border: 1px solid #333;";
                card.innerHTML = `
                    <div style="display:flex; align-items:center; margin-bottom:10px;">
                        <img src="${v.avatar || 'https://i.ibb.co/jkcM4khz/file.png'}" style="width:40px; height:40px; border-radius:50%; margin-right:10px; border: 1px solid #00f2ea;">
                        <span style="color:white; font-weight:bold;">${v.usuario || 'Nai-Kin'}</span>
                    </div>
                    <video src="${link}" controls loop playsinline style="width:100%; border-radius:10px; background:black;"></video>
                `;
                contenedor.appendChild(card);
            }
        });
    } catch (err) { 
        console.error(err); 
        contenedor.innerHTML = `<p style="color:red; text-align:center;">Error: ${err.message}</p>`;
    }
}

async function subirVideoASupabase(event) {
    const file = event.target.files[0];
    if (!file) return;
    const status = document.createElement("div");
    status.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:99999; display:flex; align-items:center; justify-content:center; color:#00f2ea; text-align:center; font-family:sans-serif;";
    status.innerHTML = `<div><h2>SUBIENDO...</h2><h1 id="p" style="font-size:50px;">0%</h1></div>`;
    document.body.appendChild(status);
    try {
        const fileName = `${Date.now()}_video.mp4`;
        const { data, error: storageError } = await _supabase.storage.from('videos').upload(fileName, file, {
            onUploadProgress: (p) => { document.getElementById("p").innerText = Math.round((p.loaded / p.total) * 100) + "%"; }
        });
        if (storageError) throw storageError;
        const { data: { publicUrl } } = _supabase.storage.from('videos').getPublicUrl(fileName);
        const { error: tableError } = await _supabase.from('videos').insert([{ 
            video_url: publicUrl, 
            usuario: "Nai-Kin",
            avatar: "https://i.ibb.co/jkcM4khz/file.png"
        }]);
        if (tableError) throw tableError;
        location.reload();
    } catch (error) {
        status.remove();
        alert('Error: ' + error.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarVideos();
    const btn = document.querySelector('input[type="file"]');
    if (btn) btn.addEventListener('change', subirVideoASupabase);
});

