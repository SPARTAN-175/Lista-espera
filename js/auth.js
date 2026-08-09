import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { limpiarSesion } from "./sesion.js";


/*==================================
LOGIN ADMINISTRADOR
==================================*/

export async function iniciarSesion(
    correo,
    password
) {

    const credencial =
        await signInWithEmailAndPassword(
            auth,
            correo,
            password
        );


    localStorage.setItem(
        "ultimoCorreo",
        correo
    );


    return credencial.user;

}


/*==================================
LOGIN PERSONAL DE ATENCIÓN
==================================*/

export async function iniciarSesionAtencion(
    usuario,
    password
) {

    const usuarioLimpio =
        usuario
            .trim()
            .toUpperCase();


    if (!usuarioLimpio) {

        throw new Error(
            "usuario-vacio"
        );

    }


    /*
    ==================================
    BUSCAR ACCESO GLOBAL
    ==================================
    */

    const referenciaAcceso =
        doc(
            db,
            "usuariosAcceso",
            usuarioLimpio
        );


    const documentoAcceso =
        await getDoc(
            referenciaAcceso
        );


    if (!documentoAcceso.exists()) {

        throw new Error(
            "credenciales-invalidas"
        );

    }


    const acceso =
        documentoAcceso.data();


    /*
    ==================================
    VERIFICAR ESTADO
    ==================================
    */

    if (
        acceso.activo !== true
    ) {

        throw new Error(
            "usuario-inactivo"
        );

    }


    if (
        !acceso.uid ||
        !acceso.institucionId
    ) {

        throw new Error(
            "acceso-invalido"
        );

    }


    /*
    ==================================
    BUSCAR USUARIO COMPLETO
    ==================================
    */

    const referenciaUsuario =
        doc(
            db,
            "instituciones",
            acceso.institucionId,
            "usuarios",
            acceso.uid
        );


    const documentoUsuario =
        await getDoc(
            referenciaUsuario
        );


    if (!documentoUsuario.exists()) {

        throw new Error(
            "usuario-no-existe"
        );

    }


    const datosUsuario =
        documentoUsuario.data();


    /*
    ==================================
    VERIFICAR ESTADO DEL USUARIO
    ==================================
    */

    if (
        datosUsuario.activo !== true
    ) {

        throw new Error(
            "usuario-inactivo"
        );

    }


    /*
    ==================================
    VERIFICAR ROL
    ==================================
    */

    if (
        datosUsuario.rol !== "atencion"
    ) {

        throw new Error(
            "rol-invalido"
        );

    }


    /*
    ==================================
    VERIFICAR PASSWORD
    ==================================
    */

    const hashCalculado =
        await generarHashVerificacion(
            password,
            datosUsuario.passwordSalt
        );


    if (
        hashCalculado !==
        datosUsuario.passwordHash
    ) {

        throw new Error(
            "credenciales-invalidas"
        );

    }


    /*
    ==================================
    DEVOLVER USUARIO
    ==================================
    */

    return {

        uid:
            datosUsuario.uid,

        institucionId:
            acceso.institucionId,

        nombre:
            datosUsuario.nombre,

        usuario:
            datosUsuario.usuario,

        numeroUsuario:
            datosUsuario.numeroUsuario,

        rol:
            datosUsuario.rol,

        activo:
            datosUsuario.activo

    };

}


/*==================================
GENERAR HASH PARA VERIFICACIÓN
==================================*/

async function generarHashVerificacion(
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


    return Array
        .from(
            new Uint8Array(bits)
        )
        .map(
            numero =>
                numero
                    .toString(16)
                    .padStart(
                        2,
                        "0"
                    )
        )
        .join("");

}


/*==================================
RECUPERAR CONTRASEÑA ADMINISTRADOR
==================================*/

export async function recuperarPassword(
    correo
) {

    await sendPasswordResetEmail(
        auth,
        correo
    );

}

/*==================================
CERRAR SESIÓN
==================================*/

export async function cerrarSesion() {

    /*
    ==================================
    LIMPIAR NUESTRA SESIÓN
    ==================================
    */

    limpiarSesion();


    /*
    ==================================
    CERRAR FIREBASE AUTH
    SI EXISTE UNA SESIÓN
    ==================================
    */

    if (auth.currentUser) {

        await signOut(auth);

    }

}


/*==================================
OBSERVAR SESIÓN FIREBASE
==================================*/

export function observarSesion(
    callback
) {

    onAuthStateChanged(
        auth,
        (usuario) => {

            callback(
                usuario
            );

        }
    );

}
