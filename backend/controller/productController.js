const Product = require("../models/productModal")


// Create Product

exports.createProduct =  async(req,res,next) => {
   const myproduct = await Product.create(req.body);

   res.status(201).json({
      success : true,
      myproduct
   })
}


exports.getAllProducts = (req,res) => {
   res.status(200).json({message : "Route is working fine_mern"})
}