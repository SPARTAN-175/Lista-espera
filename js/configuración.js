import { db } from "./firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

class ConfiguracionService {

    constructor(institucion) {

        this.institucion = institucion;

        this.sistema = null;

    }

    async cargar() {

        const referencia = doc(

            db,

            "instituciones",

            this.institucion,

            "configuracion",

            "sistema"

        );

        const documento = await getDoc(referencia);

        if (!documento.exists()) {

            throw new Error("No existe la configuración del sistema.");

        }

        this.sistema = documento.data();

        return this.sistema;

    }

    obtener() {

        return this.sistema;

    }

}

export { ConfiguracionService };
