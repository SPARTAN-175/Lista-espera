import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


/* =========================================
   ELEMENTOS
========================================= */

const nombreMaestro =
    document.getElementById("nombreMaestro");

const btnSalir =
    document.getElementById("btnSalir");

const btnActualizar =
    document.getElementById("btnActualizar");

const btnVerSolicitudes =
    document.getElementById("btnVerSolicitudes");

const totalSolicitudes =
    document.getElementById("totalSolicitudes");

const totalInstituciones =
    document.getElementById("totalInstituciones");

const totalActivas =
    document.getElementById("totalActivas");

const totalSuspendidas =
    document.getElementById("totalSuspendidas");

const listaSolicitudes =
    document.getElementById("listaSolicitudes");

const listaInstituciones =
    document.getElementById("listaInstituciones");

const modalGestion =
    document.getElementById("modalGestion");

const detalleInstitucion =
    document.getElementById("detalleInstitucion");

const btnCerrarModal =
    document.getElementById("btnCerrarModal");

const btnSuspender =
    document.getElementById("btnSuspender");

const btnReactivar =
    document.getElementById("btnReactivar");


/* =========================================
   VARIABLES
========================================= */

let institucionesActuales = [];

let institucionSeleccionada = null;


/* =========================================
   VERIFICAR SESIÓN MAESTRA
========================================= */

onAuthStateChanged(
    auth,
    async (usuario) => {

        if (!usuario) {

            window.location.href =
                "maestro-login.html";

            return;
        }


        try {

            const perfil =
                await obtenerPerfilMaestro(
                    usuario.uid
                );


            if (!perfil) {

                alert(
                    "Esta cuenta no tiene permisos de administrador maestro."
                );

                await signOut(auth);

                window.location.href =
                    "maestro-login.html";

                return;
            }


            nombreMaestro.textContent =
                perfil.nombre ||
                "Administrador MOTI";


            await cargarPanel();


        } catch (error) {

            console.error(
                "Error verificando sesión maestra:",
                error
            );

        }

    }
);


/* =========================================
   OBTENER PERFIL DEL SUPERADMIN
========================================= */

async function obtenerPerfilMaestro(uid) {

    const referencia =
        doc(
            db,
            "usuarios",
            uid
        );


    const documento =
        await getDoc(
            referencia
        );


    if (!documento.exists()) {

        return null;
    }


    const datos =
        documento.data();


    if (
        datos.rol !== "superadmin" ||
        datos.activo !== true
    ) {

        return null;
    }


    return datos;
}


/* =========================================
   CARGAR PANEL
========================================= */

async function cargarPanel() {

    await cargarSolicitudes();

    await cargarInstituciones();

}


/* =========================================
   CARGAR SOLICITUDES
========================================= */

async function cargarSolicitudes() {

    try {

        listaSolicitudes.innerHTML = `
            <div class="estado-vacio">

                <div class="estado-icono">
                    ...
                </div>

                <strong>
                    Cargando solicitudes...
                </strong>

            </div>
        `;


        const referencia =
            collection(
                db,
                "solicitudes"
            );


        const resultado =
            await getDocs(
                referencia
            );


        console.log(
            "🔥 Solicitudes encontradas:",
            resultado.size
        );


        const solicitudes =
            resultado.docs.map(
                documento => {

                    return {

                        id:
                            documento.id,

                        ...documento.data()

                    };

                }
            );


        const pendientes =
            solicitudes.filter(
                solicitud =>
                    solicitud.estado ===
                    "pendiente"
            );


        totalSolicitudes.textContent =
            pendientes.length;


        mostrarSolicitudes(
            pendientes
        );


    } catch (error) {

        /*
         * Es normal que todavía no exista
         * la colección solicitudes.
         */

        console.warn(
            "No se pudieron cargar solicitudes:",
            error
        );


        totalSolicitudes.textContent =
            "0";


        listaSolicitudes.innerHTML = `

            <div class="estado-vacio">

                <div class="estado-icono">
                    ✓
                </div>

                <strong>
                    No hay solicitudes pendientes
                </strong>

                <p>
                    Las nuevas solicitudes aparecerán aquí.
                </p>

            </div>

        `;

    }

}


/* =========================================
   MOSTRAR SOLICITUDES
========================================= */

