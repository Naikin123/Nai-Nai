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
            contenedor.innerHTML = '<p style="color:white; text-align:center; padding:20px;">Todavía no hay videos.</p>';
            return;
        }

        data.forEach(v => {
            const card = document.createElement("div");
            card.className = "post-card";
            // CORRECCIÓN: Usamos video_url, user_name y avatar_url según tus capturas
            card.innerHTML = `
                <div class="user-info">
                    <img src="${v.avatar_url || 'https://i.ibb.co/jkcM4khz/file.png'}" class="avatar">
                    <span>${v.user_name || 'Nai-Kin'}</span>
                </div>
                <video src="${v.video_url}" controls loop playsinline style="width:100%; border-radius:12px; margin-top:10px; background:black;"></video>
            `;
            contenedor.appendChild(card);
        });
    } catch (err) {
        console.error("Error al cargar:", err);
    }
}

async function subirVideoASupabase(event) {
    const file = event.target.files[0];
    if (!file) return;

    alert("⏳ Subiendo video... espera la confirmación.");

    try {
        const fileName = `${
            
