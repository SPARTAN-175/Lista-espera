import { db } from "./firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


const INSTITUCION_ID = "OST001";


export async function obtenerUsuario(uid) {

    const referencia = doc(
        db,
        "instituciones",
        INSTITUCION_ID,
        "usuarios",
        uid
    );

    const documento = await getDoc(referencia);

    if (!documento.exists()) {

        throw new Error("usuario-no-existe");

    }

    const datos = documento.data();

    if (!datos.activo) {

        throw new Error("usuario-inactivo");

    }

    return {

        uid,

        ...datos

    };

}
