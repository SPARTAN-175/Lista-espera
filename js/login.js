import {
    iniciarSesion,
    iniciarSesionAtencion,
    observarSesion
} from "./auth.js";

import { obtenerUsuario } from "./usuarios.js";
import { guardarUsuario } from "./sesion.js";

import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { db } from "./firebase.js";

import {
    guardarDispositivo
} from "./dispositivo.js";


/*==================================
ELEMENTOS
==================================*/

const txtCorreo =
    document.getElementById("correo");

const txtPassword =
    document.getElementById("password");

const btnIngresar =
    document.getElementById("btnIngresar");

const mensaje =
    document.getElementById("mensaje");

const btnEscanearQR =
    document.getElementById("btnEscanearQR");


let lectorQR = null;


/*==================================
ID DEL DISPOSITIVO
==================================*/

const CLAVE_DISPOSITIVO =
    "motiQueueDispositivo";


function obtenerIdDispositivo() {

    let id =
        localStorage.getItem(
            CLAVE_DISPOSITIVO
        );


    if (!id) {

        id =
            crypto.randomUUID();

        localStorage.setItem(
            CLAVE_DISPOSITIVO,
            id
        );

    }


    return id;

}


/*==================================
ÚLTIMO CORREO ADMINISTRADOR
==================================*/

const ultimoCorreo =
    localStorage.getItem(
        "ultimoCorreo"
    );


if (ultimoCorreo) {

    txtCorreo.value =
        ultimoCorreo;

}


/*==================================
OBSERVAR FIREBASE AUTH
==================================*/

/*
    Esto solamente controla sesiones
    creadas mediante Firebase Authentication.

    Principalmente:
    - Administrador
*/

observarSesion(
    async (firebaseUser) => {

        if (!firebaseUser) {

            return;

        }


        try {

            const usuario =
                await obtenerUsuario(
                    firebaseUser.uid
                );


            guardarUsuario(
                usuario
            );


            redirigirSegunRol(
                usuario
            );


        } catch (error) {

            console.error(
                "Error recuperando sesión Firebase:",
                error
            );

        }

    }
);


/*==================================
BOTÓN INGRESAR
==================================*/

btnIngresar.addEventListener(
    "click",
    ingresar
);


/*==================================
INGRESAR
==================================*/

async function ingresar() {

    mensaje.textContent =
        "";


    const identificador =
        txtCorreo.value.trim();


    const password =
        txtPassword.value;


    if (
        identificador === "" ||
        password === ""
    ) {

        mensaje.textContent =
            "Ingrese su usuario y contraseña.";

        return;

    }


    btnIngresar.disabled =
        true;


    btnIngresar.textContent =
        "Ingresando...";


    try {

        /*
        ==================================
        DETECTAR TIPO DE ACCESO
        ==================================
        */

        const esUsuarioAtencion =
            /^ATN-[A-Z0-9]{8}$/i.test(
                identificador
            );


        /*==================================
        ATENCIÓN
        ==================================*/

        if (esUsuarioAtencion) {

            const usuario =
                await iniciarSesionAtencion(
                    identificador,
                    password
                );


            /*
            Guardar sesión propia
            */

            guardarUsuario(
                usuario
            );


            /*
            Ir al sistema de turnos
            */

            window.location.href =
                "index.html";


            return;

        }


        /*==================================
        ADMINISTRADOR
        ==================================*/

        const firebaseUser =
            await iniciarSesion(
                identificador,
                password
            );


        /*
        Buscar información adicional
        del administrador
        */

        const usuario =
            await obtenerUsuario(
                firebaseUser.uid
            );


        guardarUsuario(
            usuario
        );


        redirigirSegunRol(
            usuario
        );


    } catch (error) {

        console.error(
            "Error iniciando sesión:",
            error
        );


        mostrarErrorLogin(
            error
        );

    } finally {

        btnIngresar.disabled =
            false;


        btnIngresar.textContent =
            "Iniciar sesión";

    }

}


/*==================================
REDIRECCIÓN SEGÚN ROL
==================================*/

function redirigirSegunRol(
    usuario
) {

    if (!usuario) {

        mensaje.textContent =
            "No fue posible identificar al usuario.";

        return;

    }


    switch (
        usuario.rol
    ) {

        case "administrador":

            window.location.href =
                "dashboard.html";

            break;


        case "atencion":

            window.location.href =
                "index.html";

            break;


        case "capturista":

            window.location.href =
                "index.html";

            break;


        default:

            mensaje.textContent =
                "Este usuario no tiene un rol válido.";

            break;

    }

}


