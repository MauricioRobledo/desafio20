import * as dotenv from "dotenv"
import ParsedArgs  from "minimist";

dotenv.config()

const objArgs = ParsedArgs(process.argv.slice(2),{
    alias:{
        p: 'port',
        e: 'env',
    },
    default:{
        port: 8080,
        env: 'DEV'
    }
});


export const config = {
    server:{
        PORT: objArgs.port,
        NODE_ENV: objArgs.env,
        dbType: process.env.DATABASE_TYPE || 'MONGO',
    },
    mongoUrlSessions: process.env.mongoUrlSessions,
    mongoUrl: process.env.mongoUrl,
    clave: process.env.clave
}