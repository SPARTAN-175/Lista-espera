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

const turnoActual = document.getElementById("turnoActual");

const nombreActual = document.getElementById("nombreActual");

const horaActual = document.getElementById("horaActual");

const nextTurn1 = document.getElementById("nextTurn1");

const nextTurn2 = document.getElementById("nextTurn2");

const nextTurn3 = document.getElementById("nextTurn3");


escucharLista((personas)=>{

    console.table(personas);

    const pendientes = personas.filter(
        persona => persona.estado === "pendiente"
    );

    console.log(pendientes);

    renderLista(pendientes);

    renderTurnoActual(pendientes);

    renderSiguientes(pendientes);

});


/*==================================
MOSTRAR LISTA
==================================*/

function renderLista(personas){

    lista.innerHTML = "";

    personas.forEach(persona => {

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

/*==================================
TURNO ACTUAL
==================================*/

function renderTurnoActual(pendientes){

    if(pendientes.length===0){

        turnoActual.textContent="---";

        nombreActual.textContent="No hay personas en espera";

        horaActual.textContent="🕒 --:--";

        return;

    }

    const actual = pendientes[0];

    turnoActual.textContent=
        "T"+String(actual.turno).padStart(3,"0");

    nombreActual.textContent=
        actual.nombre;

    horaActual.textContent=
        "🕒 "+actual.hora;

}

/*==================================
SIGUIENTES TURNOS
==================================*/

function renderSiguientes(pendientes){

    const siguientes = pendientes.slice(1,4);

    nextTurn1.textContent = siguientes[0]
        ? "T" + String(siguientes[0].turno).padStart(3,"0")
        : "---";

    nextTurn2.textContent = siguientes[1]
        ? "T" + String(siguientes[1].turno).padStart(3,"0")
        : "---";

    nextTurn3.textContent = siguientes[2]
        ? "T" + String(siguientes[2].turno).padStart(3,"0")
        : "---";

}
