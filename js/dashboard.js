
import { observarSesion, cerrarSesion } from "./auth.js";

const btnSalir = document.getElementById("btnSalir");
const bienvenida = document.getElementById("bienvenida");

// Verificar sesión
observarSesion((usuario) => {

    if (!usuario) {

        window.location.href = "login.html";
        return;

    }

    bienvenida.textContent = `Bienvenido, ${usuario.email}`;

});

// Cerrar sesión
btnSalir.addEventListener("click", async () => {

    if (!confirm("¿Desea cerrar la sesión?")) return;

    try {

        await cerrarSesion();

        window.location.href = "login.html";

    } catch (error) {

        console.error(error);
        alert("No fue posible cerrar la sesión.");

    }

});
