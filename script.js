const supabaseUrl = 'https://icxjeadofnotafxcpkhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeGplYWRvZm5vdGFmeGNwa2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwOTM1MjEsImV4cCI6MjA4MzY2OTUyMX0.COAgUCOMa7la7EIg-fTo4eAvb-9lY83xemQNJGFnY7o';
const supabase = createClient(https:https://icxjeadofnotafxcpkhz.supabase.co,);

// Verifica si ya aceptó las reglas al cargar la página
window.addEventListener('load', () => {
    if (localStorage.getItem('rulesAccepted') === 'true') {
        document.getElementById('rules-page').style.display = 'none';
        document.getElementById('main-interface').style.display = 'block';
    }
});

function acceptRules() {
    localStorage.setItem('rulesAccepted', 'true');
    document.getElementById('rules-page').style.display = 'none';
    document.getElementById('main-interface').style.display = 'block';
}

function zoomLogo() {
    const logo = document.querySelector('.logo img');
    logo.style.transform = 'scale(2)';
    setTimeout(() => logo.style.transform = 'scale(1)', 500);
}

function openUpload() {
    alert('Abriendo subida de video...');
    // Aquí va lógica real para mostrar #upload-page
}

function openProfile() {
    alert('Abriendo perfil...');
    // Aquí va lógica para mostrar #profile-page
}

// Otras funciones como antes
