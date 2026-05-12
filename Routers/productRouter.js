import express from "express";
import { createProduct, deleteProduct, getAllProducts, updateProduct, getProductById } from "../Controllers/productControllers.js";

const productRouter = express.Router()
productRouter.post("/", createProduct)
productRouter.get("/", getAllProducts)
productRouter.get("/:search", (req, res) => {
    res.json({ message: "search endPoint" })
})
productRouter.get("/:productId", getProductById)
productRouter.delete("/:productId", deleteProduct) //parameter eke url eka ellil yaweema
productRouter.put("/:productId", updateProduct)
export default productRouter


// Endpoint = door “Endpoint = the path your frontend (or user) calls to get or send data
// URL = address of the door
// Method (GET/POST) = what you do at the door

//API=>(Application Programming Interface)===>“An API is a set of endpoints that allows different systems to communicate with each other by sending requests and receiving responses.”