
import { iniciarSesion } from "./auth.js";

import { observarSesion } from "./auth.js";

const txtCorreo = document.getElementById("correo");
const txtPassword = document.getElementById("password");

const btnIngresar = document.getElementById("btnIngresar");

const mensaje = document.getElementById("mensaje");

const ultimoCorreo = localStorage.getItem("ultimoCorreo");

if (ultimoCorreo) {
    txtCorreo.value = ultimoCorreo;
}

observarSesion((usuario) => {

    if (usuario) {

        window.location.href = "dashboard.html";

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

        await iniciarSesion(correo,password);

        window.location.href = "dashboard.html";

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
