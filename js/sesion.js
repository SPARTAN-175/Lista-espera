import { APP } from "./config.js";

const CLAVE = "motiQueueUsuario";


export function guardarUsuario(datos) {

    APP.usuario = datos;

    sessionStorage.setItem(
        CLAVE,
        JSON.stringify(datos)
    );

}


export function obtenerUsuario() {

    if (APP.usuario) {

        return APP.usuario;

    }

    const datos = sessionStorage.getItem(CLAVE);

    if (!datos) {

        return null;

    }

    APP.usuario = JSON.parse(datos);

    return APP.usuario;

}


export function limpiarSesion() {

    APP.usuario = null;

    sessionStorage.removeItem(CLAVE);

}
