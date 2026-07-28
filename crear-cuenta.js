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

    mensaje.textContent = "Preparando el registro...";

});
