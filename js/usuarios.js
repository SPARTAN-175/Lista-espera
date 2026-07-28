import { db } from "./firebase.js";

import {
    collectionGroup,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export async function obtenerUsuario(uid) {

    // Buscar al usuario en todas las subcolecciones "usuarios"
    const q = query(
        collectionGroup(db, "usuarios"),
        where("uid", "==", uid)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        throw new Error("usuario-no-existe");
    }

    const documento = snapshot.docs[0];

    const datos = documento.data();

    if (!datos.activo) {
        throw new Error("usuario-inactivo");
    }

    return {
        uid,
        ...datos
    };

}
