import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    getDocs,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { obtenerUsuario } from "./sesion.js";

const btnGenerar = document.getElementById("btnGenerar");
const codigo = document.getElementById("codigo");
const contenedorQR = document.getElementById("qrcode");


function generarCodigo() {

    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let codigo = "";

    for (let i = 0; i < 10; i++) {

        codigo += caracteres.charAt(
            Math.floor(Math.random() * caracteres.length)
        );

    }

    return "MQ:" + codigo;

}

async function guardarVinculacion(codigoQR) {

    const usuario = obtenerUsuario();

    // Buscar QR activos de esta institución
    const consulta = query(
        collection(db, "vinculaciones"),
        where("institucionId", "==", usuario.institucionId),
        where("activo", "==", true)
    );

    const resultados = await getDocs(consulta);

    // Desactivar los anteriores
    for (const documento of resultados.docs) {

        await updateDoc(documento.ref, {

            activo: false

        });

    }

    // Crear el nuevo
    await addDoc(
        collection(db, "vinculaciones"),
        {

            codigo: codigoQR,

            activo: true,

            usado: false,

            institucionId: usuario.institucionId,

            nombreInstitucion: usuario.nombreInstitucion || "",

            creadoPor: usuario.uid,

            fechaCreacion: serverTimestamp()

        }
    );

}



btnGenerar.addEventListener("click", async () => {

    const nuevoCodigo = generarCodigo();

    await guardarVinculacion(nuevoCodigo);

    codigo.textContent = nuevoCodigo;

    contenedorQR.innerHTML = "";

    new QRCode(contenedorQR, {

        text: nuevoCodigo,

        width: 250,

        height: 250

    });

});
