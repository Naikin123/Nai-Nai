const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

async function subirVideoASupabase(event) {
    const file = event.target.files[0];
    if (!file) return;

    alert("Subiendo video de 2 segundos...");

    try {
        const fileName = `${Date.now()}_video.mp4`;
        
        // 1. Subir al Storage (Bucket VIDEOS)
        const { data: storageData, error: storageError } = await supabase.storage
            .from('VIDEOS')
            .upload(fileName, file);

        if (storageError) throw storageError;

        // 2. Obtener la URL pública
        const { data: { publicUrl } } = supabase.storage
            .from('VIDEOS')
            .getPublicUrl(fileName);

        // 3. Guardar en la Tabla 'videos' con tus nombres exactos
        const { error: tableError } = await supabase
            .from('videos')
            .insert([{ 
                url: publicUrl, 
                usuario: "Nai-kin", 
                avatar: "https://i.ibb.co/jkcM4khz/file.png"
            }]);

        if (tableError) throw tableError;

        alert('¡Publicado con éxito!');
        location.reload(); 

    } catch (error) {
        alert('Error: ' + error.message);
    }
}
