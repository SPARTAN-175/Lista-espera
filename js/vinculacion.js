import { db } from "./firebase.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { obtenerUsuario } from "./sesion.js";

const btnGenerar = document.getElementById("btnGenerar");
const codigo = document.getElementById("codigo");
const contenedorQR = document.getElementById("qrcode");


function generarCodigo() {

    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let codigo = "";

    for (let i = 0; i < 10; i++) {

        codigo += caracteres.charAt(
            Math.floor(Math.random() * caracteres.length)
        );

    }

    return "MQ:" + codigo;

}
btnGenerar.addEventListener("click", () => {

    const nuevoCodigo = generarCodigo();

    codigo.textContent = nuevoCodigo;

    contenedorQR.innerHTML = "";

    new QRCode(contenedorQR, {
        text: nuevoCodigo,
        width: 250,
        height: 250
    });

});
