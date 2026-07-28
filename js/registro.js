import { auth } from "./firebase.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


export async function registrarUsuario(correo, password) {

    try {

        const credencial = await createUserWithEmailAndPassword(
            auth,
            correo,
            password
        );

        return credencial.user;

    } catch (error) {

        throw error;

    }

}
