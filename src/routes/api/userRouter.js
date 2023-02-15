import express from "express";
import { UserModel } from '../../persistence/models/user.js';
import { ContenedorMongo } from "../../persistence/managers/contenedorMongo.js";
import { convertToDto } from "../../persistence/models/user.dto.js";

const router = express.Router();
const usersDb = new ContenedorMongo(UserModel)

router.get("/users", async(req,res)=>{
    const response = await UserModel.find()
    console.log(response)
    const data = JSON.parse(JSON.stringify(response));
    const responseDto = convertToDto(data);
    console.log(data)
    console.log(responseDto)
    res.send(responseDto)
});
export {router as userRouter}