
import { observarSesion, cerrarSesion } from "./auth.js";

import { obtenerUsuario } from "./sesion.js";

const btnSalir = document.getElementById("btnSalir");
const bienvenida = document.getElementById("bienvenida");
const btnVinculacion = document.getElementById("btnVinculacion");
const btnInstituciones = document.getElementById("btnInstituciones");
const btnHistorial = document.getElementById("btnHistorial");
const btnUsuarios =  document.getElementById("btnUsuarios");
const btnQRConsulta = document.getElementById("btnQRConsulta");
const modalQRConsulta = document.getElementById("modalQRConsulta");
const btnCerrarQR = document.getElementById("btnCerrarQR");

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



// Abrir pantalla de vinculación
btnVinculacion.addEventListener("click", () => {

    window.location.href = "vinculacion.html";

});

// Abrir gestión de institución
btnInstituciones.addEventListener("click", () => {

    window.location.href =
        "instituciones.html";

});

// Abrir historial
btnHistorial.addEventListener("click", () => {

    window.location.href =
        "historial.html";

});

// Abrir administración de usuarios
btnUsuarios.addEventListener("click", () => {

    window.location.href = "usuarios.html";

});


// Abrir generador de QR
btnQRConsulta.addEventListener("click", () => {

    window.location.href =
        "qr-consulta.html";

});





