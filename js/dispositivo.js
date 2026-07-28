const CLAVE = "motiQueueDispositivo";

export function guardarDispositivo(datos){

    localStorage.setItem(CLAVE, JSON.stringify(datos));

}

export function obtenerDispositivo(){

    const datos = localStorage.getItem(CLAVE);

    if(!datos){

        return null;

    }

    return JSON.parse(datos);

}

export function eliminarDispositivo(){

    localStorage.removeItem(CLAVE);

}
