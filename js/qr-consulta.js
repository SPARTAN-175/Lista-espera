/*
=========================================
Proyecto : MOTI Queue
Archivo   : qr-consulta.js
Función   : Generador de QR de consulta
=========================================
*/

import { db } from "./firebase.js";

import { obtenerUsuario } from "./sesion.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


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

const nombreInstitucion =
    document.getElementById("nombreInstitucion");

const ubicacionInstitucion =
    document.getElementById("ubicacionInstitucion");

const logoInstitucion =
    document.getElementById("logoInstitucion");


/*==================================
VERIFICAR SESIÓN
==================================*/

const usuario = obtenerUsuario();

if (!usuario) {

    alert("La sesión no está disponible.");

    window.location.href = "login.html";

    throw new Error(
        "Usuario no autenticado."
    );

}


/*==================================
OBTENER INSTITUCIÓN
==================================*/

const institucionId =
    usuario.institucionId;

if (!institucionId) {

    alert(
        "El usuario no tiene una institución vinculada."
    );

    throw new Error(
        "institucionId no encontrado."
    );

}

console.log(
    "Institución:",
    institucionId
);


/*==================================
CARGAR INFORMACIÓN
==================================*/

async function cargarInstitucion() {

    try {

        const referencia = doc(
            db,
            "instituciones",
            institucionId
        );

        const documento =
            await getDoc(referencia);

        if (!documento.exists()) {

            throw new Error(
                "La institución no existe."
            );

        }

        const institucion =
            documento.data();

        console.log(
            "Datos de institución:",
            institucion
        );


        /*==============================
        NOMBRE
        ==============================*/

        nombreInstitucion.textContent =
            institucion.nombre ||
            "Institución";


        /*==============================
        INFORMACIÓN SECUNDARIA
        ==============================*/

        ubicacionInstitucion.textContent =
            "Sistema de Lista de Espera";


        /*==============================
        GENERAR QR
        ==============================*/

        generarQR();


    } catch (error) {

        console.error(
            "Error cargando institución:",
            error
        );

        nombreInstitucion.textContent =
            "Institución no disponible";

        ubicacionInstitucion.textContent =
            "No fue posible cargar la información.";

    }

}


/*==================================
GENERAR URL
==================================*/

function obtenerURLConsulta() {

    const url =
        new URL(
            "consulta.html",
            window.location.href
        );

    url.searchParams.set(
        "institucion",
        institucionId
    );

    return url.href;

}


/*==================================
GENERAR QR
==================================*/

function generarQR() {

    const urlConsulta =
        obtenerURLConsulta();

    console.log(
        "URL de consulta:",
        urlConsulta
    );


    qrConsulta.innerHTML = "";


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

}


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


/*==================================*
*DESCARGAR PDF*
==================================*/

btnDescargar.addEventListener(
    "click",
    async () => {

        try {

            btnDescargar.disabled = true;

            btnDescargar.innerHTML =
                "Generando PDF...";


            const elemento =
                document.getElementById("cartelQR");


            const canvas =
                await html2canvas(
                    elemento,
                    {
                        scale: 2,
                        useCORS: true,
                        backgroundColor: "#ffffff"
                    }
                );


            const imagen =
                canvas.toDataURL(
                    "image/png"
                );


            const {
                jsPDF
            } = window.jspdf;


            const pdf =
                new jsPDF({
                    orientation: "portrait",
                    unit: "mm",
                    format: "a4"
                });


            const anchoPagina = 210;

            const margen = 10;

            const ancho =
                anchoPagina -
                (margen * 2);


            const proporcion =
                canvas.height /
                canvas.width;


            const alto =
                ancho *
                proporcion;


            pdf.addImage(
                imagen,
                "PNG",
                margen,
                margen,
                ancho,
                alto
            );


            const nombre =
                nombreInstitucion.textContent
                    .trim()
                    .replace(
                        /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g,
                        ""
                    )
                    .replace(
                        /\s+/g,
                        "-"
                    );


            pdf.save(
                `MOTI-Queue-QR-${nombre}.pdf`
            );


        } catch (error) {

            console.error(
                "Error generando PDF:",
                error
            );


            alert(
                "No fue posible generar el PDF."
            );


        } finally {

            btnDescargar.disabled = false;

            btnDescargar.innerHTML =
                "<span>↓</span> Descargar";

        }

    }
);


/*==================================
INICIAR
==================================*/

cargarInstitucion();