/*==================================
MENSAJES DE ERROR
==================================*/

function mostrarErrorLogin(
    error
) {

    /*
    ==================================
    LOGIN ATENCIÓN
    ==================================
    */

    switch (
        error.message
    ) {

        case "credenciales-invalidas":

            mensaje.textContent =
                "Usuario o contraseña incorrectos.";

            return;


        case "usuario-inactivo":

            mensaje.textContent =
                "Este usuario se encuentra desactivado.";

            return;


        case "usuario-no-existe":

            mensaje.textContent =
                "La cuenta de usuario no existe.";

            return;


        case "rol-invalido":

            mensaje.textContent =
                "Esta cuenta no tiene permisos de atención.";

            return;


        case "acceso-invalido":

            mensaje.textContent =
                "La cuenta de acceso no está configurada correctamente.";

            return;

    }


    /*
    ==================================
    LOGIN FIREBASE
    ==================================
    */

    switch (
        error.code
    ) {

        case "auth/invalid-credential":

        case "auth/wrong-password":

        case "auth/user-not-found":

            mensaje.textContent =
                "Correo o contraseña incorrectos.";

            break;


        case "auth/too-many-requests":

            mensaje.textContent =
                "Demasiados intentos. Intente más tarde.";

            break;


        case "auth/invalid-email":

            mensaje.textContent =
                "El correo electrónico no es válido.";

            break;


        default:

            mensaje.textContent =
                "No fue posible iniciar sesión.";

            break;

    }

}


/*==================================
ESCANEAR QR
==================================*/

btnEscanearQR.addEventListener(
    "click",
    abrirEscaner
);


/*==================================
ABRIR ESCÁNER
==================================*/

async function abrirEscaner() {

    const lector =
        document.getElementById(
            "lectorQR"
        );


    lector.style.display =
        "block";


    mensaje.textContent =
        "";


    lectorQR =
        new Html5Qrcode(
            "lectorQR"
        );


    try {

        await lectorQR.start(

            {
                facingMode:
                    "environment"
            },

            {
                fps:
                    10,

                qrbox:
                    250

            },

            async (texto) => {

                try {

                    await lectorQR.stop();


                    lector.style.display =
                        "none";


                    const vinculacion =
                        await validarCodigoQR(
                            texto
                        );


                    if (!vinculacion) {

                        mensaje.textContent =
                            "Este código QR no es válido.";

                        return;

                    }


                    const dispositivoId =
                        obtenerIdDispositivo();


                    await registrarDispositivo(
                        vinculacion
                    );


                    guardarDispositivo({

                        dispositivoId,

                        institucionId:
                            vinculacion.institucionId,

                        nombreInstitucion:
                            vinculacion.nombreInstitucion

                    });


                    window.location.href =
                        "index.html";


                } catch (error) {

                    console.error(
                        "Error procesando QR:",
                        error
                    );


                    mensaje.textContent =
                        "No fue posible vincular este dispositivo.";

                }

            },

            () => {}

        );


    } catch (error) {

        console.error(
            "Error abriendo cámara:",
            error
        );


        lector.style.display =
            "none";


        mensaje.textContent =
            "No fue posible abrir la cámara.";

    }

}


/*==================================
VALIDAR QR
==================================*/

async function validarCodigoQR(
    codigo
) {

    const consulta =
        query(

            collection(
                db,
                "vinculaciones"
            ),

            where(
                "codigo",
                "==",
                codigo
            ),

            where(
                "activo",
                "==",
                true
            )

        );


    const resultados =
        await getDocs(
            consulta
        );


    if (
        resultados.empty
    ) {

        return null;

    }


    return resultados.docs[0].data();

}


/*==================================
REGISTRAR DISPOSITIVO
==================================*/

async function registrarDispositivo(
    vinculacion
) {

    await addDoc(

        collection(
            db,
            "dispositivos"
        ),

        {

            dispositivoId:
                obtenerIdDispositivo(),

            institucionId:
                vinculacion.institucionId,

            nombreInstitucion:
                vinculacion.nombreInstitucion,

            activo:
                true,

            fechaVinculacion:
                serverTimestamp(),

            ultimoAcceso:
                serverTimestamp()

        }

    );

}
