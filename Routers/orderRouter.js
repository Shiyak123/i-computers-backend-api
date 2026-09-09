import express from "express";
import { createOrder, getCustomerOrders } from "../Controllers/orderControllers.js";

const orderRouter = express.Router();

orderRouter.post("/", createOrder);
orderRouter.get("/", getCustomerOrders);

export default orderRouter;
