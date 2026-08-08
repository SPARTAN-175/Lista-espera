/*
=========================================
Proyecto : MOTI Queue
Archivo   : historial.js
Función   : Consulta del historial de turnos
=========================================
*/

import { db } from "./firebase.js";

import { obtenerUsuario } from "./sesion.js";

import {
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


/*==================================
ELEMENTOS
==================================*/

const fechaConsulta =
    document.getElementById("fechaConsulta");

const listaHistorial =
    document.getElementById("listaHistorial");

const total =
    document.getElementById("total");

const atendidos =
    document.getElementById("atendidos");

const incompletos =
    document.getElementById("incompletos");

const pendientes =
    document.getElementById("pendientes");

const estadoCarga =
    document.getElementById("estadoCarga");

const btnRegresar =
    document.getElementById("btnRegresar");


/*==================================
USUARIO
==================================*/

const usuario =
    obtenerUsuario();


if (!usuario) {

    window.location.href =
        "login.html";

    throw new Error(
        "Usuario no autenticado."
    );

}


const institucionId =
    usuario.institucionId;


if (!institucionId) {

    estadoCarga.textContent =
        "Institución no encontrada.";

    throw new Error(
        "institucionId no encontrado."
    );

}


/*==================================
FECHA ACTUAL
==================================*/

function obtenerFechaActual() {

    const hoy =
        new Date();

    const anio =
        hoy.getFullYear();

    const mes =
        String(
            hoy.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            hoy.getDate()
        ).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;

}


/*==================================
ESTABLECER FECHA INICIAL
==================================*/

fechaConsulta.value =
    obtenerFechaActual();


/*==================================
CARGAR HISTORIAL
==================================*/

async function cargarHistorial() {

    const fecha =
        fechaConsulta.value;


    if (!fecha) {

        return;

    }


    estadoCarga.textContent =
        "Cargando...";


    listaHistorial.innerHTML = "";


    /*==============================
    REFERENCIA
    ==============================*/

    const referencia =
        collection(

            db,

            "instituciones",

            institucionId,

            "listas",

            fecha,

            "personas"

        );


    try {

        /*==============================
        CONSULTA
        ==============================*/

        const consulta =
            query(
                referencia,
                orderBy("turno")
            );


        const snapshot =
            await getDocs(
                consulta
            );


        /*==============================
        CONTADORES
        ==============================*/

        let contadorTotal = 0;

        let contadorAtendidos = 0;

        let contadorIncompletos = 0;

        let contadorPendientes = 0;


        const personas = [];


        /*==============================
        LEER DOCUMENTOS
        ==============================*/

        snapshot.forEach(
            documento => {

                const persona = {

                    id:
                        documento.id,

                    ...documento.data()

                };


                personas.push(
                    persona
                );


                contadorTotal++;


                switch (
                    persona.estado
                ) {

                    case "atendido":

                        contadorAtendidos++;

                        break;


                    case "incompleto":

                        contadorIncompletos++;

                        break;


                    case "pendiente":

                        contadorPendientes++;

                        break;

                }

            }
        );


        /*==============================
        ACTUALIZAR ESTADÍSTICAS
        ==============================*/

        total.textContent =
            contadorTotal;

        atendidos.textContent =
            contadorAtendidos;

        incompletos.textContent =
            contadorIncompletos;

        pendientes.textContent =
            contadorPendientes;


        /*==============================
        MOSTRAR LISTA
        ==============================*/

        if (
            personas.length === 0
        ) {

            listaHistorial.innerHTML = `

                <div class="sin-datos">

                    No hay registros
                    para esta fecha.

                </div>

            `;

            estadoCarga.textContent =
                "Sin registros";

            return;

        }


        personas.forEach(
            persona => {

                let claseEstado =
                    "estado-pendiente";

                let textoEstado =
                    "Pendiente";


                if (
                    persona.estado ===
                    "atendido"
                ) {

                    claseEstado =
                        "estado-atendido";

                    textoEstado =
                        "Atendido";

                }


                if (
                    persona.estado ===
                    "incompleto"
                ) {

                    claseEstado =
                        "estado-incompleto";

                    textoEstado =
                        "Incompleto";

                }


                listaHistorial.innerHTML += `

                    <div class="historial-row">

                        <span class="historial-turno">

                            T${String(
                                persona.turno
                            ).padStart(3,"0")}

                        </span>


                        <span class="historial-nombre">

                            ${persona.nombre || ""}

                        </span>


                        <span class="historial-hora">

                            ${persona.hora || "--:--"}

                        </span>


                        <span
                            class="
                                historial-estado
                                ${claseEstado}
                            "
                        >

                            ${textoEstado}

                        </span>

                    </div>

                `;

            }
        );


        estadoCarga.textContent =
            `${personas.length} registros`;


    } catch (error) {

        console.error(
            "Error cargando historial:",
            error
        );


        listaHistorial.innerHTML = `

            <div class="sin-datos">

                No fue posible cargar
                el historial.

            </div>

        `;


        estadoCarga.textContent =
            "Error al cargar";

    }

}


/*==================================
CAMBIAR FECHA
==================================*/

fechaConsulta.addEventListener(
    "change",
    cargarHistorial
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
INICIAR
==================================*/

cargarHistorial();
