import { ContenedorMysql } from "../../persistence/managers/contenedorSql.js";

class PruductosDaoSql extends ContenedorMysql{
    constructor(options,tableName){
        super(options,tableName)
    }
}

export {PruductosDaoSql}