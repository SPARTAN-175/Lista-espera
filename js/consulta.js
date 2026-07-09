/*
=========================================
Proyecto : Lista de Espera
Archivo   : consulta.js
Versión   : v2.0.0
Autor     : Carlos & ChatGPT
=========================================
*/

import { escucharLista } from "./firebase.js";


const lista = document.getElementById("listaEspera");


escucharLista((personas)=>{

    renderLista(personas);

});



/*==================================
MOSTRAR LISTA
==================================*/

function renderLista(personas){

    lista.innerHTML = "";

    personas.forEach(persona=>{

        lista.innerHTML += `

            <div class="table-row">

                <span class="turn">

                    T${String(persona.turno).padStart(3,"0")}

                </span>

                <span class="name">

                    ${persona.nombre}

                </span>

                <span class="hour">

                    ${persona.hora}

                </span>

            </div>

        `;

    });

}
