/*
=========================================
Proyecto : Lista de Espera
Archivo   : firebase.js
Versión   : v2.0.0
Autor     : Carlos & ChatGPT
=========================================
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
    getFirestore,
    collection,
    query,
    orderBy,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";



/*==================================
CONFIGURACIÓN FIREBASE
==================================*/

const firebaseConfig = {

    apiKey: "TU_API_KEY",

    authDomain: "TU_AUTH_DOMAIN",

    projectId: "TU_PROJECT_ID",

    storageBucket: "TU_STORAGE_BUCKET",

    messagingSenderId: "TU_MESSAGING_SENDER",

    appId: "TU_APP_ID"

};



/*==================================
INICIALIZAR
==================================*/

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);



/*==================================
REFERENCIAS
==================================*/

const listaRef = collection(db,"lista");

const listaQuery = query(
    listaRef,
    orderBy("turno","asc")
);



/*==================================
ESCUCHAR CAMBIOS
==================================*/

export function escucharLista(callback){

    onSnapshot(listaQuery,(snapshot)=>{

        const personas=[];

        snapshot.forEach(doc=>{

            personas.push({

                id:doc.id,

                ...doc.data()

            });

        });

        callback(personas);

    });

}
