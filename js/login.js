
import { iniciarSesion } from "./auth.js";

import { observarSesion } from "./auth.js";

import { obtenerUsuario } from "./usuarios.js";
import { guardarUsuario } from "./sesion.js";
import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { db } from "./firebase.js";

const txtCorreo = document.getElementById("correo");
const txtPassword = document.getElementById("password");

const btnIngresar = document.getElementById("btnIngresar");

const mensaje = document.getElementById("mensaje");

const btnEscanearQR = document.getElementById("btnEscanearQR");

let lectorQR = null;

const ultimoCorreo = localStorage.getItem("ultimoCorreo");

if (ultimoCorreo) {
    txtCorreo.value = ultimoCorreo;
}

observarSesion(async (firebaseUser) => {

    if (!firebaseUser) return;

    const usuario = await obtenerUsuario(firebaseUser.uid);

    guardarUsuario(usuario);

    switch (usuario.rol) {

        case "administrador":
            window.location.href = "dashboard.html";
            break;

        case "atencion":
        case "capturista":
            window.location.href = "index.html";
            break;
    }

});


btnIngresar.addEventListener("click", ingresar);


async function ingresar(){

    mensaje.textContent = "";

    const correo = txtCorreo.value.trim();

    const password = txtPassword.value;

    if(correo === "" || password === ""){

        mensaje.textContent = "Ingrese su correo y contraseña.";

        return;

    }

    btnIngresar.disabled = true;

    btnIngresar.textContent = "Ingresando...";

    try{

        const firebaseUser = await iniciarSesion(correo, password);

// Buscar información del usuario en Firestore
const usuario = await obtenerUsuario(firebaseUser.uid);

guardarUsuario(usuario);

// Redirigir según el rol
switch (usuario.rol) {

    case "administrador":
        window.location.href = "dashboard.html";
        break;

    case "atencion":
    case "capturista":
        window.location.href = "index.html";
        break;

    default:
        alert("Este usuario no tiene un rol válido.");
        break;
}
    }catch(error){

        console.error(error);

        switch(error.code){

            case "auth/invalid-credential":

                mensaje.textContent =
                "Correo o contraseña incorrectos.";

            break;

            case "auth/too-many-requests":

                mensaje.textContent =
                "Demasiados intentos. Intente más tarde.";

            break;

            default:

                mensaje.textContent =
                "No fue posible iniciar sesión.";

        }

    }

    btnIngresar.disabled = false;

    btnIngresar.textContent = "Iniciar sesión";

}

btnEscanearQR.addEventListener("click", abrirEscaner);

async function abrirEscaner() {

    document.getElementById("lectorQR").style.display = "block";

    lectorQR = new Html5Qrcode("lectorQR");

    try {

        await lectorQR.start(

            { facingMode: "environment" },

            {
                fps: 10,
                qrbox: 250
            },

            async (texto) => {

                await lectorQR.stop();

                document.getElementById("lectorQR").style.display = "none";

                alert("Código leído: " + texto);

            },

            () => {}

        );

    } catch (error) {

        console.error(error);

        mensaje.textContent =
            "No fue posible abrir la cámara.";

    }

}






