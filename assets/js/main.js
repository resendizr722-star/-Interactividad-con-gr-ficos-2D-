const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const info = document.getElementById("info");

// Ajuste responsivo
function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let objetos = [];
let eliminados = 0;
let nivel = 1;
let gameOver = false;

const TAM = 50;
let mouse = { x: 0, y: 0 };

// Evitar encimarse
function posicionValida(x, y) {
  return !objetos.some(obj => {
    let dx = x - obj.x;
    let dy = y - obj.y;
    return dx * dx + dy * dy < (TAM * TAM);
  });
}

// Crear objetos
function crearGrupo() {
  let intentos = 0;
  while (objetos.length < 10 && intentos < 500) {
    let x = Math.random() * canvas.width;
    let y = canvas.height + Math.random() * 100;

    if (posicionValida(x, y)) {
      objetos.push({
        x,
        y,
        size: TAM,
        eliminado: false,
        alpha: 1,
        velocidadX: (canvas.width/2 - x) * 0.001
      });
    }
    intentos++;
  }
}
crearGrupo();

// Mouse
canvas.addEventListener("pointermove", e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

// Click
canvas.addEventListener("pointerdown", e => {
  if (gameOver) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  objetos.forEach(obj => {
    let dx = x - obj.x;
    let dy = y - obj.y;
    let dist = Math.sqrt(dx*dx + dy*dy);

    if (!obj.eliminado && dist < obj.size/2) {
      obj.eliminado = true;
    }
  });
});

// 🔥 GAME OVER CON ICONO
function drawGameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#00ffcc";
  ctx.textAlign = "center";

  ctx.font = "bold 40px Arial";
  ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2 - 40);

  ctx.font = "20px Arial";
  ctx.fillText(`Nivel: ${nivel}`, canvas.width/2, canvas.height/2);
  ctx.fillText(`Puntos: ${eliminados}`, canvas.width/2, canvas.height/2 + 30);

  // 🔄 Icono flecha
  ctx.font = "50px Arial";
  ctx.fillText("↻", canvas.width/2, canvas.height/2 + 90);
}

// Reinicio
canvas.addEventListener("click", e => {
  if (gameOver) {
    objetos = [];
    eliminados = 0;
    nivel = 1;
    gameOver = false;
    crearGrupo();
  }
});

// Loop
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let velocidad = 0.5 + nivel * 0.2;

  objetos.forEach(obj => {

    let dx = mouse.x - obj.x;
    let dy = mouse.y - obj.y;
    let dist = Math.sqrt(dx*dx + dy*dy);

    ctx.fillStyle = dist < obj.size/2 ? "red" : "white";

    if (obj.eliminado) {
      obj.alpha -= 0.03;
      if (obj.alpha <= 0) eliminados++;
    } else {
      obj.y -= velocidad;
      obj.x += obj.velocidadX;

      if (obj.y < -50) gameOver = true;
    }

    if (obj.alpha > 0) {
      ctx.globalAlpha = obj.alpha;
      ctx.beginPath();
      ctx.arc(obj.x, obj.y, obj.size/2, 0, Math.PI*2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  });

  objetos = objetos.filter(obj => obj.alpha > 0);

  info.innerHTML = `Eliminados: ${eliminados} | Nivel: ${nivel} | Progreso: ${(eliminados%10)*10}%`;

  if (!gameOver && objetos.length === 0) {
    nivel++;
    crearGrupo();
  }

  if (gameOver) drawGameOver();

  requestAnimationFrame(draw);
}

draw();