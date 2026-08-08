/*
=========================================
Proyecto : MOTI Queue
Archivo   : qr-consulta.js
Función   : Generador de QR de consulta
=========================================
*/

import { obtenerUsuario } from "./sesion.js";


/*==================================
ELEMENTOS
==================================*/

const btnRegresar =
    document.getElementById("btnRegresar");

const btnDescargar =
    document.getElementById("btnDescargar");

const btnImprimir =
    document.getElementById("btnImprimir");

const qrConsulta =
    document.getElementById("qrConsulta");


/*==================================
USUARIO
==================================*/

const usuario = obtenerUsuario();


if (!usuario) {

    alert("La sesión no está disponible.");

    window.location.href =
        "login.html";

    throw new Error(
        "Usuario no autenticado."
    );

}


const institucionId =
    usuario.institucionId;


console.log(
    "Institución:",
    institucionId
);


/*==================================
URL DE CONSULTA
==================================*/

const urlConsulta =
    `${window.location.origin}` +
    `/Lista-espera/consulta.html` +
    `?institucion=${institucionId}`;


console.log(
    "URL de consulta:",
    urlConsulta
);


/*==================================
GENERAR QR
==================================*/

new QRCode(

    qrConsulta,

    {

        text: urlConsulta,

        width: 280,

        height: 280,

        colorDark: "#176b3a",

        colorLight: "#ffffff",

        correctLevel:
            QRCode.CorrectLevel.H

    }

);


/*==================================
REGRESAR
==================================*/

btnRegresar.addEventListener(
    "click",
    () => {

        window.location.href =
            "dashboard.html";

    }
);


/*==================================
IMPRIMIR
==================================*/

btnImprimir.addEventListener(
    "click",
    () => {

        window.print();

    }
);


/*==================================
DESCARGAR
==================================*/

btnDescargar.addEventListener(
    "click",
    () => {

        alert(
            "La descarga se activará en el siguiente paso."
        );

    }
);
