let codigoGenerado = "";

// Función para generar código aleatorio
function generarCaptcha() {
  codigoGenerado = Math.floor(1000 + Math.random() * 9000).toString(); // Crea 4 números
  const box = document.getElementById('codigo-visual');
  if(box) box.innerText = codigoGenerado;
}

// Lógica del botón verificar
document.getElementById('btn-confirmar-v').addEventListener('click', () => {
  const inputUser = document.getElementById('input-verificar').value;
  const errorMsg = document.getElementById('msg-error');

  if (inputUser === codigoGenerado) {
    alert("¡Verificación exitosa! Bienvenido a Nai Nai.");
    // Aquí activarías el GUA o el registro en Supabase
    errorMsg.style.display = 'none';
    document.getElementById('seccion-verificacion').style.display = 'none';
  } else {
    errorMsg.style.display = 'block';
    generarCaptcha(); // Cambia el código si falla
  }
});

// Llamar a la función al cargar
generarCaptcha();
