import { db } from "./firebase.js";
import { obtenerUsuario } from "./sesion.js";

const btnGenerar = document.getElementById("btnGenerar");
const codigo = document.getElementById("codigo");
const contenedorQR = document.getElementById("qrcode");

btnGenerar.addEventListener("click", () => {

    alert("Todo está listo para generar el QR.");

});
