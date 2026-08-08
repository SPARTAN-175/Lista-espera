import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


/*==================================
REGISTRAR INSTITUCIÓN Y ADMINISTRADOR
==================================*/

export async function registrarUsuario(datos) {

    /*==================================
    CREAR CUENTA EN FIREBASE AUTH
    ==================================*/

    const credencial =
        await createUserWithEmailAndPassword(
            auth,
            datos.correo,
            datos.password
        );


    const uid =
        credencial.user.uid;


    /*==================================
    GENERAR ID DE INSTITUCIÓN
    ==================================*/

    const institucionId =
        crypto.randomUUID();


    /*==================================
    GUARDAR INSTITUCIÓN
    ==================================*/

    await setDoc(

        doc(
            db,
            "instituciones",
            institucionId
        ),

        {

            nombre:
                datos.institucion,

            municipio:
                datos.municipio,

            direccion:
                datos.direccion,

            telefono:
                datos.telefono,

            fechaRegistro:
                serverTimestamp(),

            activa:
                true

        }

    );


    /*==================================
    GUARDAR ADMINISTRADOR
    ==================================*/

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

            nombre:
                datos.administrador,

            correo:
                datos.correo,

            telefono:
                datos.telefono,

            rol:
                "administrador",

            activo:
                true,

            fechaRegistro:
                serverTimestamp()

        }

    );


    /*==================================
    DEVOLVER DATOS
    ==================================*/

    return {

        uid,

        institucionId

    };

}
