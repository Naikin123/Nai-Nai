const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

async function borrarVideo(id, user, url) {
    if(!confirm("¿Seguro que quieres desaparecer la x?")) return;
    
    const { error } = await _supabase.from('videos').delete().eq('id', id);
    if (error) alert(error.message);
    else {
        alert(user + " borró el video: " + url + "\n\n¿Fuiste tú?");
        location.reload();
    }
}

async function cargarVideos() {
    const cont = document.getElementById("feed-videos");
    const { data, error } = await _supabase.from('videos').select('*').order('id', { ascending: false });
    
    if (error) { cont.innerHTML = "Error de conexión"; return; }
    cont.innerHTML = "";
    
    data.forEach(v => {
        const div = document.createElement("div");
        div.style = "position:relative; margin-bottom:30px; background:#111; padding:10px; border-radius:10px;";
        div.innerHTML = `
            <button onclick="borrarVideo(${v.id}, '${v.usuario}', '${v.video_url}')" style="position:absolute; top:10px; right:10px; background:red; color:white; border-radius:50%; border:none; width:30px; height:30px; font-weight:bold; z-index:100;">X</button>
            <p style="color:#00f2ea; font-weight:bold;">${v.usuario}</p>
            <video src="${v.video_url}" controls style="width:100%; border-radius:5px;"></video>
        `;
        cont.appendChild(div);
    });
}

document.addEventListener('DOMContentLoaded', cargarVideos);
