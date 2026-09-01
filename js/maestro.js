import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    orderBy
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
   VERIFICAR CUENTA MAESTRA
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

            const respuesta =
                await fetchPerfilMaestro(
                    usuario.uid
                );


            if (!respuesta) {

                await signOut(auth);

                window.location.href =
                    "maestro-login.html";

                return;

            }


            nombreMaestro.textContent =
                respuesta.nombre ||
                "Administrador MOTI";


            await cargarPanel();


        } catch (error) {

            console.error(
                "Error verificando administrador:",
                error
            );

        }

    }
);


/* =========================================
   PERFIL MAESTRO
========================================= */

async function fetchPerfilMaestro(uid) {

    const {
        doc,
        getDoc
    } = await import(
        "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"
    );


    const referencia =
        doc(
            db,
            "usuarios",
            uid
        );


    const documento =
        await getDoc(referencia);


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
   CARGAR TODO EL PANEL
========================================= */

async function cargarPanel() {

    await Promise.all([

        cargarSolicitudes(),

        cargarInstituciones()

    ]);

}


/* =========================================
   CARGAR SOLICITUDES
========================================= */

async function cargarSolicitudes() {

    try {

        listaSolicitudes.innerHTML = `
            <div class="cargando">
                Cargando solicitudes...
            </div>
        `;


        let documentos;


        try {

            const consulta =
                query(
                    collection(
                        db,
                        "solicitudes"
                    ),
                    orderBy(
                        "fechaSolicitud",
                        "desc"
                    )
                );


            const resultado =
                await getDocs(
                    consulta
                );


            documentos =
                resultado.docs;


        } catch (error) {

            console.warn(
                "No se pudo ordenar solicitudes:",
                error
            );


            const resultado =
                await getDocs(
                    collection(
                        db,
                        "solicitudes"
                    )
                );


            documentos =
                resultado.docs;

        }


        const solicitudes =
            documentos.map(
                documento => ({

                    id:
                        documento.id,

                    ...documento.data()

                })
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

        console.error(
            "Error cargando solicitudes:",
            error
        );


        totalSolicitudes.textContent =
            "0";


        listaSolicitudes.innerHTML = `

            <div class="estado-vacio">

                <div class="estado-icono">
                    !
                </div>

                <strong>
                    No fue posible cargar las solicitudes
                </strong>

                <p>
                    Revisa la consola para obtener más información.
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

        `;

        return;

    }


    listaSolicitudes.innerHTML =
        solicitudes.map(
            solicitud => `

                <div class="item-lista">

                    <div class="item-info">

                        <strong>
                            ${escaparHTML(
                                solicitud.nombreInstitucion ||
                                "Institución sin nombre"
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

            `
        ).join("");


    listaSolicitudes
        .querySelectorAll(
            "[data-solicitud]"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    () => {

                        const solicitud =
                            solicitudes.find(
                                item =>
                                    item.id ===
                                    boton.dataset.solicitud
                            );


                        if (solicitud) {

                            mostrarSolicitud(
                                solicitud
                            );

                        }

                    }
                );

            }
        );

}


/* =========================================
   MOSTRAR SOLICITUD
========================================= */

function mostrarSolicitud(
    solicitud
) {

    detalleInstitucion.innerHTML = `

        <div class="detalle-fila">

            <span>
                Institución
            </span>

            <strong>
                ${escaparHTML(
                    solicitud.nombreInstitucion ||
                    "-"
                )}
            </strong>

        </div>


        <div class="detalle-fila">

            <span>
                Ubicación
            </span>

            <strong>
                ${escaparHTML(
                    solicitud.ubicacion ||
                    "-"
                )}
            </strong>

        </div>


        <div class="detalle-fila">

            <span>
                Administrador
            </span>

            <strong>
                ${escaparHTML(
                    solicitud.nombreAdministrador ||
                    "-"
                )}
            </strong>

        </div>


        <div class="detalle-fila">

            <span>
                Correo
            </span>

            <strong>
                ${escaparHTML(
                    solicitud.correoAdministrador ||
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
                    solicitud.telefonoAdministrador ||
                    "-"
                )}
            </strong>

        </div>


        <div class="detalle-fila">

            <span>
                Pago
            </span>

            <strong>
                ${escaparHTML(
                    solicitud.pago ||
                    "pendiente"
                )}
            </strong>

        </div>

    `;


    btnSuspender.classList.add(
        "oculto"
    );

    btnReactivar.classList.add(
        "oculto"
    );


    modalGestion.classList.remove(
        "oculto"
    );

}


/* =========================================
   CARGAR INSTITUCIONES
========================================= */

async function cargarInstituciones() {

    try {

        listaInstituciones.innerHTML = `
            <div class="cargando">
                Cargando instituciones...
            </div>
        `;


        const resultado =
            await getDocs(
                collection(
                    db,
                    "instituciones"
                )
            );


        institucionesActuales =
            resultado.docs.map(
                documento => ({

                    id:
                        documento.id,

                    ...documento.data()

                })
            );


        totalInstituciones.textContent =
            institucionesActuales.length;


        const activas =
            institucionesActuales.filter(
                institucion =>
                    institucion.activa === true ||
                    institucion.activo === true
            );


        const suspendidas =
            institucionesActuales.filter(
                institucion =>
                    institucion.activa === false ||
                    institucion.activo === false
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
            "Error cargando instituciones:",
            error
        );


        totalInstituciones.textContent =
            "0";

        totalActivas.textContent =
            "0";

        totalSuspendidas.textContent =
            "0";


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
                    institucion.activa === true ||
                    institucion.activo === true;


                return `

                    <div class="item-lista">

                        <div class="item-info">

                            <strong>
                                ${escaparHTML(
                                    institucion.nombre ||
                                    institucion.nombreInstitucion ||
                                    "Institución"
                                )}
                            </strong>

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


                        if (institucion) {

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
   GESTIONAR INSTITUCIÓN
========================================= */

function abrirGestion(
    institucion
) {

    institucionSeleccionada =
        institucion;


    const activa =
        institucion.activa === true ||
        institucion.activo === true;


    detalleInstitucion.innerHTML = `

        <div class="detalle-fila">

            <span>
                Institución
            </span>

            <strong>
                ${escaparHTML(
                    institucion.nombre ||
                    institucion.nombreInstitucion ||
                    "-"
                )}
            </strong>

        </div>


        <div class="detalle-fila">

            <span>
                ID
            </span>

            <strong>
                ${escaparHTML(
                    institucion.id
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


        <div class="detalle-fila">

            <span>
                Ubicación
            </span>

            <strong>
                ${escaparHTML(
                    institucion.ubicacion ||
                    "-"
                )}
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
    (evento) => {

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

        } finally {

            btnActualizar.disabled =
                false;

            btnActualizar.textContent =
                "↻ Actualizar";

        }

    }
);


/* =========================================
   VER SOLICITUDES
========================================= */

btnVerSolicitudes.addEventListener(
    "click",
    () => {

        document
            .getElementById(
                "listaSolicitudes"
            )
            .scrollIntoView({
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

        if (
            !confirm(
                "¿Deseas cerrar la sesión del panel maestro?"
            )
        ) {

            return;

        }


        try {

            await signOut(auth);

            sessionStorage.removeItem(
                "motiQueueSuperAdmin"
            );

            window.location.href =
                "maestro-login.html";


