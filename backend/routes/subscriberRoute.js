const express = require("express");
const Subscriber = require("../models/Subscriber");
const router = express.Router();


router.post("/subscribe",async(req,res)=>{
    const {email} = req.body;
    if(!email){
        return res.status(400).json({message:"Email is required"})
    }
    try {
        let subscriber = await Subscriber.findOne({email});
        if(subscriber){
            return res.status(400).json({message:"email is already subscribed"});
        }
        subscriber = new Subscriber({email});
        await subscriber.save();
        res.status(201).json({message:"successfully subscribed to the newsletter"})
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"server error"})
    }
})
module.exports = router;