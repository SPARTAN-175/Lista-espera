import { APP } from "./config.js";

let usuarioActual = null;

export function guardarUsuario(datos) {

    usuarioActual = datos;

    APP.usuario = datos;

}

export function obtenerUsuario() {

    return usuarioActual;

}

export function limpiarSesion() {

    usuarioActual = null;

    APP.usuario = null;

}
