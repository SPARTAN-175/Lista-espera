import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


/* =========================================
   ELEMENTOS
========================================= */

const txtCorreo =
    document.getElementById("correo");

const txtPassword =
    document.getElementById("password");

const btnIngresar =
    document.getElementById("btnIngresar");

const btnMostrarPassword =
    document.getElementById("btnMostrarPassword");

const mensaje =
    document.getElementById("mensaje");


/* =========================================
   MOSTRAR / OCULTAR CONTRASEÑA
========================================= */

btnMostrarPassword.addEventListener(
    "click",
    () => {

        const visible =
            txtPassword.type === "text";


        if (visible) {

            txtPassword.type = "password";

            btnMostrarPassword.textContent =
                "👁";

            btnMostrarPassword.setAttribute(
                "aria-label",
                "Mostrar contraseña"
            );

        } else {

            txtPassword.type = "text";

            btnMostrarPassword.textContent =
                "🙈";

            btnMostrarPassword.setAttribute(
                "aria-label",
                "Ocultar contraseña"
            );

        }

    }
);


/* =========================================
   INGRESAR CON ENTER
========================================= */

txtCorreo.addEventListener(
    "keydown",
    (evento) => {

        if (evento.key === "Enter") {

            ingresar();

        }

    }
);


txtPassword.addEventListener(
    "keydown",
    (evento) => {

        if (evento.key === "Enter") {

            ingresar();

        }

    }
);


/* =========================================
   BOTÓN INGRESAR
========================================= */

btnIngresar.addEventListener(
    "click",
    ingresar
);


/* =========================================
   FUNCIÓN DE LOGIN
========================================= */

async function ingresar() {

    mensaje.textContent = "";


    const correo =
        txtCorreo.value.trim();

    const password =
        txtPassword.value;


    /* =====================================
       VALIDACIÓN
    ===================================== */

    if (
        correo === "" ||
        password === ""
    ) {

        mensaje.textContent =
            "Ingresa tu correo y contraseña.";

        return;

    }


    /* =====================================
       BLOQUEAR BOTÓN
    ===================================== */

    btnIngresar.disabled = true;

    btnIngresar.textContent =
        "Verificando acceso...";


    try {


        /* =================================
           FIREBASE AUTHENTICATION
        ================================= */

        const credencial =
            await signInWithEmailAndPassword(
                auth,
                correo,
                password
            );


        const firebaseUser =
            credencial.user;


        console.log(
            "Usuario autenticado:",
            firebaseUser.uid
        );


        /* =================================
           BUSCAR PERFIL EN FIRESTORE
        ================================= */

        const referencia =
            doc(
                db,
                "usuarios",
                firebaseUser.uid
            );


        const documento =
            await getDoc(referencia);


        /* =================================
           EL PERFIL NO EXISTE
        ================================= */

        if (!documento.exists()) {

            mensaje.textContent =
                "Esta cuenta no tiene autorización para acceder al panel maestro.";

            await auth.signOut();

            return;

        }


        const datos =
            documento.data();


        console.log(
            "Perfil maestro:",
            datos
        );


        /* =================================
           COMPROBAR ROL
        ================================= */

        if (
            datos.rol !== "superadmin"
        ) {

            mensaje.textContent =
                "No tienes permisos para acceder al panel maestro.";

            await auth.signOut();

            return;

        }


        /* =================================
           COMPROBAR ESTADO
        ================================= */

        if (
            datos.activo !== true
        ) {

            mensaje.textContent =
                "Esta cuenta de administración está desactivada.";

            await auth.signOut();

            return;

        }


        /* =================================
           GUARDAR SESIÓN MAESTRA
        ================================= */

        sessionStorage.setItem(
            "motiQueueSuperAdmin",
            JSON.stringify({

                uid:
                    firebaseUser.uid,

                nombre:
                    datos.nombre ||
                    "Administrador MOTI",

                rol:
                    datos.rol,

                activo:
                    datos.activo

            })
        );


        /* =================================
           ENTRAR AL PANEL
        ================================= */

        window.location.href =
            "maestro.html";


    } catch (error) {

        console.error(
            "Error de acceso maestro:",
            error
        );


        /* =================================
           ERRORES FIREBASE
        ================================= */

        switch (error.code) {


            case "auth/invalid-credential":

                mensaje.textContent =
                    "Correo o contraseña incorrectos.";

                break;


            case "auth/invalid-email":

                mensaje.textContent =
                    "El correo electrónico no es válido.";

                break;


            case "auth/too-many-requests":

                mensaje.textContent =
                    "Demasiados intentos. Intenta nuevamente más tarde.";

                break;


            case "auth/user-disabled":

                mensaje.textContent =
                    "Esta cuenta está desactivada.";

                break;


            default:

                mensaje.textContent =
                    "No fue posible iniciar sesión.";

                break;

        }


    } finally {

        btnIngresar.disabled = false;

        btnIngresar.textContent =
            "Iniciar sesión";

    }

          }
