import { ContenedorArchivos } from "../../persistence/managers/contenedorProductos.js";

class ProductosDaoArchivos extends ContenedorArchivos{
    constructor(filename){
        super(filename)
    }
}

export {ProductosDaoArchivos}