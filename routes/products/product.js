const express = require("express");
const router = express.Router();
const User = require("../../schemas/userModel");
const Product = require("../../schemas/productsModel");
const mongoose = require('mongoose'); 

router.get("/" , async(req , res) =>{

    const allProducts = await Product.find({});
    res.status(200).json(allProducts);

})


router.get("/:id", async (req, res) => {
    try {

      const pid = req.params.id;
      const oid = new mongoose.Types.ObjectId(pid);
      const pDetails = await Product.findOne({ _id: oid });
      if (!pDetails) {
        return res.status(400).json({ error: "Product not found" });
      }
      res.status(200).json(pDetails);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });




router.get("/getProductById/:id" , async(req , res)=>{
    const id  = new mongoose.Types.ObjectId(req.params.id);
    const productData = await Product.findOne({_id : id});
    
    res.status(200).json(productData);

})

module.exports = router;