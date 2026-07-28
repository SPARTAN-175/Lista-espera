import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


export async function registrarUsuario(datos){

    const credencial = await createUserWithEmailAndPassword(
        auth,
        datos.correo,
        datos.password
    );

    const uid = credencial.user.uid;

    const institucionId = crypto.randomUUID();

    await setDoc(
        doc(db,"instituciones",institucionId),
        {

            nombre: datos.institucion,
            fechaRegistro: serverTimestamp(),
            activa: true

        }
    );

    await setDoc(
        doc(
            db,
            "instituciones",
            institucionId,
            "usuarios",
            uid
        ),
        {

            uid,

            nombre: datos.administrador,

            correo: datos.correo,

            telefono: datos.telefono,

            rol: "administrador",

            activo: true,

            fechaRegistro: serverTimestamp()

        }
    );

    return {

        uid,

        institucionId

    };

}