function mostrarSolicitudes(
    solicitudes
) {

    if (
        solicitudes.length === 0
    ) {

        listaSolicitudes.innerHTML = `

            <div class="estado-vacio">

                <div class="estado-icono">
                    ✓
                </div>

                <strong>
                    No hay solicitudes pendientes
                </strong>

                <p>
                    Las nuevas solicitudes aparecerán aquí.
                </p>

            </div>
function mostrarSolicitudes(solicitudes) {

    if (solicitudes.length === 0) {

        listaSolicitudes.innerHTML = `

            <div class="estado-vacio">

                <div class="estado-icono">
                    ✓
                </div>

                <strong>
                    No hay solicitudes pendientes
                </strong>

                <p>
                    Las nuevas solicitudes aparecerán aquí.
                </p>

            </div>

        `;

        return;
    }


    listaSolicitudes.innerHTML =
        solicitudes.map(solicitud => {

            return `

                <div class="item-lista">

                    <div class="item-info">

                        <strong>
                            ${escaparHTML(
                                solicitud.nombreInstitucion ||
                                "Institución"
                            )}
                        </strong>


                        <span>
                            Administrador:
                            ${escaparHTML(
                                solicitud.nombreAdministrador ||
                                "No especificado"
                            )}
                        </span>


                        <span>
                            ${escaparHTML(
                                solicitud.correoAdministrador ||
                                ""
                            )}
                        </span>

                    </div>


                    <div class="item-acciones">

                        <button
                            class="btn-gestionar"
                            type="button"
                            data-solicitud="${solicitud.id}">

                            Revisar →

                        </button>

                    </div>

                </div>

            `;

        }).join("");


    /* =====================================
       ACTIVAR BOTONES REVISAR
    ===================================== */

    listaSolicitudes
        .querySelectorAll(
            "[data-solicitud]"
        )
        .forEach(boton => {

            boton.addEventListener(
                "click",
                () => {

                    const id =
                        boton.dataset.solicitud;


                    const solicitud =
                        solicitudes.find(
                            item =>
                                item.id === id
                        );


                    if (!solicitud) {

                        alert(
                            "No fue posible encontrar la solicitud."
                        );

                        return;
                    }


                    mostrarSolicitud(
                        solicitud
                    );

                }
            );

        });

}


/* =========================================
   CARGAR INSTITUCIONES
========================================= */

async function cargarInstituciones() {

    try {

        listaInstituciones.innerHTML = `

            <div class="estado-vacio">

                <div class="estado-icono">
                    ...
                </div>

                <strong>
                    Cargando instituciones...
                </strong>

            </div>

        `;


        const referencia =
            collection(
                db,
                "instituciones"
            );


        const resultado =
            await getDocs(
                referencia
            );


        /*
         * DIAGNÓSTICO
         */

        console.log(
            "🔥 INSTITUCIONES ENCONTRADAS:",
            resultado.size
        );


        console.log(
            "🔥 DOCUMENTOS:",
            resultado.docs.map(
                documento => {

                    return {

                        id:
                            documento.id,

                        datos:
                            documento.data()

                    };

                }
            )
        );


        institucionesActuales =
            resultado.docs.map(
                documento => {

                    return {

                        id:
                            documento.id,

                        ...documento.data()

                    };

                }
            );


        totalInstituciones.textContent =
            institucionesActuales.length;


        const activas =
            institucionesActuales.filter(
                institucion =>
                    institucion.activa === true
            );


        const suspendidas =
            institucionesActuales.filter(
                institucion =>
                    institucion.activa === false
            );


        totalActivas.textContent =
            activas.length;


        totalSuspendidas.textContent =
            suspendidas.length;


        mostrarInstituciones(
            institucionesActuales
        );


    } catch (error) {

        console.error(
            "❌ Error cargando instituciones:",
            error
        );


        listaInstituciones.innerHTML = `

            <div class="estado-vacio">

                <div class="estado-icono">
                    !
                </div>

                <strong>
                    No fue posible cargar las instituciones
                </strong>

                <p>
                    Revisa la consola para obtener más información.
                </p>

            </div>

        `;

    }

}


/* =========================================
   MOSTRAR INSTITUCIONES
========================================= */

function mostrarInstituciones(
    instituciones
) {

    if (
        instituciones.length === 0
    ) {

        listaInstituciones.innerHTML = `

            <div class="estado-vacio">

                <div class="estado-icono">
                    🏢
                </div>

                <strong>
                    No hay instituciones registradas
                </strong>

                <p>
                    Las instituciones creadas aparecerán aquí.
                </p>

            </div>

        `;

        return;
    }


    listaInstituciones.innerHTML =
        instituciones.map(
            institucion => {

                const activa =
                    institucion.activa === true;


                return `

                    <div class="item-lista">

                        <div class="item-info">

                            <strong>
                                ${escaparHTML(
                                    institucion.nombre ||
                                    "Institución"
                                )}
                            </strong>


                            <span>

                                ${escaparHTML(
                                    institucion.municipio ||
                                    institucion.direccion ||
                                    ""
                                )}

                            </span>


                            <span
                                class="${
                                    activa
                                    ? "estado-activo"
                                    : "estado-suspendido"
                                }">

                                ${
                                    activa
                                    ? "Activa"
                                    : "Suspendida"
                                }

                            </span>

                        </div>


                        <div class="item-acciones">

                            <button
                                class="btn-gestionar"
                                type="button"
                                data-institucion="${institucion.id}">

                                Gestionar →

                            </button>

                        </div>

                    </div>

                `;

            }
        ).join("");


    /*
     * Activar botones Gestionar
     */

    listaInstituciones
        .querySelectorAll(
            "[data-institucion]"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    () => {

                        const institucion =
                            institucionesActuales.find(
                                item =>
                                    item.id ===
                                    boton.dataset.institucion
                            );


                        if (
                            institucion
                        ) {

                            abrirGestion(
                                institucion
                            );

                        }

                    }
                );

            }
        );

}


/* =========================================
   ABRIR GESTIÓN
========================================= */

function abrirGestion(
    institucion
) {

    institucionSeleccionada =
        institucion;


    const activa =
        institucion.activa === true;


    detalleInstitucion.innerHTML = `

        <div class="detalle-fila">

            <span>
                Institución
            </span>

            <strong>
                ${escaparHTML(
                    institucion.nombre ||
                    "-"
                )}
            </strong>

        </div>


        <div class="detalle-fila">

            <span>
                Municipio
            </span>

            <strong>
                ${escaparHTML(
                    institucion.municipio ||
                    "-"
                )}
            </strong>

        </div>


        <div class="detalle-fila">

            <span>
                Dirección
            </span>

            <strong>
                ${escaparHTML(
                    institucion.direccion ||
                    "-"
                )}
            </strong>

        </div>


        <div class="detalle-fila">

            <span>
                Teléfono
            </span>

            <strong>
                ${escaparHTML(
                    institucion.telefono ||
                    "-"
                )}
            </strong>

        </div>


        <div class="detalle-fila">

            <span>
                Estado
            </span>

            <strong>

                ${
                    activa
                    ? "🟢 Activa"
                    : "🔴 Suspendida"
                }

            </strong>

        </div>

    `;


    if (activa) {

        btnSuspender.classList.remove(
            "oculto"
        );

        btnReactivar.classList.add(
            "oculto"
        );

    } else {

        btnSuspender.classList.add(
            "oculto"
        );

        btnReactivar.classList.remove(
            "oculto"
        );

    }


    modalGestion.classList.remove(
        "oculto"
    );

}


/* =========================================
   CERRAR MODAL
========================================= */

btnCerrarModal.addEventListener(
    "click",
    cerrarModal
);


modalGestion.addEventListener(
    "click",
    evento => {

        if (
            evento.target ===
            modalGestion
        ) {

            cerrarModal();

        }

    }
);


function cerrarModal() {

    modalGestion.classList.add(
        "oculto"
    );

    institucionSeleccionada =
        null;

}


/* =========================================
   ACTUALIZAR
========================================= */

btnActualizar.addEventListener(
    "click",
    async () => {

        btnActualizar.disabled =
            true;

        btnActualizar.textContent =
            "Actualizando...";


        try {

            await cargarPanel();

        } catch (error) {

            console.error(
                "Error actualizando:",
                error
            );

        }


        btnActualizar.disabled =
            false;

        btnActualizar.textContent =
            "↻ Actualizar";

    }
);


/* =========================================
   VER SOLICITUDES
========================================= */

btnVerSolicitudes.addEventListener(
    "click",
    () => {

        listaSolicitudes.scrollIntoView({
            behavior: "smooth"
        });

    }
);


/* =========================================
   CERRAR SESIÓN
========================================= */

btnSalir.addEventListener(
    "click",
    async () => {

        const confirmar =
            confirm(
                "¿Deseas cerrar la sesión del panel maestro?"
            );


        if (!confirmar) {

            return;

        }


        try {

            await signOut(
                auth
            );


            sessionStorage.removeItem(
                "motiQueueSuperAdmin"
            );


            window.location.href =
                "maestro-login.html";


        } catch (error) {

            console.error(
                "Error cerrando sesión:",
                error
            );


            alert(
                "No fue posible cerrar la sesión."
            );

        }

    }
);


/* =========================================
   BOTÓN SUSPENDER
   TODAVÍA NO MODIFICA FIREBASE
========================================= */

btnSuspender.addEventListener(
    "click",
    () => {

        if (
            !institucionSeleccionada
        ) {

            return;

        }


        alert(
            "La función de suspensión la conectaremos en el siguiente paso."
        );

    }
);


/* =========================================
   BOTÓN REACTIVAR
   TODAVÍA NO MODIFICA FIREBASE
========================================= */

btnReactivar.addEventListener(
    "click",
    () => {

        if (
            !institucionSeleccionada
        ) {

            return;

        }


        alert(
            "La función de reactivación la conectaremos en el siguiente paso."
        );

    }
);


/* =========================================
   ESCAPAR HTML
========================================= */

function escaparHTML(
    valor
) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";
    }


    return String(valor)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

                                                    }
