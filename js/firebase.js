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

  apiKey: "AIzaSyBnhuampwb_9Jhw7Ki2CYcwt2PZIgiqmE8",
  authDomain: "lista-de-espera-6b89d.firebaseapp.com",
  projectId: "lista-de-espera-6b89d",
  storageBucket: "lista-de-espera-6b89d.firebasestorage.app",
  messagingSenderId: "19656055004",
  appId: "1:19656055004:web:a3a4ab6eb7d45de3e7fc19",
  measurementId: "G-30V2P6CZ22"

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
