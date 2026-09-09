import mongoose from "mongoose";
import Order from "../Models/orders.js";
import Product from "../Models/products.js";

export async function createOrder(req, res) {
    if (!req.user || !req.user.email) {
        return res.status(401).json({ message: "Unauthorized: Please log in to place an order" });
    }

    const customerEmail = req.user.email;
    const { name, address, phone, orderedItems } = req.body;

    if (!name || !address || !phone) {
        return res.status(400).json({ message: "Name, address, and phone number are required" });
    }

    if (!Array.isArray(orderedItems) || orderedItems.length === 0) {
        return res.status(400).json({ message: "Order must contain at least one product" });
    }

    try {
        // Step 1: Complete Validation Phase BEFORE modifying any database records
        const validatedItems = [];
        let calculatedTotal = 0;

        for (const item of orderedItems) {
            const reqProductId = item.productId || item._id;
            const reqQuantity = Number(item.quantity || item.qty);

            if (!reqProductId) {
                return res.status(400).json({ message: "Invalid product item in order payload" });
            }

            if (isNaN(reqQuantity) || reqQuantity <= 0) {
                return res.status(400).json({ message: "Quantity must be a positive number" });
            }

            const product = await Product.findOne({ productId: reqProductId });

            if (!product) {
                return res.status(404).json({ message: `Product not found: ${reqProductId}` });
            }

            if (product.isAvailable === false) {
                return res.status(400).json({ message: `Product is currently unavailable: ${product.name}` });
            }

            const currentStock = typeof product.stock === "number" ? product.stock : Infinity;
            if (currentStock < reqQuantity) {
                return res.status(400).json({
                    message: `Insufficient stock for '${product.name}'. Available: ${currentStock}, Requested: ${reqQuantity}`
                });
            }

            const itemPrice = Number(product.price) || 0;
            const itemSubtotal = itemPrice * reqQuantity;
            calculatedTotal += itemSubtotal;

            validatedItems.push({
                productDoc: product,
                snapshot: {
                    productId: product.productId,
                    name: Array.isArray(product.name) ? product.name.join(" ") : product.name,
                    price: itemPrice,
                    quantity: reqQuantity,
                    image: product.image
                }
            });
        }

        // Generate unique order ID
        const timestampPart = Date.now().toString().slice(-6);
        const randomPart = Math.floor(1000 + Math.random() * 9000);
        const orderId = `ORD-${timestampPart}-${randomPart}`;

        const newOrderData = {
            orderId: orderId,
            email: customerEmail,
            name: name.trim(),
            address: address.trim(),
            phone: phone.trim(),
            status: "pending",
            totalAmount: calculatedTotal,
            orderedItems: validatedItems.map((v) => v.snapshot)
        };

        // Step 2: Attempt Mongoose Transaction Session if MongoDB topology supports it
        let session = null;
        let useTransaction = false;

        try {
            session = await mongoose.startSession();
            session.startTransaction();
            useTransaction = true;
        } catch (sessionErr) {
            session = null;
            useTransaction = false;
        }

        if (useTransaction && session) {
            try {
                // Update stock for each product within transaction
                for (const item of validatedItems) {
                    const prod = item.productDoc;
                    if (typeof prod.stock === "number") {
                        prod.stock = Math.max(0, prod.stock - item.snapshot.quantity);
                        if (prod.stock === 0) {
                            prod.isAvailable = false;
                        }
                        await prod.save({ session });
                    }
                }

                const newOrder = new Order(newOrderData);
                await newOrder.save({ session });

                await session.commitTransaction();
                session.endSession();

                return res.status(201).json({
                    message: "Order placed successfully",
                    orderId: newOrder.orderId,
                    order: newOrder
                });
            } catch (txErr) {
                await session.abortTransaction();
                session.endSession();
                return res.status(500).json({ message: "Transaction failed while creating order: " + txErr.message });
            }
        } else {
            // Pre-validated safe execution (non-transaction fallback)
            for (const item of validatedItems) {
                const prod = item.productDoc;
                if (typeof prod.stock === "number") {
                    prod.stock = Math.max(0, prod.stock - item.snapshot.quantity);
                    if (prod.stock === 0) {
                        prod.isAvailable = false;
                    }
                    await prod.save();
                }
            }

            const newOrder = new Order(newOrderData);
            await newOrder.save();

            return res.status(201).json({
                message: "Order placed successfully",
                orderId: newOrder.orderId,
                order: newOrder
            });
        }

    } catch (err) {
        return res.status(500).json({ message: err.message || "Failed to place order" });
    }
}

export async function getCustomerOrders(req, res) {
    if (!req.user || !req.user.email) {
        return res.status(401).json({ message: "Unauthorized: Please log in to view orders" });
    }

    try {
        let orders;
        if (req.user.isAdmin) {
            orders = await Order.find().sort({ date: -1 });
        } else {
            orders = await Order.find({ email: req.user.email }).sort({ date: -1 });
        }

        return res.json(orders);
    } catch (err) {
        return res.status(500).json({ message: err.message || "Failed to fetch orders" });
    }
}
