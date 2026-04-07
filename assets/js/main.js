const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const info = document.getElementById("info");
const resetBtn = document.getElementById("resetBtn");

let objetos = [];
let eliminados = 0;
let nivel = 1;
let eliminando = false;

const TAM = 50;

// 🔥 MÁS PERMISIVO (puedes subirlo si quieres aún más fácil)
const HITBOX_EXTRA = 25;

let mouse = { x: 0, y: 0 };

// 🔹 Evitar encimarse
function posicionValida(x, y) {
  for (let obj of objetos) {
    let dx = x - obj.x;
    let dy = y - obj.y;
    let dist2 = dx * dx + dy * dy;

    if (dist2 < (TAM * TAM)) return false;
  }
  return true;
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
        color: "white",
        alpha: 1,
        eliminado: false,
        velocidadX: (canvas.width / 2 - x) * 0.001
      });
    }

    intentos++;
  }
}

crearGrupo();

// 🔹 Mouse
canvas.addEventListener("pointermove", e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

// 🔹 Hover
function actualizarHover() {
  objetos.forEach(obj => {
    let dx = mouse.x - obj.x;
    let dy = mouse.y - obj.y;
    let dist2 = dx * dx + dy * dy;

    let radio = obj.size/2 + HITBOX_EXTRA;

    obj.color = (!obj.eliminado && dist2 < radio * radio)
      ? "red"
      : "white";
  });
}

// 🔹 Click MÁS FÁCIL (tocar el borde ya cuenta)
canvas.addEventListener("pointerdown", () => {

  if (eliminando) return;

  let mejor = null;
  let mejorDist = Infinity;

  objetos.forEach(obj => {
    if (obj.eliminado) return;

    let dx = mouse.x - obj.x;
    let dy = mouse.y - obj.y;
    let dist2 = dx * dx + dy * dy;

    let radio = obj.size/2 + HITBOX_EXTRA;

    if (dist2 < radio * radio && dist2 < mejorDist) {
      mejor = obj;
      mejorDist = dist2;
    }
  });

  if (mejor) {
    mejor.eliminado = true;
    eliminando = true;
  }
});

// 🔹 Reiniciar
resetBtn.addEventListener("click", () => {
  objetos = [];
  eliminados = 0;
  nivel = 1;
  eliminando = false;
  crearGrupo();
});

// 🔹 Loop
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let velocidad = 0.4 + nivel * 0.15;

  let hayEliminando = false;

  actualizarHover();

  objetos.forEach(obj => {

    if (obj.eliminado) {
      obj.alpha -= 0.02;
      hayEliminando = true;

      if (obj.alpha <= 0) {
        eliminados++;
        obj.alpha = 0;
      }

    } else {
      obj.y -= velocidad;
      obj.x += obj.velocidadX;
    }

    if (obj.alpha > 0) {
      ctx.globalAlpha = obj.alpha;
      ctx.fillStyle = obj.color;
      ctx.beginPath();
      ctx.arc(obj.x, obj.y, obj.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  });

  if (!hayEliminando) {
    eliminando = false;
  }

  objetos = objetos.filter(obj => obj.alpha > 0);

  let progreso = (eliminados % 10) / 10 * 100;

  info.innerHTML = `
    Eliminados: ${eliminados} <br>
    Nivel: ${nivel} <br>
    Progreso: ${progreso.toFixed(0)}%
  `;

  if (objetos.length === 0) {
    nivel++;
    crearGrupo();
  }

  requestAnimationFrame(draw);
}

draw();