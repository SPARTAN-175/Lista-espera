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
    doc,
    setDoc,
    writeBatch,
    serverTimestamp
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


/*==================================
MODAL CREAR USUARIO
==================================*/

const modalCrearUsuario =
    document.getElementById("modalCrearUsuario");

const btnCerrarModal =
    document.getElementById("btnCerrarModal");

const txtNombreUsuario =
    document.getElementById("txtNombreUsuario");

const mensajeUsuario =
    document.getElementById("mensajeUsuario");

const btnConfirmarCrear =
    document.getElementById("btnConfirmarCrear");


/*==================================
MODAL CREDENCIALES
==================================*/

const modalCredenciales =
    document.getElementById("modalCredenciales");

const credencialNombre =
    document.getElementById("credencialNombre");

const credencialUsuario =
    document.getElementById("credencialUsuario");

const credencialPassword =
    document.getElementById("credencialPassword");

const btnCopiarCredenciales =
    document.getElementById("btnCopiarCredenciales");

const btnCerrarCredenciales =
    document.getElementById("btnCerrarCredenciales");


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
LÍMITES PROVISIONALES
==================================*/

const LIMITE_ATENCION = 5;

const LIMITE_CAPTURISTAS = 5;


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


        limiteAtencion.textContent =
            `${LIMITE_ATENCION} permitidos`;


        limiteCapturistas.textContent =
            `${LIMITE_CAPTURISTAS} permitidos`;


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
FORMATEAR FECHA
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

                <div class="vacio">

                    <strong>
                        No hay usuarios de atención
                    </strong>

                    <p>
                        Crea el primer usuario para
                        comenzar a utilizar el sistema.
                    </p>

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
                                    escapeHTML(
                                        datos.nombre ||
                                        "Sin nombre"
                                    )
                                }
                            </strong>

                            <small>
                                ${
                                    escapeHTML(
                                        datos.usuario ||
                                        datos.correo ||
                                        "Sin usuario"
                                    )
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
                                data-uid="${documento.id}"
                            >

                                Gestionar

                            </button>

                        </div>

                    </div>

                `;

            }
        );


        /*==================================
        ACTIVAR BOTONES GESTIONAR
        ==================================*/

        const botonesGestionar =
            listaAtencion.querySelectorAll(
                ".btn-accion"
            );


        botonesGestionar.forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    () => {

                        const uid =
                            boton.dataset.uid;


                        gestionarUsuario(
                            uid
                        );

                    }
                );

            }
        );


        totalAtencion.textContent =
            activos;


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
GESTIONAR USUARIO
==================================*/

function gestionarUsuario(uid) {

    alert(
        "Usuario seleccionado:\n\n" +
        uid +
        "\n\nLa gestión avanzada la conectaremos en el siguiente paso."
    );

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

                <div class="vacio">

                    <strong>
                        No hay capturistas vinculados
                    </strong>

                    <p>
                        Los dispositivos vinculados
                        aparecerán aquí.
                    </p>

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
                                    escapeHTML(
                                        datos.dispositivoId ||
                                        documento.id
                                    )
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
ACTUALIZAR TOTALES
==================================*/

async function actualizarTotales() {

    const usuariosAtencion =
        await cargarUsuarios();


    const capturistas =
        await cargarCapturistas();


    totalActivos.textContent =
        usuariosAtencion +
        capturistas;

}


/*==================================
ABRIR MODAL CREAR
==================================*/

btnCrearAtencion.addEventListener(
    "click",
    () => {

        txtNombreUsuario.value =
            "";

        mensajeUsuario.textContent =
            "";

        mensajeUsuario.className =
            "mensaje";


        modalCrearUsuario.hidden =
            false;


        setTimeout(
            () => {

                txtNombreUsuario.focus();

            },
            100
        );

    }
);


/*==================================
CERRAR MODAL CREAR
==================================*/

btnCerrarModal.addEventListener(
    "click",
    () => {

        modalCrearUsuario.hidden =
            true;

    }
);


/*==================================
CREAR USUARIO
==================================*/

btnConfirmarCrear.addEventListener(
    "click",
    crearUsuario
);


async function obtenerSiguienteNumero() {

    const referencia =
        collection(
            db,
            "instituciones",
            institucionId,
            "usuarios"
        );

    const consulta =
        await getDocs(
            referencia
        );

    let mayor = 0;

    consulta.forEach(
        documento => {

            const datos =
                documento.data();

            const numero =
                Number(
                    datos.numeroUsuario
                ) || 0;


            if (numero > mayor) {

                mayor = numero;

            }

        }
    );

    return mayor + 1;

}

/*==================================
CREAR USUARIO
==================================*/

async function crearUsuario() {

    const nombre =
        txtNombreUsuario.value.trim();


    mensajeUsuario.textContent =
        "";


    if (!nombre) {

        mensajeUsuario.textContent =
            "Escribe el nombre del usuario.";

        mensajeUsuario.className =
            "mensaje error";

        return;

    }


    btnConfirmarCrear.disabled =
        true;

    btnConfirmarCrear.textContent =
        "Creando usuario...";


    try {

        /*
        ==================================
        VERIFICAR LÍMITE
        ==================================
        */

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


        const cantidadUsuarios =
            snapshot.size;


        if (
            cantidadUsuarios >=
            LIMITE_ATENCION
        ) {

            throw new Error(
                "limite-atencion"
            );

        }


        /*
        ==================================
        GENERAR DATOS
        ==================================
        */

        const numero =
            await obtenerSiguienteNumero();


        const usuarioGenerado =
            await generarUsuarioUnico();


        const password =
            generarPassword();


        const salt =
            generarSalt();


        const passwordHash =
            await generarHash(
                password,
                salt
            );


        /*
        ==================================
        CREAR UID INTERNO
        ==================================
        */

        const uidInterno =
            crypto.randomUUID();


        /*
        ==================================
        CREAR BATCH
        ==================================
        */

        const batch =
            writeBatch(db);


        /*
        ==================================
        DOCUMENTO DEL USUARIO
        ==================================
        */

        const referenciaUsuario =
            doc(
                db,
                "instituciones",
                institucionId,
                "usuarios",
                uidInterno
            );


        batch.set(
            referenciaUsuario,
            {

                uid:
                    uidInterno,

                nombre,

                usuario:
                    usuarioGenerado,

                numeroUsuario:
                    numero,

                passwordHash,

                passwordSalt:
                    salt,

                rol:
                    "atencion",

                activo:
                    true,

                fechaRegistro:
                    serverTimestamp(),

                creadoPor:
                    usuario.uid

            }
        );


        /*
        ==================================
        ÍNDICE GLOBAL DE ACCESO
        ==================================
        */

        const referenciaAcceso =
            doc(
                db,
                "usuariosAcceso",
                usuarioGenerado
            );


        batch.set(
            referenciaAcceso,
            {

                uid:
                    uidInterno,

                institucionId,

                usuario:
                    usuarioGenerado,

                rol:
                    "atencion",

                activo:
                    true,

                fechaCreacion:
                    serverTimestamp()

            }
        );


        /*
        ==================================
        GUARDAR TODO
        ==================================
        */

        await batch.commit();


        /*
        ==================================
        MOSTRAR CREDENCIALES
        ==================================
        */

        credencialNombre.textContent =
            nombre;


        credencialUsuario.textContent =
            usuarioGenerado;


        credencialPassword.textContent =
            password;


        modalCrearUsuario.hidden =
            true;


        modalCredenciales.hidden =
            false;


        /*
        ==================================
        RECARGAR LISTA
        ==================================
        */

        await actualizarTotales();


    } catch (error) {

        console.error(
            "Error creando usuario:",
            error
        );


        if (
            error.message ===
            "limite-atencion"
        ) {

            mensajeUsuario.textContent =
                "Has alcanzado el límite de usuarios de atención.";

        } else {

            mensajeUsuario.textContent =
                "No fue posible crear el usuario.";

        }


        mensajeUsuario.className =
            "mensaje error";


    } finally {

        btnConfirmarCrear.disabled =
            false;

        btnConfirmarCrear.textContent =
            "Crear usuario";

    }

}


/*==================================
GENERAR USUARIO ÚNICO
==================================*/

async function generarUsuarioUnico() {

    const caracteres =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


    const longitud =
        8;


    for (
        let intento = 0;
        intento < 20;
        intento++
    ) {

        const valores =
            new Uint32Array(
                longitud
            );


        crypto.getRandomValues(
            valores
        );


        let codigo =
            "";


        for (
            let i = 0;
            i < longitud;
            i++
        ) {

            codigo +=
                caracteres[
                    valores[i] %
                    caracteres.length
                ];

        }


        const usuarioGenerado =
            `ATN-${codigo}`;


        /*
        ==================================
        COMPROBAR EXISTENCIA GLOBAL
        ==================================
        */

        const referencia =
            doc(
                db,
                "usuariosAcceso",
                usuarioGenerado
            );


        const documento =
            await getDoc(
                referencia
            );


        if (
            !documento.exists()
        ) {

            return usuarioGenerado;

        }

    }


    throw new Error(
        "No fue posible generar un usuario único."
    );

}


/*==================================
GENERAR CONTRASEÑA
==================================*/

function generarPassword() {

    const caracteres =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";


    const longitud =
        12;


    const valores =
        new Uint32Array(
            longitud
        );


    crypto.getRandomValues(
        valores
    );


    let password =
        "";


    for (
        let i = 0;
        i < longitud;
        i++
    ) {

        password +=
            caracteres[
                valores[i] %
                caracteres.length
            ];

    }


    return password;

}


/*==================================
GENERAR SALT
==================================*/

function generarSalt() {

    const valores =
        new Uint8Array(
            16
        );


    crypto.getRandomValues(
        valores
    );


    return Array.from(
        valores
    )
        .map(
            numero =>
                numero
                    .toString(16)
                    .padStart(2, "0")
        )
        .join("");

}


/*==================================
GENERAR HASH
==================================*/

async function generarHash(
    password,
    salt
) {

    const encoder =
        new TextEncoder();


    const passwordBytes =
        encoder.encode(
            password
        );


    const saltBytes =
        encoder.encode(
            salt
        );


    const keyMaterial =
        await crypto.subtle.importKey(

            "raw",

            passwordBytes,

            "PBKDF2",

            false,

            [
                "deriveBits"
            ]

        );


    const bits =
        await crypto.subtle.deriveBits(

            {

                name:
                    "PBKDF2",

                salt:
                    saltBytes,

                iterations:
                    150000,

                hash:
                    "SHA-256"

            },

            keyMaterial,

            256

        );


    return Array.from(
        new Uint8Array(
            bits
        )
    )
        .map(
            numero =>
                numero
                    .toString(16)
                    .padStart(2, "0")
        )
        .join("");

}






/*==================================
HEX → BYTES
==================================*/

function hexToBytes(hex) {

    const resultado =
        new Uint8Array(
            hex.length / 2
        );


    for (
        let i = 0;
        i < resultado.length;
        i++
    ) {

        resultado[i] =
            parseInt(
                hex.substr(
                    i * 2,
                    2
                ),
                16
            );

    }


    return resultado;

}


/*==================================
BYTES → HEX
==================================*/

function bytesToHex(bytes) {

    return Array
        .from(bytes)
        .map(
            byte =>
                byte
                    .toString(16)
                    .padStart(
                        2,
                        "0"
                    )
        )
        .join("");

}


/*==================================
COPIAR CREDENCIALES
==================================*/

btnCopiarCredenciales.addEventListener(
    "click",
    async () => {

        const texto =
            `MOTI Queue\n\n` +
            `Nombre: ${
                credencialNombre.textContent
            }\n` +
            `Usuario: ${
                credencialUsuario.textContent
            }\n` +
            `Contraseña: ${
                credencialPassword.textContent
            }`;


        try {

            await navigator.clipboard.writeText(
                texto
            );


            btnCopiarCredenciales.textContent =
                "✓ Copiado";


            setTimeout(
                () => {

                    btnCopiarCredenciales.textContent =
                        "📋 Copiar credenciales";

                },
                2000
            );


        } catch (error) {

            console.error(
                "Error copiando credenciales:",
                error
            );


            alert(
                "No fue posible copiar las credenciales."
            );

        }

    }
);


/*==================================
CERRAR MODAL CREDENCIALES
==================================*/

btnCerrarCredenciales.addEventListener(
    "click",
    () => {

        modalCredenciales.hidden =
            true;


        /*
        ==================================
        BORRAR PASSWORD DE PANTALLA
        ==================================
        */

        credencialPassword.textContent =
            "---";

    }
);


/*==================================
MENSAJES
==================================*/

function mostrarMensaje(
    texto,
    tipo
) {

    mensajeUsuario.textContent =
        texto;


    mensajeUsuario.className =
        `mensaje ${tipo}`;

}


/*==================================
ESCAPAR HTML
==================================*/

function escapeHTML(
    texto
) {

    const elemento =
        document.createElement(
            "div"
        );


    elemento.textContent =
        texto;


    return elemento.innerHTML;

}


/*==================================
NAVEGACIÓN — DASHBOARD
==================================*/

btnRegresar.addEventListener(
    "click",
    () => {

        window.location.href =
            "dashboard.html";

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
INICIAR PÁGINA
==================================*/

async function iniciar() {

    try {

        await cargarInstitucion();

        await actualizarTotales();

    } catch (error) {

        console.error(
            "Error iniciando gestión de usuarios:",
            error
        );

    }

}


iniciar();


