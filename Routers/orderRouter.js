import express from "express";
import { createOrder, getCustomerOrders, updateOrderStatus } from "../Controllers/orderControllers.js";

const orderRouter = express.Router();

orderRouter.post("/", createOrder);
orderRouter.get("/", getCustomerOrders);
orderRouter.put("/:orderId", updateOrderStatus);

export default orderRouter;
