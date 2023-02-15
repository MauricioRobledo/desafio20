import {ContenedorMongo} from "../../persistence/managers/contenedorMongo.js";

class ProductosDaoMongo extends ContenedorMongo{
    constructor(model){
        super(model)
    }
}

export {ProductosDaoMongo}