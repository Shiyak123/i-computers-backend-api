// on this file we will focus o following things
// create
//read
//update
//delete
//req.user = Who is making this request?

import express from "express"
import Product from "../Models/products.js"

// CREATE FUNCTION
// First of all we have to confirm whether this function has to operated by the admin or not
export async function createProduct(req, res) {
  if (req.user == null) {  // 1. Check if the user has logged in (❌ No user → not logged in) (If no token → block request ==>✔ Status 401 = Unauthorized)
    res.status(401).json({ message: "Unauthorized" })  // so, u cn nt create the new usr cz of u dnt have the token  
    return
  }
  if (!req.user.isAdmin) { // (User is logged in, but not admin) so we have to check whether this usr is he ADMIN or ELSE
    res.status(403).json({ message: "Only admin can create products" })
    return
  }
  try { // we have to check whether the product ID, can be found on DB  or not, we have to pt "try nd cath function for product ID"
    const existingProduct = await Product.findOne({ productId: req.body.productId }) // we have to find the product fist to know whether is it aavilble or ont on DB // product ID eka req eke body eke dala aaapu product ID waage nm 
    if (existingProduct != null) { // if there a prodeuct has been found already on same ID
      res.status(400).json({ message: "Product with this ID already exists" })
      return
    }
    const product = new Product(req.body) // if there no any exisiting products, then the ADMIN will create a new product  // code explantion: althen prodct ekk neththem ==> req body dala aapu details use krala aluthen prodct ekk hadanna
    await product.save()
    res.json({ message: "The Product Has Created Successfully" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export async function getAllProducts(req, res) {
  try {
    if (req.user && req.user.isAdmin) {
      // Admin → see ALL products
      const products = await Product.find();
      return res.json(products);
    }

    // Normal users / no login → only available products
    const products = await Product.find({ isAvailable: true });
    res.json(products);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// export async function getAllProducts(req, res) {
//   try {
//     if (req.user !== null && req.user.isAdmin) { // if admin not be not availble (he should availble) + the user must be an admin
//       const products = await Product.find()
//       res.json(products)
//     } else {
//       const products = await Product.find({ isAvailable: true })
//       res.json(products)
//     }
//   } catch (err) {
//     res.status(500).json({ message: err.message })
//   }
// }

// The different between (req.user!== null && req.user.isAdmin=true)  and  (req.user && req.user.is Admin)
//     req.user !== null means
// 👉 “Is the box not empty?” (but you forgot to check if the box exists at all)
// req.user && ...
// 👉 “First check if the box exists, then open it”


//    SUMMARY
// Request →
// Check token →
// Check admin →
// Check duplicate →
// Create product →
// Save to DB →
// Send response



export async function deleteProduct(req, res) {
  if (req.user && req.user.isAdmin) {
    try {
      const product = await Product.findOne({ productId: req.params.productId }) // "req.params" is used for geting data from URL
      if (product == null) {
        res.status(404).json({ message: "Product not found" })
        return
      }
      await Product.deleteOne({ productId: req.params.productId })
      res.json({ message: "Product deleted successfully" })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  } else {
    res.status(403).json({ message: "Only admins can delete products" })
  }
}

export async function updateProduct(req, res) {

  if (!req.user?.isAdmin) {  //(?.)==> “Only check next part if req.user exists” 👉 “If the user is NOT an admin, run this block”
    return res.status(403).json({
      message: "Only admin can update the products"
    });
  }

  try {
    // ❌ Prevent updating productId
    if (req.body.productId) {
      return res.status(400).json({
        message: "ProductID cannot be updated"
      });
    }

    const productId = req.params.productId;

    const result = await Product.findOneAndUpdate(
      { productId },
      req.body,      // “Find the product by ID, update it using request data, and give me the updated version.”
      { returnDocument: "after" } // Return the updated (new) document after the update  // why not product.save() cz,findOneAndUpdate() = auto update → no .save() needed .save() = only when you manually modify a document

    );

    if (!result) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json({
      message: "Product updated successfully",
      product: result
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
}


export async function getProductById(req, res) {
  try {
    const product = await Product.findOne({ productId: req.params.productId })
    if (product == null) {
      res.status(404).json({ message: "Proudct not found" })
      return
    }
    if (product.isAvailable) {
      res.json(product)

    } else {
      if (req.user?.isAdmin) {
        res.json(product)
      } else {
        res.status(403).json({ message: "Only admin can view Unvavailable products" })
      }
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}