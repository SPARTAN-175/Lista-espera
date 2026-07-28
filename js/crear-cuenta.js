import { registrarUsuario } from "./registro.js";

const btnCrear = document.getElementById("btnCrear");

const txtInstitucion = document.getElementById("txtInstitucion");
const txtAdministrador = document.getElementById("txtAdministrador");
const txtCorreo = document.getElementById("txtCorreo");
const txtPassword = document.getElementById("txtPassword");
const txtTelefono = document.getElementById("txtTelefono");

const mensaje = document.getElementById("mensaje");


btnCrear.addEventListener("click", async () => {

    mensaje.textContent = "";

    if (
        txtInstitucion.value.trim() === "" ||
        txtAdministrador.value.trim() === "" ||
        txtCorreo.value.trim() === "" ||
        txtPassword.value.trim() === ""
    ) {

        mensaje.textContent = "Completa todos los campos obligatorios.";

        return;

    }

    btnCrear.disabled = true;

    mensaje.textContent = "Creando cuenta...";

    try {

        await registrarUsuario({

            institucion: txtInstitucion.value.trim(),

            administrador: txtAdministrador.value.trim(),

            correo: txtCorreo.value.trim(),

            password: txtPassword.value,

            telefono: txtTelefono.value.trim()

        });

        mensaje.textContent = "¡Cuenta creada correctamente!";

        setTimeout(() => {

            window.location.href = "dashboard.html";

        }, 1000);

    } catch (error) {

        console.error(error);

        mensaje.textContent = error.message;

        btnCrear.disabled = false;

    }

});
