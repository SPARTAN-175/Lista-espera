
console.log("Consulta.js funcionando");

/*
=========================================
Proyecto : Lista de Espera
Archivo   : consulta.js
Versión   : v2.0.0
Autor     : Carlos & ChatGPT
=========================================
*/

import { escucharLista } from "./firebase.js";

console.log("Conectando con Firebase...");

escucharLista((personas)=>{

    console.log(personas);

});

