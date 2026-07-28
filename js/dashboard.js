
import { observarSesion, cerrarSesion } from "./auth.js";

import { obtenerUsuario } from "./sesion.js";

const btnSalir = document.getElementById("btnSalir");
const bienvenida = document.getElementById("bienvenida");

// Verificar sesión
observarSesion((usuario) => {

    if (!usuario) {

        window.location.href = "login.html";
        return;

    }

    const datos = obtenerUsuario();

if (datos) {

    bienvenida.textContent = `Bienvenido, ${datos.nombre}`;

} else {

    bienvenida.textContent = "Bienvenido";

}

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
