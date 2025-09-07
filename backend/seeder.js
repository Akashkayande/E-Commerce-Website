const dotenv = require("dotenv");
const Product = require("./models/product")
const mongoose  = require("mongoose");
const User = require("./models/user");
const Cart = require("./models/Cart");
const products = require("./data/products");

dotenv.config();
mongoose.connect(process.env.MONGO_URL);

const seedData = async ()=>{
    try {
        await Product.deleteMany();
        await User.deleteMany();
        await Cart.deleteMany();

        const createdUser = await User.create({
            name:"Admin User",
            email:"admin@gmail.com",
            password:"123456",
            role:"admin",
        });
        const userID = createdUser._id;
        const sampleProducts = products.map((product)=>{
            return{...product,user:userID};
        })
        await Product.insertMany(sampleProducts);
        console.log("product data seed successfully");
        process.exit();
        
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}
seedData();
