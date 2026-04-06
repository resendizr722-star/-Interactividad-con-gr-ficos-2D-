const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let objetos = [];
let mouse = { x: 0, y: 0 };
let eliminados = 0;
let total = 0;
let nivel = 1;

// Crear objetos
function crearObjetos() {
    for (let i = 0; i < 10; i++) {
        objetos.push({
            x: Math.random() * canvas.width,
            y: canvas.height + Math.random() * 200,
            radio: 20,
            color: "blue",
            velocidadY: 1 + (nivel * 0.5),
            velocidadX: (Math.random() - 0.5) * 2,
            opacidad: 1,
            eliminado: false
        });
        total++;
    }
}

// Mouse movimiento
canvas.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// Click
canvas.addEventListener("click", () => {
    objetos.forEach(obj => {
        let dx = mouse.x - obj.x;
        let dy = mouse.y - obj.y;
        let distancia = Math.sqrt(dx * dx + dy * dy);

        if (distancia < obj.radio && !obj.eliminado) {
            obj.eliminado = true;
        }
    });
});

// Animación
function animar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    objetos.forEach(obj => {

        // Movimiento
        obj.y -= obj.velocidadY;
        obj.x += obj.velocidadX;

        // Movimiento aleatorio
        obj.velocidadX += (Math.random() - 0.5) * 0.1;

        // Hover
        let dx = mouse.x - obj.x;
        let dy = mouse.y - obj.y;
        let distancia = Math.sqrt(dx * dx + dy * dy);

        obj.color = (distancia < obj.radio) ? "red" : "blue";

        // Desaparecer lentamente
        if (obj.eliminado) {
            obj.opacidad -= 0.02;
            if (obj.opacidad <= 0) {
                eliminados++;
                obj.y = canvas.height + 100;
                obj.opacidad = 1;
                obj.eliminado = false;
            }
        }

        // Dibujar
        ctx.globalAlpha = obj.opacidad;
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.radio, 0, Math.PI * 2);
        ctx.fillStyle = obj.color;
        ctx.fill();
        ctx.closePath();
        ctx.globalAlpha = 1;

        // Reinicio
        if (obj.y < -50) {
            obj.y = canvas.height + 100;
        }
    });

    // Estadísticas
    let porcentaje = ((eliminados / total) * 100).toFixed(2);

    document.getElementById("info").innerHTML = `
        Eliminados: ${eliminados} <br>
        Porcentaje: ${porcentaje}% <br>
        Nivel: ${nivel}
    `;

    // Subir nivel
    if (eliminados > 0 && eliminados % 10 === 0) {
        nivel++;
        crearObjetos();
    }

    requestAnimationFrame(animar);
}

// Inicio
crearObjetos();
animar();