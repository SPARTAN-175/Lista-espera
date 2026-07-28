import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
    getFirestore,
    collection,
    query,
    orderBy,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
    getAuth
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
/*==================================
CONFIGURACIÓN DE FIREBASE
==================================*/

const firebaseConfig = {

    apiKey: "AIzaSyBnhuampwb_9Jhw7Ki2CYcwt2PZIgiqmE8",

    authDomain: "lista-de-espera-6b89d.firebaseapp.com",

    projectId: "lista-de-espera-6b89d",

    storageBucket: "lista-de-espera-6b89d.firebasestorage.app",

    messagingSenderId: "19656055004",

    appId: "1:19656055004:web:a3a4ab6eb7d45de3e7fc19"

};

/*==================================
INICIALIZAR FIREBASE
==================================*/

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

export {

    db,

    auth

};
/*==================================
OBTENER FECHA ACTUAL
==================================*/

function obtenerFechaActual() {

    const hoy = new Date();

    const anio = hoy.getFullYear();

    const mes = String(hoy.getMonth() + 1).padStart(2, "0");

    const dia = String(hoy.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;

}

/*==================================
ESCUCHAR LISTA DE ESPERA
==================================*/

export function escucharLista(institucionId, callback) {

    const referencia = collection(
        db,
        "instituciones",
        institucionId,
        "listas",
        obtenerFechaActual(),
        "personas"
    );

    const consulta = query(
        referencia,
        orderBy("turno")
    );

    return onSnapshot(consulta, (snapshot) => {

        const personas = [];

        snapshot.forEach((doc) => {

            personas.push({

                id: doc.id,

                ...doc.data()

            });

        });

        callback(personas);

    });

}
