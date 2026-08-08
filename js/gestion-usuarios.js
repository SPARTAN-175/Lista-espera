/*
=========================================
Proyecto : MOTI Queue
Archivo  : usuarios.js
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
    orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


/*==================================
ELEMENTOS
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
VERIFICAR USUARIO
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
INSTITUCIÓN
==================================*/

const institucionId =
    usuario.institucionId;


if (!institucionId) {

    document.body.innerHTML = `

        <h2 style="
            text-align:center;
            margin-top:50px;
        ">

            No se encontró la institución
            asociada a esta cuenta.

        </h2>

    `;

    throw new Error(
        "institucionId no encontrado."
    );

}


/*==================================
CARGAR INFORMACIÓN DE INSTITUCIÓN
==================================*/

async function cargarInstitucion() {

    try {

        const referencia = await import(
            "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"
        );

        const documento =
            await referencia.getDoc(

                referencia.doc(
                    db,
                    "instituciones",
                    institucionId
                )

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
CARGAR USUARIOS
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


        let activos = 0;


        listaAtencion.innerHTML =
            "";


        if (snapshot.empty) {

            listaAtencion.innerHTML = `

                <div class="cargando">

                    No hay usuarios de atención
                    registrados.

                </div>

            `;

        }


        snapshot.forEach(
            documento => {

                const datos =
                    documento.data();


                if (datos.activo === true) {

                    activos++;

                }


                const estadoClase =
                    datos.activo === true
                        ? "activo"
                        : "inactivo";


                const estadoTexto =
                    datos.activo === true
                        ? "🟢 Activo"
                        : "🔴 Inactivo";


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

                                ${
                                    datos.ultimoAcceso
                                        ? "Último acceso registrado"
                                        : "Sin acceso registrado"
                                }

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

        Después será reemplazado
        por el plan contratado.
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
                los usuarios.

            </div>

        `;


        return 0;

    }

}


/*==================================
CARGAR CAPTURISTAS
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
        ==================================

        Aquí usamos la colección
        "dispositivos".

        Si tu estructura actual
        utiliza otro nombre,
        NO la modificamos todavía.

        Primero comprobamos qué existe.
        */


        const referencia =
            collection(

                db,

                "instituciones",

                institucionId,

                "dispositivos"

            );


        const snapshot =
            await getDocs(
                referencia
            );


        let activos = 0;


        listaCapturistas.innerHTML =
            "";


        if (snapshot.empty) {

            listaCapturistas.innerHTML = `

                <div class="cargando">

                    No hay dispositivos
                    vinculados.

                </div>

            `;

        }


        snapshot.forEach(
            documento => {

                const datos =
                    documento.data();


                if (
                    datos.activo === true
                ) {

                    activos++;

                }


                const conectado =
                    datos.conectado === true;


                const estadoClase =
                    conectado
                        ? "conectado"
                        : "desconectado";


                const estadoTexto =
                    conectado
                        ? "🟢 En línea"
                        : "⚪ Desconectado";


                listaCapturistas.innerHTML += `

                    <div class="dispositivo-row">

                        <div class="dispositivo-icon">

                            📱

                        </div>


                        <div class="dispositivo-info">

                            <strong>

                                ${
                                    datos.nombre ||
                                    "Capturista"
                                }

                            </strong>

                            <small>

                                ${
                                    datos.moduloNombre ||
                                    "Módulo sin asignar"
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

                                ${
                                    datos.ultimaConexion
                                        ? "Última conexión registrada"
                                        : "Sin conexión registrada"
                                }

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


        return 0;

    }

}


/*==================================
ACTUALIZAR TOTAL DE ACCESOS
==================================*/

async function actualizarTotales() {

    const atencion =
        await cargarUsuarios();


    const capturistas =
        await cargarCapturistas();


    totalActivos.textContent =
        atencion + capturistas;

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
MODAL CREAR
==================================*/

btnCrearAtencion.addEventListener(
    "click",
    () => {

        modalCrear.classList.add(
            "show"
        );

    }
);


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
    (evento) => {

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
INICIALIZAR
==================================*/

await cargarInstitucion();

await actualizarTotales();
