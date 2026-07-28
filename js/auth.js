// ==================================
// AUTENTICACIÓN
// ==================================

import { auth } from "./firebase.js";

import {

    onAuthStateChanged,

    signInWithEmailAndPassword,

    signOut

} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { APP } from "./config.js";


// ==================================
// OBSERVAR SESIÓN
// ==================================

export function observarSesion(callback){

    onAuthStateChanged(auth,(usuario)=>{

        APP.usuario = usuario;

        callback(usuario);

    });

}


// ==================================
// INICIAR SESIÓN
// ==================================

export async function iniciarSesion(correo,password){

    return await signInWithEmailAndPassword(

        auth,

        correo,

        password

    );

}


// ==================================
// CERRAR SESIÓN
// ==================================

export async function cerrarSesion(){

    await signOut(auth);

}
