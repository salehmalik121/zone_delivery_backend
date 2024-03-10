const mongoose = require('mongoose');

// Define the schema for the product
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  // Add other fields as needed
});

// Create a model for the product schema
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
