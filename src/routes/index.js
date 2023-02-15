import express from "express";
import { viewsRouter } from "./api/viewsRouter.js";
import { productRouter } from "./api/productsRouter.js";
import { infoRouter } from "./api/infoRouter.js";
import { userRouter } from "./api/userRouter.js";

const router = express.Router()
router.use("/",viewsRouter)
router.use("/",productRouter)
router.use("/",infoRouter)
router.use("/",userRouter)

export {router as apiRouter}