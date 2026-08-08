/*
=========================================
Proyecto : MOTI Queue
Archivo   : instituciones.js
Función   : Gestión de la institución
=========================================
*/

import { db } from "./firebase.js";

import { obtenerUsuario } from "./sesion.js";

import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


/*==================================
ELEMENTOS
==================================*/

const txtNombre =
    document.getElementById("txtNombre");

const txtMunicipio =
    document.getElementById("txtMunicipio");

const txtDireccion =
    document.getElementById("txtDireccion");

const txtTelefono =
    document.getElementById("txtTelefono");

const btnGuardar =
    document.getElementById("btnGuardar");

const btnRegresar =
    document.getElementById("btnRegresar");

const btnQR =
    document.getElementById("btnQR");

const mensaje =
    document.getElementById("mensaje");


/*==================================
OBTENER USUARIO
==================================*/

const usuario = obtenerUsuario();


if (!usuario) {

    window.location.href =
        "login.html";

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

    mensaje.textContent =
        "No se encontró la institución asociada.";

    throw new Error(
        "institucionId no encontrado."
    );

}


/*==================================
REFERENCIA
==================================*/

const referenciaInstitucion =
    doc(
        db,
        "instituciones",
        institucionId
    );


/*==================================
CARGAR DATOS
==================================*/

async function cargarInstitucion() {

    try {

        const documento =
            await getDoc(
                referenciaInstitucion
            );


        if (!documento.exists()) {

            mensaje.textContent =
                "La institución no existe.";

            return;

        }


        const datos =
            documento.data();


        /*==============================
        MOSTRAR DATOS
        ==============================*/

        txtNombre.value =
            datos.nombre || "";

        txtMunicipio.value =
            datos.municipio || "";

        txtDireccion.value =
            datos.direccion || "";

        txtTelefono.value =
            datos.telefono || "";


        console.log(
            "Institución cargada:",
            datos
        );


    } catch (error) {

        console.error(error);

        mensaje.textContent =
            "No fue posible cargar la información.";

    }

}


/*==================================
GUARDAR CAMBIOS
==================================*/

btnGuardar.addEventListener(
    "click",
    async () => {

        mensaje.textContent = "";


        /*==============================
        VALIDAR
        ==============================*/

        const nombre =
            txtNombre.value.trim();

        const municipio =
            txtMunicipio.value.trim();

        const direccion =
            txtDireccion.value.trim();

        const telefono =
            txtTelefono.value.trim();


        if (
            nombre === "" ||
            municipio === "" ||
            direccion === ""
        ) {

            mensaje.textContent =
                "Completa los campos obligatorios.";

            return;

        }


        btnGuardar.disabled = true;

        btnGuardar.textContent =
            "Guardando...";


        try {

            await updateDoc(

                referenciaInstitucion,

                {

                    nombre,

                    municipio,

                    direccion,

                    telefono

                }

            );


            mensaje.textContent =
                "✓ Información guardada correctamente.";

            mensaje.style.color =
                "#198754";


        } catch (error) {

            console.error(error);

            mensaje.textContent =
                "No fue posible guardar los cambios.";

            mensaje.style.color =
                "#dc3545";


        } finally {

            btnGuardar.disabled = false;

            btnGuardar.textContent =
                "💾 Guardar cambios";

        }

    }
);


/*==================================
REGRESAR AL DASHBOARD
==================================*/

btnRegresar.addEventListener(
    "click",
    () => {

        window.location.href =
            "dashboard.html";

    }
);


/*==================================
GENERAR QR
==================================*/

btnQR.addEventListener(
    "click",
    () => {

        window.location.href =
            "qr-consulta.html";

    }
);


/*==================================
INICIAR
==================================*/

cargarInstitucion();
