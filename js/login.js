
import { iniciarSesion } from "./auth.js";

import { observarSesion } from "./auth.js";

import { obtenerUsuario } from "./usuarios.js";
import { guardarUsuario } from "./sesion.js";

const txtCorreo = document.getElementById("correo");
const txtPassword = document.getElementById("password");

const btnIngresar = document.getElementById("btnIngresar");

const mensaje = document.getElementById("mensaje");

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
