import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


const nombreInstitucion =
    document.getElementById("nombreInstitucion");

const ubicacion =
    document.getElementById("ubicacion");

const telefonoInstitucion =
    document.getElementById("telefonoInstitucion");

const nombreAdministrador =
    document.getElementById("nombreAdministrador");

const correoAdministrador =
    document.getElementById("correoAdministrador");

const telefonoAdministrador =
    document.getElementById("telefonoAdministrador");

const btnEnviar =
    document.getElementById("btnEnviar");

const mensaje =
    document.getElementById("mensaje");

const tarjetaFormulario =
    document.querySelector(".tarjeta");

const tarjetaPago =
    document.getElementById("pago");

const btnWhatsApp =
    document.getElementById("btnWhatsApp");


/* =========================================
   DATOS DE PAGO
   =========================================

   AQUÍ pondremos tus datos reales después.
========================================= */

const DATOS_PAGO = {

    banco: "Configurar",

    titular: "Configurar",

    cuenta: "Configurar",

    clabe: "Configurar",

    whatsapp: ""

};


/* =========================================
   VALIDAR
========================================= */

function validarFormulario() {

    if (
        !nombreInstitucion.value.trim() ||
        !ubicacion.value.trim() ||
        !telefonoInstitucion.value.trim() ||
        !nombreAdministrador.value.trim() ||
        !correoAdministrador.value.trim() ||
        !telefonoAdministrador.value.trim()
    ) {

        mensaje.textContent =
            "Completa todos los campos.";

        return false;

    }


    return true;

}


/* =========================================
   ENVIAR SOLICITUD
========================================= */

btnEnviar.addEventListener(
    "click",
    async () => {

        mensaje.textContent = "";

        if (!validarFormulario()) {
            return;
        }


        btnEnviar.disabled = true;

        btnEnviar.textContent =
            "Enviando solicitud...";


        try {

            const solicitud = {

                nombreInstitucion:
                    nombreInstitucion.value.trim(),

                ubicacion:
                    ubicacion.value.trim(),

                telefonoInstitucion:
                    telefonoInstitucion.value.trim(),


                nombreAdministrador:
                    nombreAdministrador.value.trim(),

                correoAdministrador:
                    correoAdministrador.value.trim(),

                telefonoAdministrador:
                    telefonoAdministrador.value.trim(),


                estado:
                    "pendiente",

                pago:
                    "pendiente",

                fechaSolicitud:
                    serverTimestamp()

            };


            await addDoc(
                collection(
                    db,
                    "solicitudes"
                ),
                solicitud
            );


            /* ==============================
               MOSTRAR DATOS DE PAGO
            ============================== */

            document.getElementById(
                "pagoBanco"
            ).textContent =
                DATOS_PAGO.banco;


            document.getElementById(
                "pagoTitular"
            ).textContent =
                DATOS_PAGO.titular;


            document.getElementById(
                "pagoCuenta"
            ).textContent =
                DATOS_PAGO.cuenta;


            document.getElementById(
                "pagoClabe"
            ).textContent =
                DATOS_PAGO.clabe;


            if (DATOS_PAGO.whatsapp) {

                btnWhatsApp.onclick =
                    () => {

                        const mensajeWhatsApp =
                            encodeURIComponent(
                                "Hola, acabo de enviar una solicitud para MOTI Queue y quiero enviar mi comprobante de pago."
                            );


                        window.open(
                            `https://wa.me/${DATOS_PAGO.whatsapp}?text=${mensajeWhatsApp}`,
                            "_blank"
                        );

                    };

            }


            tarjetaFormulario
                .classList
                .add("oculto");


            tarjetaPago
                .classList
                .remove("oculto");


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });


        } catch (error) {

            console.error(
                "Error enviando solicitud:",
                error
            );


            mensaje.textContent =
                "No fue posible enviar la solicitud. Intenta nuevamente.";


            btnEnviar.disabled = false;

            btnEnviar.textContent =
                "Enviar solicitud";

        }

    }
);
