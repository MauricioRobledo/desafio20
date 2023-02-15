import {options} from "../config/dbConfig.js"
import { config } from "../config/config.js";
let ContenedorDaoProductos


switch(config.server.dbType){


    case "archivos":
        const {ProductosDaoArchivos} = await import("./productos/productoArchivo.js")
        ContenedorDaoProductos = new ProductosDaoArchivos(options.fileSystem.pathProducts)
        break;
    case "sqlite":
        const {ProductosDaoSqlite} = await import("./productos/productosSql.js")
        ContenedorDaoProductos = new ProductosDaoSqlite(options.sqliteDB, "productos")
        break

    case "mariadb":
        const {ProductosDaoMariadb} = await import("./productos/productosSql.js")
        ContenedorDaoProductos = new ProductosDaoMariadb(options.mariaDB, "products")
        break
    case "MONGO":
        const{ProductosDaoMongo} = await import("./productos/productosMongo.js")
        ContenedorDaoProductos = new ProductosDaoMongo(options.mongoDB.modelProduct)
        break


}
export {ContenedorDaoProductos}