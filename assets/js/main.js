const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const info = document.getElementById("info");
const gameOverScreen = document.getElementById("gameOver");
const restartBtn = document.getElementById("restartBtn");
const stats = document.getElementById("stats");

let objetos = [];
let eliminados = 0;
let nivel = 1;
let eliminando = false;
let gameOver = false;

const TAM = 50;

// 🔥 HITBOX MUCHO MÁS GRANDE
const HITBOX_EXTRA = 40;

let mouse = { x: 0, y: 0 };

// 🔹 No encimarse
function posicionValida(x, y) {
  return !objetos.some(obj => {
    let dx = x - obj.x;
    let dy = y - obj.y;
    return dx * dx + dy * dy < (TAM * TAM);
  });
}

// 🔹 Crear objetos
function crearGrupo() {
  let intentos = 0;

  while (objetos.length < 10 && intentos < 800) {
    let x = Math.random() * canvas.width;
    let y = canvas.height + Math.random() * 150;

    if (posicionValida(x, y)) {
      objetos.push({
        x,
        y,
        size: TAM,
        alpha: 1,
        eliminado: false,
        color: "white",
        velocidadX: (canvas.width / 2 - x) * 0.001
      });
    }
    intentos++;
  }
}

crearGrupo();

// 🎯 Mouse SIEMPRE actualizado
canvas.addEventListener("pointermove", e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

// 🔥 CLICK MÁS PRECISO (usa posición real del evento)
canvas.addEventListener("pointerdown", e => {

  if (eliminando || gameOver) return;

  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  let mejor = null;
  let mejorDist = Infinity;

  objetos.forEach(obj => {
    if (obj.eliminado) return;

    let dx = clickX - obj.x;
    let dy = clickY - obj.y;
    let dist2 = dx * dx + dy * dy;

    let radio = obj.size / 2 + HITBOX_EXTRA;

    if (dist2 < radio * radio && dist2 < mejorDist) {
      mejor = obj;
      mejorDist = dist2;
    }
  });

  // ✅ SE ELIMINA EN UN SOLO CLICK
  if (mejor) {
    mejor.eliminado = true;
    eliminando = true;
  }
});

// 🔄 Reiniciar
restartBtn.addEventListener("click", () => {
  objetos = [];
  eliminados = 0;
  nivel = 1;
  eliminando = false;
  gameOver = false;
  gameOverScreen.classList.remove("active");
  crearGrupo();
});

// 🎮 Loop
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let velocidad = 0.4 + nivel * 0.15;
  let hayEliminando = false;

  objetos.forEach(obj => {

    // Hover
    let dx = mouse.x - obj.x;
    let dy = mouse.y - obj.y;
    let dist2 = dx * dx + dy * dy;
    let radio = obj.size/2 + HITBOX_EXTRA;

    obj.color = (!obj.eliminado && dist2 < radio * radio) ? "red" : "white";

    if (obj.eliminado) {
      obj.alpha -= 0.03; // más rápido el fade
      hayEliminando = true;

      if (obj.alpha <= 0) {
        eliminados++;
        obj.alpha = 0;
      }

    } else {
      obj.y -= velocidad;
      obj.x += obj.velocidadX;

      if (obj.y < -50) {
        gameOver = true;

        let porcentaje = ((eliminados % 10) / 10) * 100;

        stats.innerHTML = `
          Nivel: ${nivel} <br>
          Puntos: ${eliminados} <br>
          Progreso: ${porcentaje.toFixed(0)}%
        `;

        gameOverScreen.classList.add("active");
      }
    }

    // Dibujar
    if (obj.alpha > 0) {
      ctx.globalAlpha = obj.alpha;
      ctx.fillStyle = obj.color;
      ctx.beginPath();
      ctx.arc(obj.x, obj.y, obj.size/2, 0, Math.PI*2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  });

  if (!hayEliminando) eliminando = false;

  objetos = objetos.filter(obj => obj.alpha > 0);

  let progreso = (eliminados % 10) * 10;

  info.innerHTML = `
    Eliminados: ${eliminados} <br>
    Nivel: ${nivel} <br>
    Progreso: ${progreso}%
  `;

  if (!gameOver && objetos.length === 0) {
    nivel++;
    crearGrupo();
  }

  requestAnimationFrame(draw);
}

draw();