const { protect, admin } = require("../middleware/authMiddleware");
const Product = require("../models/product");
const express = require("express");
const router = express.Router();

router.get("/",protect,admin,async(req,res)=>{
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"server error"})
    }
});

module.exports = router;