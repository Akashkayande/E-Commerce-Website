const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware");

router.post("/register",async(req,res)=>{
    const {name,email,password} = req.body;
    try {
        let user = await User.findOne({email});
        if(user){
            return res.status(400).json({status:"false",message:"User already exists"});
        }
        user=new User({name,email,password});
        await user.save();

        const payload ={user:{id:user._id,role:user.role}};
        jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:"40h"},(err,token)=>{
            if(err) throw err;
            res.status(201).json({
                user:{
                 _id:user._id,
                 name:user.name,
                 email:user.email,
                 role:user.role,
                },
                token,
            })
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).send("server error")
        
    }

})

router.post("/login",async(req,res)=>{
    const {email,password}=req.body;
    try {
       let user = await User.findOne({email});
       if(!user) return res.status(400).json({message:"Invalid Credentials"});
       const isMatch = await user.matchPassword(password);
       if(!isMatch) return res.status(400).json({message:"Invaild Credential"}) 

        const payload ={user:{id:user._id,role:user.role}};
        jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:"40h"},(err,token)=>{
            if(err) throw err;
            res.json({
                user:{
                 _id:user._id,
                 name:user.name,
                 email:user.email,
                 role:user.role,
                },
                token,
            })
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("server error")
        
    }
})

router.get("/profile",protect,async (req,res)=>{
    res.json(req.user);
})

module.exports = router;