const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const info = document.getElementById("info");

let objetos = [];
let eliminados = 0;
let nivel = 1;
let velocidadBase = 1;

// Crear grupo inicial de 10 objetos
function crearGrupo() {
  for (let i = 0; i < 10; i++) {
    objetos.push({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 100, // fuera de pantalla abajo
      size: 20 + Math.random() * 20,
      color: "white",
      alpha: 1,
      eliminado: false
    });
  }
}
crearGrupo();

// Detección de mouse
canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  objetos.forEach(obj => {
    const dx = mouseX - obj.x;
    const dy = mouseY - obj.y;
    const distancia = Math.sqrt(dx*dx + dy*dy);

    if (!obj.eliminado && distancia < obj.size/2) {
      obj.color = "red"; // cambia color al detectar coordenadas
    } else {
      obj.color = "white";
    }
  });
});

// Click para eliminar
canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  objetos.forEach(obj => {
    const dx = mouseX - obj.x;
    const dy = mouseY - obj.y;
    const distancia = Math.sqrt(dx*dx + dy*dy);

    if (!obj.eliminado && distancia < obj.size/2) {
      obj.eliminado = true; // marcar para desaparecer lentamente
    }
  });
});

// Dibujar y actualizar
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  objetos.forEach(obj => {
    if (obj.eliminado) {
      obj.alpha -= 0.02; // desaparición lenta
      if (obj.alpha <= 0) {
        eliminados++;
        obj.alpha = 0;
      }
    } else {
      obj.y -= velocidadBase * nivel * 0.5; // movimiento hacia arriba
      obj.x += Math.sin(obj.y/50) * 0.5;    // viaje aleatorio
    }

    if (obj.alpha > 0) {
      ctx.globalAlpha = obj.alpha;
      ctx.fillStyle = obj.color;
      ctx.beginPath();
      ctx.arc(obj.x, obj.y, obj.size/2, 0, Math.PI * 2); // círculo
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  });

  // Filtrar objetos eliminados
  objetos = objetos.filter(obj => obj.alpha > 0 || !obj.eliminado);

  // Mostrar estadísticas
  let porcentaje = ((eliminados % 10) / 10) * 100;
  info.innerHTML = `Eliminados: ${eliminados} | Nivel: ${nivel} | Progreso nivel: ${porcentaje.toFixed(0)}%`;

  // Avanzar nivel
  if (eliminados > 0 && eliminados % 10 === 0 && objetos.length === 0) {
    nivel++;
    crearGrupo();
  }

  requestAnimationFrame(draw);
}
draw();