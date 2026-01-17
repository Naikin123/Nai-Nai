const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 1. FUNCIÓN DE BORRADO (CON TU MENSAJE PERSONALIZADO)
async function borrarVideo(id, nombreUsuario, urlVideo) {
    const modal = document.createElement("div");
    modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:10000; display:flex; align-items:center; justify-content:center; font-family:sans-serif; padding:20px;";
    
    modal.innerHTML = `
        <div style="background:#111; border:2px solid #00f2ea; padding:25px; border-radius:15px; text-align:center; max-width:400px; width:100%; color:white;">
            <h3 style="margin-top:0;">¿Seguro que quieres desaparecer la x?</h3>
            <p style="color:gray; font-size:14px; margin-bottom:20px;">Esta acción eliminará el video permanentemente.</p>
            <div style="display:flex; justify-content:center; gap:15px;">
                <button id="btn-cancelar" style="background:#333; color:white; border:none; padding:10px 20px; border-radius:10px; cursor:pointer; font-weight:bold;">X</button>
                <button id="btn-aceptar" style="background:#ff4b2b; color:white; border:none; padding:10px 20px; border-radius:10px; cursor:pointer; font-weight:bold;">Aceptar</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById("btn-cancelar").onclick = () => modal.remove();

    document.getElementById("btn-aceptar").onclick = async () => {
        const { error } = await _supabase.from('videos').delete().eq('id', id);
        if (error) {
            alert("Error: " + error.message);
        } else {
            // AQUÍ ESTÁ EL MENSAJE QUE PEDISTE
            alert(`${nombreUsuario} borró el video: ${urlVideo}\n\n¿Fuiste tú?`);
            location.reload();
        }
    };
}

// 2. CARGAR VIDEOS
async function cargarVideos() {
    const contenedor = document.getElementById("feed-videos");
    if (!contenedor) return;
    try {
        const { data, error } = await _supabase.from('videos').select('*').order('id', { ascending: false });
        if (error) throw error;
        contenedor.innerHTML = "";
        data.forEach(v => {
            const card = document.createElement("div");
            card.className = "post-card";
            card.style.cssText = "position:relative; margin-bottom:35px; background:#111; border-radius:15px; padding:12px; border:1px solid #333;";
            card.innerHTML = `
                <button onclick="borrarVideo(${v.id}, '${v.usuario}', '${v.video_url}')" style="position:absolute; top:15px; right:15px; background:red; color:white; border:2px solid white; border-radius:50%; width:35px; height:35px; font-weight:bold; cursor:pointer; z-index:100;">X</button>
                <div style="display:flex; align-items:center; margin-bottom:12px;">
                    <img src="${v.avatar}" style="width:40px; height:40px; border-radius:50%; margin-right:10px; border: 1px solid #00f2ea;">
                    <span style="color:white; font-weight:bold;">${v.usuario}</span>
                </div>
                <video src="${v.video_url}" controls loop playsinline style="width:100%; border-radius:10px;"></video>
            `;
            contenedor.appendChild(card);
        });
    } catch (err) { console.error(err); }
}

// 3. SUBIR VIDEO
async function subirVideoASupabase(event) {
    const file = event.target.files[0];
    if (!file) return;
    const status = document.createElement("div");
    status.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:99999; display:flex; align-items:center; justify-content:center; color:#00f2ea;";
    status.innerHTML = `<div><h2>SUBIENDO...</h2></div>`;
    document.body.appendChild(status);
    try {
        const fileName = `${Date.now()}_video.mp4`;
        await _supabase.storage.from('videos').upload(fileName, file);
        const { data: { publicUrl } } = _supabase.storage.from('videos').getPublicUrl(fileName);
        await _supabase.from('videos').insert([{ video_url: publicUrl, usuario: "Nai-Kin", avatar: "https://i.ibb.co/jkcM4khz/file.png" }]);
        location.reload();
    } catch (error) { alert(error.message); status.remove(); }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarVideos();
    const input = document.querySelector('input[type="file"]');
    if (input) input.addEventListener('change', subirVideoASupabase);
});
    
