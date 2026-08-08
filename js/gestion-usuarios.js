/*
=========================================
Proyecto : MOTI Queue
Archivo  : gestion-usuarios.js
Función  : Administración de usuarios
           y dispositivos de la institución
=========================================
*/

import { db } from "./firebase.js";

import { obtenerUsuario } from "./sesion.js";

import {
    collection,
    getDocs,
    query,
    where,
    getDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


/*==================================
ELEMENTOS HTML
==================================*/

const nombreInstitucion =
    document.getElementById("nombreInstitucion");

const totalAtencion =
    document.getElementById("totalAtencion");

const limiteAtencion =
    document.getElementById("limiteAtencion");

const totalCapturistas =
    document.getElementById("totalCapturistas");

const limiteCapturistas =
    document.getElementById("limiteCapturistas");

const totalActivos =
    document.getElementById("totalActivos");

const listaAtencion =
    document.getElementById("listaAtencion");

const listaCapturistas =
    document.getElementById("listaCapturistas");

const btnRegresar =
    document.getElementById("btnRegresar");

const btnCrearAtencion =
    document.getElementById("btnCrearAtencion");

const btnVincularCapturista =
    document.getElementById("btnVincularCapturista");

const modalCrear =
    document.getElementById("modalCrear");

const btnCerrarModal =
    document.getElementById("btnCerrarModal");


/*==================================
OBTENER SESIÓN
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


/*==================================
VERIFICAR INSTITUCIÓN
==================================*/

const institucionId =
    usuario.institucionId;


if (!institucionId) {

    document.body.innerHTML = `

        <div style="
            text-align:center;
            margin-top:80px;
            font-family:Arial;
        ">

            <h2>
                No se encontró la institución.
            </h2>

            <p>
                La cuenta no tiene una institución
                asociada.
            </p>

        </div>

    `;

    throw new Error(
        "institucionId no encontrado."
    );

}


/*==================================
CARGAR INSTITUCIÓN
==================================*/

async function cargarInstitucion() {

    try {

        const referencia =
            doc(
                db,
                "instituciones",
                institucionId
            );


        const documento =
            await getDoc(
                referencia
            );


        if (!documento.exists()) {

            nombreInstitucion.textContent =
                "Institución no encontrada";

            return;

        }


        const datos =
            documento.data();


        nombreInstitucion.textContent =
            datos.nombre ||
            "Institución";


    } catch (error) {

        console.error(
            "Error cargando institución:",
            error
        );


        nombreInstitucion.textContent =
            "Institución";

    }

}


/*==================================
CONVERTIR TIMESTAMP A TEXTO
==================================*/

function formatearFecha(timestamp) {

    if (!timestamp) {

        return "Sin registro";

    }


    try {

        const fecha =
            timestamp.toDate
                ? timestamp.toDate()
                : new Date(timestamp);


        return fecha.toLocaleString(
            "es-MX",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    } catch {

        return "Sin registro";

    }

}


/*==================================
CARGAR USUARIOS DE ATENCIÓN
==================================*/

async function cargarUsuarios() {

    try {

        listaAtencion.innerHTML = `

            <div class="cargando">

                Cargando usuarios...

            </div>

        `;


        const referencia =
            collection(
                db,
                "instituciones",
                institucionId,
                "usuarios"
            );


        const consulta =
            query(
                referencia,
                where(
                    "rol",
                    "==",
                    "atencion"
                )
            );


        const snapshot =
            await getDocs(
                consulta
            );


        listaAtencion.innerHTML =
            "";


        let activos = 0;


        if (snapshot.empty) {

            listaAtencion.innerHTML = `

                <div class="cargando">

                    No hay usuarios de atención
                    registrados todavía.

                </div>

            `;

        }


        snapshot.forEach(
            documento => {

                const datos =
                    documento.data();


                const activo =
                    datos.activo === true;


                if (activo) {

                    activos++;

                }


                const estadoClase =
                    activo
                        ? "activo"
                        : "inactivo";


                const estadoTexto =
                    activo
                        ? "🟢 Activo"
                        : "🔴 Inactivo";


                const ultimoAcceso =
                    datos.ultimoAcceso
                        ? formatearFecha(
                            datos.ultimoAcceso
                        )
                        : "Sin acceso registrado";


                listaAtencion.innerHTML += `

                    <div class="usuario-row">

                        <div class="usuario-icon">

                            🔐

                        </div>


                        <div class="usuario-info">

                            <strong>

                                ${
                                    datos.nombre ||
                                    "Sin nombre"
                                }

                            </strong>

                            <small>

                                ${
                                    datos.correo ||
                                    "Sin correo"
                                }

                            </small>

                        </div>


                        <div>

                            <span
                                class="
                                    estado
                                    ${estadoClase}
                                "
                            >

                                ${estadoTexto}

                            </span>

                        </div>


                        <div>

                            <small>

                                Último acceso:
                                ${ultimoAcceso}

                            </small>

                        </div>


                        <div class="acciones">

                            <button
                                class="btn-accion"
                                disabled
                            >

                                Gestionar

                            </button>

                        </div>

                    </div>

                `;

            }
        );


        totalAtencion.textContent =
            activos;


        /*
        ==================================
        LÍMITE PROVISIONAL
        ==================================

        Después será sustituido por
        el límite real del plan.
        */

        limiteAtencion.textContent =
            "5 permitidos";


        return activos;


    } catch (error) {

        console.error(
            "Error cargando usuarios:",
            error
        );


        listaAtencion.innerHTML = `

            <div class="cargando">

                No fue posible cargar
                los usuarios de atención.

            </div>

        `;


        totalAtencion.textContent =
            "0";


        return 0;

    }

}


/*==================================
CARGAR DISPOSITIVOS CAPTURISTAS
==================================*/

async function cargarCapturistas() {

    try {

        listaCapturistas.innerHTML = `

            <div class="cargando">

                Cargando dispositivos...

            </div>

        `;


        /*
        ==================================
        IMPORTANTE

        La colección REAL de dispositivos
        está en la raíz de Firestore:

        dispositivos

        NO está dentro de:

        instituciones/{id}/dispositivos
        ==================================
        */


        const referencia =
            collection(
                db,
                "dispositivos"
            );


        const consulta =
            query(
                referencia,
                where(
                    "institucionId",
                    "==",
                    institucionId
                )
            );


        const snapshot =
            await getDocs(
                consulta
            );


        listaCapturistas.innerHTML =
            "";


        let activos = 0;


        if (snapshot.empty) {

            listaCapturistas.innerHTML = `

                <div class="cargando">

                    No hay capturistas
                    vinculados todavía.

                </div>

            `;

        }


        snapshot.forEach(
            documento => {

                const datos =
                    documento.data();


                const activo =
                    datos.activo === true;


                if (activo) {

                    activos++;

                }


                /*
                ==================================
                ESTADO ACTUAL

                Por ahora usamos "activo" como
                estado del dispositivo.

                Más adelante agregaremos un
                heartbeat para saber si realmente
                está conectado en tiempo real.
                ==================================
                */


                const estadoClase =
                    activo
                        ? "activo"
                        : "inactivo";


                const estadoTexto =
                    activo
                        ? "🟢 Activo"
                        : "🔴 Revocado";


                const ultimaConexion =
                    datos.ultimoAcceso
                        ? formatearFecha(
                            datos.ultimoAcceso
                        )
                        : "Sin registro";


                listaCapturistas.innerHTML += `

                    <div class="dispositivo-row">

                        <div class="dispositivo-icon">

                            📱

                        </div>


                        <div class="dispositivo-info">

                            <strong>

                                Capturista

                            </strong>

                            <small>

                                Dispositivo:
                                ${
                                    datos.dispositivoId
                                    || documento.id
                                }

                            </small>

                        </div>


                        <div>

                            <span
                                class="
                                    estado
                                    ${estadoClase}
                                "
                            >

                                ${estadoTexto}

                            </span>

                        </div>


                        <div>

                            <small>

                                Última conexión:
                                ${ultimaConexion}

                            </small>

                        </div>


                        <div class="acciones">

                            <button
                                class="btn-accion"
                                disabled
                            >

                                Gestionar

                            </button>

                        </div>

                    </div>

                `;

            }
        );


        totalCapturistas.textContent =
            activos;


        limiteCapturistas.textContent =
            "5 permitidos";


        return activos;


    } catch (error) {

        console.error(
            "Error cargando dispositivos:",
            error
        );


        listaCapturistas.innerHTML = `

            <div class="cargando">

                No fue posible cargar
                los dispositivos.

            </div>

        `;


        totalCapturistas.textContent =
            "0";


        return 0;

    }

}


/*==================================
ACTUALIZAR RESUMEN
==================================*/

async function actualizarTotales() {

    const usuariosAtencion =
        await cargarUsuarios();


    const capturistas =
        await cargarCapturistas();


    /*
    ==================================
    IMPORTANTE

    Por ahora "activos" significa:

    Atención:
    activo === true

    Capturista:
    activo === true

    Todavía NO significa "en línea".

    Eso lo implementaremos después
    con heartbeat.
    ==================================
    */


    totalActivos.textContent =
        usuariosAtencion +
        capturistas;

}


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
ABRIR MODAL CREAR USUARIO
==================================*/

btnCrearAtencion.addEventListener(
    "click",
    () => {

        modalCrear.classList.add(
            "show"
        );

    }
);


/*==================================
CERRAR MODAL
==================================*/

btnCerrarModal.addEventListener(
    "click",
    () => {

        modalCrear.classList.remove(
            "show"
        );

    }
);


modalCrear.addEventListener(
    "click",
    evento => {

        if (
            evento.target ===
            modalCrear
        ) {

            modalCrear.classList.remove(
                "show"
            );

        }

    }
);


/*==================================
VINCULAR CAPTURISTA
==================================*/

btnVincularCapturista.addEventListener(
    "click",
    () => {

        window.location.href =
            "vinculacion.html";

    }
);


/*==================================
INICIAR
==================================*/

async function iniciar() {

    await cargarInstitucion();

    await actualizarTotales();

}


iniciar();
