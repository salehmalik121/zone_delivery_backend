// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const userRouter = require('./routes/user/user'); 
const cors = require('cors');
const { Server } = require("socket.io");
const Product = require("./schemas/productsModel");
const User = require("./schemas/userModel")
const productRouter = require("./routes/products/product")

// Initialize Express app
const app = express();



// Initialize socket.io
const io = new Server({cors: {
    origin: "http://localhost:4200"
  }});

app.use(cors());
app.use(express.json());
mongoose.connect('mongodb+srv://salehmalik121:trZqpMPyt9ZkOXbJ@cluster0.k2vecdj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
const db = mongoose.connection;
db.on('connected', () => {
  console.log('Connected to MongoDB');
});
db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});


// Mount user router
 app.use('/user', userRouter);
 app.use('/product', productRouter);
// io implementaion

io.on("connection", (socket) => {
    console.log("Connected With Real Time Server")
    socket.on("AddProduct" , async(data)=>{
        
        console.log(data)
        const productData = {
            name : data.name,
            price : data.price,
            description: data.description
        }
        const savedData = await Product.create(productData)
        const userData = await User.findOne({_id : data.id})
        socket.broadcast.emit("NewProductAdded" , {message : `${productData.name} is create by ${userData.firstName} now` , savedData} );
    })

    socket.on("DeleteProduct" , async(data)=>{
        
        console.log(data)
        const productId = data.pid;
        const productData = await Product.findOne({_id : data.pid});
        const userData = await User.findOne({_id : data.uid})
        await Product.deleteOne({_id : productId});
        console.log(userData)
        console.log(productData)
        socket.broadcast.emit("ProductDeleted" , {message : `${productData.name} is deleted by ${userData.firstName} now` , productData} )
        


    })

    socket.on("EditProduct" , async(data)=>{
        const pid = data._id;
        console.log(data);
        const updatedData = {
            name: data.name,
            price: data.price,
            description: data.description
        }

        await Product.findOneAndUpdate({_id : pid} , updatedData);
        const newList = await Product.find({});
        socket.broadcast.emit("ProductUpdated" , {newList , message : `${updatedData.name} is Updated`});

    })

    socket.on("balanceLoaded" , async(data)=>{
        console.log(data);
       const previousData = await User.findOne({_id : data.acc});


       
       const NewBalance = previousData.accountBalance + parseInt(data.amount);  

       await User.findOneAndUpdate({_id : data.acc} , {accountBalance :NewBalance })


    })



  });

  io.listen(3001)





// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
