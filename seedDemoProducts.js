import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "./Models/products.js";

dotenv.config();

const demoProducts = [
    {
        productId: "LP-007",
        name: ["ASUS VivoBook 15"],
        alternativeName: ["Asus Laptop", "VivoBook 15", "Student Laptop"],
        description: "15.6-inch Full HD laptop with Intel Core i5 processor, 8GB RAM, 512GB SSD, and sleek lightweight design.",
        price: 165000,
        labelPrice: 185000,
        image: ["https://picsum.photos/seed/asus-vivobook-15/600/600"],
        isAvailable: true,
        category: "Laptops",
        stock: 12,
        brand: "ASUS",
        model: "VivoBook 15 X515"
    },
    {
        productId: "LP-008",
        name: ["Lenovo IdeaPad Slim 3"],
        alternativeName: ["Lenovo Laptop", "IdeaPad 3", "Ultrabook"],
        description: "Slim and portable 14-inch laptop featuring AMD Ryzen 5 CPU, 16GB RAM, and 512GB NVMe SSD.",
        price: 178000,
        labelPrice: 195000,
        image: ["https://picsum.photos/seed/lenovo-ideapad-slim3/600/600"],
        isAvailable: true,
        category: "Laptops",
        stock: 8,
        brand: "Lenovo",
        model: "IdeaPad Slim 3 14IAH8"
    },
    {
        productId: "LP-009",
        name: ["HP Pavilion 15"],
        alternativeName: ["HP Laptop", "Pavilion 15", "Business Laptop"],
        description: "Powerful 15.6-inch laptop with Intel Core i7 12th Gen, B&O Audio, and fast charging battery.",
        price: 215000,
        labelPrice: 235000,
        image: ["https://picsum.photos/seed/hp-pavilion-15/600/600"],
        isAvailable: true,
        category: "Laptops",
        stock: 6,
        brand: "HP",
        model: "Pavilion 15-eg2000"
    },
    {
        productId: "MN-010",
        name: ["Dell 24-inch Full HD Monitor"],
        alternativeName: ["Dell Monitor", "Full HD Display", "24-inch Display"],
        description: "24-inch IPS monitor with 75Hz refresh rate, ultra-thin bezel design, and HDMI/VGA connectivity.",
        price: 48000,
        labelPrice: 55000,
        image: ["https://picsum.photos/seed/dell-24inch-monitor/600/600"],
        isAvailable: true,
        category: "Monitors",
        stock: 18,
        brand: "Dell",
        model: "SE2422H"
    },
    {
        productId: "MS-011",
        name: ["Logitech Wireless Mouse M330"],
        alternativeName: ["Silent Mouse", "Logitech M330", "Wireless Mouse"],
        description: "Silent Plus wireless mouse with noise reduction, 24-month battery life, and comfortable rubber grip.",
        price: 6800,
        labelPrice: 8500,
        image: ["https://picsum.photos/seed/logitech-m330-mouse/600/600"],
        isAvailable: true,
        category: "Computer Accessories",
        stock: 35,
        brand: "Logitech",
        model: "M330 Silent Plus"
    },
    {
        productId: "KB-012",
        name: ["Logitech K380 Multi-Device Bluetooth Keyboard"],
        alternativeName: ["Logitech Keyboard", "Bluetooth Keyboard", "Compact Keyboard"],
        description: "Minimalist multi-device Bluetooth keyboard compatible with Windows, Mac, Chrome OS, and Tablets.",
        price: 14500,
        labelPrice: 17000,
        image: ["https://picsum.photos/seed/logitech-k380-keyboard/600/600"],
        isAvailable: true,
        category: "Computer Accessories",
        stock: 20,
        brand: "Logitech",
        model: "K380"
    },
    {
        productId: "HS-013",
        name: ["HyperX Cloud II Gaming Headset"],
        alternativeName: ["Gaming Headphones", "HyperX Headset", "RGB Headset"],
        description: "7.1 virtual surround sound gaming headset with memory foam ear cushions and noise-cancelling detachable mic.",
        price: 28500,
        labelPrice: 34000,
        image: ["https://picsum.photos/seed/hyperx-cloud2-headset/600/600"],
        isAvailable: true,
        category: "Audio & Headsets",
        stock: 14,
        brand: "HyperX",
        model: "Cloud II"
    },
    {
        productId: "RT-014",
        name: ["TP-Link Archer AX12 Wi-Fi 6 Router"],
        alternativeName: ["Wifi Router", "Dual Band Router", "Gigabit Router"],
        description: "Next-gen dual-band Wi-Fi 6 router delivering speeds up to 1.5 Gbps with 4 high-gain antennas.",
        price: 16500,
        labelPrice: 19800,
        image: ["https://picsum.photos/seed/tplink-archer-router/600/600"],
        isAvailable: true,
        category: "Networking",
        stock: 22,
        brand: "TP-Link",
        model: "Archer AX12"
    },
    {
        productId: "SD-015",
        name: ["Crucial P3 1TB PCIe M.2 NVMe SSD"],
        alternativeName: ["1TB SSD", "NVMe M.2 SSD", "Crucial SSD"],
        description: "High-speed M.2 NVMe solid state drive with read speeds up to 3500MB/s for fast system boot and game loading.",
        price: 24500,
        labelPrice: 29000,
        image: ["https://picsum.photos/seed/crucial-p3-1tb-ssd/600/600"],
        isAvailable: true,
        category: "Storage Devices",
        stock: 25,
        brand: "Crucial",
        model: "P3 1TB"
    },
    {
        productId: "RM-016",
        name: ["Corsair Vengeance LPX 16GB DDR4 3200MHz RAM"],
        alternativeName: ["16GB RAM", "DDR4 Memory", "Corsair RAM"],
        description: "High-performance DDR4 desktop memory module with aluminum heat spreader for overclocking headroom.",
        price: 15500,
        labelPrice: 18500,
        image: ["https://picsum.photos/seed/corsair-vengeance-16gb-ram/600/600"],
        isAvailable: true,
        category: "Memory & RAM",
        stock: 30,
        brand: "Corsair",
        model: "Vengeance LPX"
    }
];

async function seed() {
    try {
        console.log("Connecting to MongoDB Atlas...");
        await mongoose.connect(process.env.MONGO_DB_URL);
        console.log("Connected to MongoDB.");

        let insertedCount = 0;
        let skippedCount = 0;

        for (const prodData of demoProducts) {
            const existing = await Product.findOne({ productId: prodData.productId });
            if (existing) {
                console.log(`Skipped existing product: ${prodData.productId} - ${prodData.name[0]}`);
                skippedCount++;
            } else {
                const newProd = new Product(prodData);
                await newProd.save();
                console.log(`Inserted product: ${prodData.productId} - ${prodData.name[0]}`);
                insertedCount++;
            }
        }

        console.log(`Seeding complete. Inserted: ${insertedCount}, Skipped: ${skippedCount}`);
        process.exit(0);
    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
}

seed();
