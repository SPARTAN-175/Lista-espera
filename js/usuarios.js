import { db } from "./firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export async function obtenerUsuario(uid) {

    // Buscar al usuario en la colección global
    const referencia = doc(db, "usuarios", uid);

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
