const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- FUNCIÓN PARA CARGAR VIDEOS ---
async function cargarVideos() {
    const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error("Error al cargar:", error);
        return;
    }

    const contenedor = document.getElementById("feed-videos");
    if (!contenedor) return;
    contenedor.innerHTML = ""; 

    data.forEach(v => {
        const card = document.createElement("div");
        card.className = "post-card";
        card.innerHTML = `
            <div class="user-info">
                <img src="${v.avatar}" class="avatar">
                <span>${v.usuario}</span>
            </div>
            <video src="${v.url}" controls loop></video>
        `;
        contenedor.appendChild(card);
    });
}

// --- FUNCIÓN PARA SUBIR VIDEOS ---
async function subirVideoASupabase(event) {
    const file = event.target.files[0];
    if (!file) return;

    alert("Subiendo video de 1 segundo... espera un momento.");

    try {
        const fileName = `${Date.now()}_video.mp4`;
        const { data: storageData, error: storageError } = await supabase.storage
            .from('VIDEOS')
            .upload(fileName, file);

        if (storageError) throw storageError;

        const { data: { publicUrl } } = supabase.storage
            .from('VIDEOS')
            .getPublicUrl(fileName);

        // AQUÍ USAMOS TUS COLUMNAS: url, usuario, avatar
        const { error: tableError } = await supabase
            .from('videos')
            .insert([{ 
                url: publicUrl, 
                usuario: "Nai-Kin", 
                avatar: "https://i.ibb.co/jkcM4khz/file.png"
            }]);

        if (tableError) throw tableError;

        alert('¡Publicado con éxito!');
        cargarVideos(); 

    } catch (error) {
        alert('Error al subir: ' + error.message);
    }
}

// Iniciar carga al abrir la app
window.onload = cargarVideos;
