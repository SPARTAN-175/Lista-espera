import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


export async function iniciarSesion(correo, password) {

    const credencial = await signInWithEmailAndPassword(
        auth,
        correo,
        password
    );

    localStorage.setItem("ultimoCorreo", correo);

    return credencial.user;
}


export async function cerrarSesion() {

    await signOut(auth);

}


export function observarSesion(callback) {

    onAuthStateChanged(auth, (usuario) => {

        callback(usuario);

    });

}
