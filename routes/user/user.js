// Import required modules
const express = require("express");
const router = express.Router();
const User = require("../../schemas/userModel");
const OTP = require("../../schemas/OtpModel");
const Product = require("../../schemas/productsModel")
const nodemailer = require("nodemailer");

// POST route for adding a new user
router.post("/create", async (req, res) => {
  try {
    // Create a new user instance based on the request body
    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
    });

    // Save the new user to the database
    const savedUser = await newUser.save();

    // Send a success response with the saved user object
    res.status(201).json(savedUser);
  } catch (err) {
    // If there's an error, send a 400 (Bad Request) response with the error message
    res.status(400).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    // Check if email exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    // Check password
    const validPassword = req.body.password == user.password;
    if (!validPassword) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    // Send response with user _id
    res.json({ success: true, _id: user._id });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.post("/authenticate", async (req, res) => {
  try {
    // Check if email exists
    const user = await User.findOne({ _id: req.body.id });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Not Allowed To View This Page" });
    }
    // Send response with user _id
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    // Check if email exists
    const user = await User.findOne({ _id: req.params.id });
    console.log(user);
    // Send response with user _id
    res
      .status(200)
      .json({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountBalance: user.accountBalance,
      });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});


router.post('/generate-otp', async (req, res) => {
    try {
      const { email } = req.body;
  
      // Generate a random OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
      // Save OTP in MongoDB
      await OTP.deleteMany({email});
      await OTP.create({ email, otp });
  
      // Send OTP via email using Nodemailer
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'salehmalik121@gmail.com', 
          pass: 'gdml fmep dthy ntpr', 
        },
      });
  
      const mailOptions = {
        from: 'salehmalik121@gmail.com',
        to: email,
        subject: 'OTP Verification',
        text: `Your OTP is: ${otp}`,
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          res.status(500).json({ error: 'Failed to send OTP email' });
        } else {
          console.log('Email sent:', info.response);
          res.status(200).json({ message: 'OTP sent successfully' });
        }
      });
    } catch (error) {
      console.error('Error generating OTP:', error);
      res.status(500).json({ error: 'Failed to generate OTP' });
    }
  });



  router.post('/verify-otp', async (req, res) => {
    try {
      const { email, otp } = req.body;
  
      // Find the OTP record in the database
      const otpRecord = await OTP.findOne({ email });
      
      // Check if OTP record exists
      if (!otpRecord) {
        return res.status(400).json({ message: 'OTP not found for the provided email' , status : false });
      }
  
      if (otpRecord.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' , status: false });
      }
      await OTP.deleteMany({email});
      return res.status(200).json({ message: 'OTP verified successfully' , status: true });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return res.status(500).json({ message: 'Internal server error' , status: false });
    }
  });


  router.post('/change-password', async (req, res) => {
    try {
      const { email, newPassword } = req.body;
  
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Update user's password
      user.password = newPassword;
      await user.save();
  
      // Return success response
      return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Error changing password:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.get("/productBought/:pid/:uid" , async(req , res , next)=>{
    const pid = req.params.pid;
    const uid = req.params.uid;

    const previousData = await User.findOne({_id : uid});
    const productData = await Product.findOne({_id : pid });

    if(previousData.accountBalance < productData.price){
        
    }else{
        const NewBalance = previousData.accountBalance - productData.price;
        await User.findOneAndUpdate({_id : uid} , {accountBalance : NewBalance } )
        res.status(200).json({NewBalance});
    }
    

    


  })
  

module.exports = router;
