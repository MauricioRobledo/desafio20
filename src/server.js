import express from 'express';
import {apiRouter} from './routes/index.js';
import handlebars from 'express-handlebars';
import {Server} from "socket.io";
import {normalize, schema} from "normalizr";
import {ContenedorChat} from './persistence/managers/contenedorChat.js';
import session  from 'express-session';
import cookieParser from "cookie-parser"
import mongoStore from "connect-mongo";
import path from 'path';
import { fileURLToPath} from "url";
import {config} from "./config/config.js"
import Yargs from 'yargs';
import os from "os"
import cluster from 'cluster';
import { logger } from './logger.js';
import compression from 'compression';
import {connectDB} from "./config/mongoDbConfig.js"
import { ContenedorDaoProductos } from './daos/Index.js';

//CANTIDAD DE CPUS

const numeroCPUs = os.cpus().length

const args = Yargs(process.argv.slice(2))

const objArgumentos = args.default({
    p:8080,
    m: "FORK"
})
.alias({
    p:"puerto",
    m:"mode"
}).argv

console.log(objArgumentos.p)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename);


const clave = config.clave
const mongoUrlSessions = config.mongoUrlSessions

connectDB()

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(express.static(__dirname+'/public'))

//configuracion template engine handlebars
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname+'/views');
app.set('view engine', 'handlebars');

//COMPRESSION

app.use(compression())

app.use(session({
    store: mongoStore.create({
        mongoUrl: mongoUrlSessions
    }),
    secret: clave,
    resave: false,
    saveUninitialized: false,
    cookie:{
        maxAge:600000
    }
}))

 app.use(cookieParser())



//service
// const productosApi = new Contenedor("productos.txt");
const productosApi = ContenedorDaoProductos
const chatApi = new ContenedorChat("chat.txt");
// const chatApi = new ContenedorSql(options.sqliteDB,"chat");



//normalizacion
//creamos los esquemas.
//esquema del author
const authorSchema = new schema.Entity("authors",{}, {idAttribute:"email"});

//esquema mensaje
const messageSchema = new schema.Entity("messages", {author: authorSchema});


const chatSchema = new schema.Entity("chat", {
    messages:[messageSchema]
}, {idAttribute:"id"});

//aplicar la normalizacion
//crear una funcion que la podemos llamar para normalizar la data
const normalizarData = (data)=>{
    const normalizeData = normalize({id:"chatHistory", messages:data}, chatSchema);
    return normalizeData;
};

const normalizarMensajes = async()=>{
    const results = await chatApi.getAll();
    const messagesNormalized = normalizarData(results);
    // console.log(JSON.stringify(messagesNormalized, null,"\t"));
    return messagesNormalized;
}



//api routes
app.use('/',apiRouter)




// FORK

// app.get("/api/random/:cant",(req,res)=>{
//     const ruta = req.path
//     const metodo = req.method
//     logger.info(`Ruta: ${ruta} y metodo: ${metodo}`)
//     const cant = req.params.cant
//     const child = fork("src/child.js")
//     child.on("message",(childMsg)=>{
//         if(childMsg === "listo"){
//             child.send(cant)
//         } else{
//             res.json({resultado: childMsg})
//         }
//     })
    
// })

app.get("*",(req,res)=>{
    const ruta = req.path
    const metodo = req.method
    logger.warn(`Ruta: ${ruta} y metodo: ${metodo} incorrectos`)
    res.send(`Ruta: ${ruta} no es valida`)
})




//Cluster
const MODO = objArgumentos.m
if(MODO === "CLUSTER" && cluster.isPrimary){
    const numCPUS = os.cpus().length
    for(let i=0; i<numCPUS; i++){
        cluster.fork()
    }
    cluster.on("exit",(worker)=>{
        console.log (`El subproceso ${worker.process.pid} fallo`)
        cluster.fork()
    })
}else{
    //express server
    const server = app.listen(objArgumentos.p,()=>{
        console.log(`Escuchando en puerto ${objArgumentos.p}`)
    })









    //websocket server
    const io = new Server(server);

    //configuracion websocket
    io.on("connection",async(socket)=>{
        //PRODUCTOS
        //envio de los productos al socket que se conecta.
        io.sockets.emit("products", await productosApi.getAll())

        //recibimos el producto nuevo del cliente y lo guardamos con filesystem
        socket.on("newProduct",async(data)=>{
            await productosApi.save(data);
            //despues de guardar un nuevo producto, enviamos el listado de productos actualizado a todos los sockets conectados
            io.sockets.emit("products", await productosApi.getAll())
        })

        //CHAT
        //Envio de todos los mensajes al socket que se conecta.
        io.sockets.emit("messages", await normalizarMensajes());

        //recibimos el mensaje del usuario y lo guardamos en el archivo chat.txt
        socket.on("newMessage", async(newMsg)=>{
            console.log(newMsg);
            await chatApi.save(newMsg);
            io.sockets.emit("messages", await normalizarMensajes());
        });
    })
}