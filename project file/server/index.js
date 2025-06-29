import express from 'express'
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {Admin, Cart, Orders, Product, User } from './Schema.js'

// Load environment variables from .env file
dotenv.config();

const app = express();

app.use(express.json());
app.use(bodyParser.json({limit: "30mb", extended: true}))
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}));
app.use(cors());

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{

    app.post('/api/auth/register', async (req, res) => {
        const { username, email, usertype, password } = req.body;
        try {
          
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({
                username, email, usertype, password: hashedPassword
            });
            const userCreated = await newUser.save();
            return res.status(201).json(userCreated);

        } catch (error) {
          console.log(error);
          return res.status(500).json({ message: 'Server Error' });
        }
    });



    app.post('/api/auth/login', async (req, res) => {
        const { email, password } = req.body;
        try {

            const user = await User.findOne({ email });
    
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid email or password' });
            } else{
                // Create a JWT payload with user information
                const payload = { user: { id: user.id, usertype: user.usertype } };

                // Sign the token with the secret key
                const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

                return res.json({ token });
            }
          
        } catch (error) {
          console.log(error);
          return res.status(500).json({ message: 'Server Error' });
        }
    });

    // fetch banner

    app.get('/api/banner', async(req, res)=>{
        try{
            const admin = await Admin.findOne();
            res.json(admin.banner);

        }catch(err){
            res.status(500).json({ message: 'Error occured' });
        }
    })


    // fetch users

    app.get('/api/users', async(req, res)=>{
        try{
            const users = await User.find();
            res.json(users);

        }catch(err){
            res.status(500).json({ message: 'Error occured' });
        }
    })

     // Fetch individual product
     app.get('/api/products/:id', async(req, res)=>{
        const id = req.params.id;
        try{
            const product = await Product.findById(id);
            res.json(product);
        }catch(err){
            res.status(500).json({message: "Error occured"});
        }
    })

    // fetch products

    app.get('/api/products', async(req, res)=>{
        try{
            const products = await Product.find();
            res.json(products);

        }catch(err){
            res.status(500).json({ message: 'Error occured' });
        }
    })

    // fetch orders

    app.get('/api/orders', async(req, res)=>{
        try{
            const { userId } = req.query;
            const query = userId ? { userId } : {};
            const orders = await Orders.find(query);
            res.json(orders);

        }catch(err){
            console.error("Error fetching orders:", err);
            res.status(500).json({ message: 'Error occurred while fetching orders' });
        }
    })


    // Fetch categories

    app.get('/api/categories', async(req, res)=>{
        try{
            const data = await Admin.find();
            if(data.length===0){
                const newData = new Admin({banner: "", categories: []})
                await newData.save();
                return res.json(newData[0].categories);
            }else{
                return res.json(data[0].categories);
            }
        }catch(err){
            res.status(500).json({message: "Error occured"});
        }
    })


    // Add new product

    app.post('/api/products', async(req, res)=>{
        const {productName, productDescription, productMainImg, productCarousel, productSizes, productGender, productCategory, productNewCategory, productPrice, productDiscount} = req.body;

        try{
            let finalCategory = productCategory;
            if(productCategory === 'new category'){
                const admin = await Admin.findOne();
                if (admin) {
                    admin.categories.push(productNewCategory);
                    await admin.save();
                }
                finalCategory = productNewCategory;
            }

            const newProduct = new Product({
                title: productName,
                description: productDescription,
                mainImg: productMainImg,
                carousel: productCarousel,
                category: finalCategory,
                sizes: productSizes,
                gender: productGender,
                price: productPrice,
                discount: productDiscount
            });

            const savedProduct = await newProduct.save();
            res.status(201).json({ message: "product added!!", product: savedProduct });
        } catch(err){
            console.error("Error adding product:", err);
            res.status(500).json({message: "Error occurred while adding product"});
        }
    })

    // update product

    app.put('/api/products/:id', async(req, res)=>{
        const {productName, productDescription, productMainImg, productCarousel, productSizes, productGender, productCategory, productNewCategory, productPrice, productDiscount} = req.body;
        try{
            let finalCategory = productCategory;
            if(productCategory === 'new category'){
                const admin = await Admin.findOne();
                if (admin) {
                    admin.categories.push(productNewCategory);
                    await admin.save();
                }
                finalCategory = productNewCategory;
            }

            const updatedProduct = await Product.findByIdAndUpdate(
                req.params.id,
                {
                    title: productName, description: productDescription, mainImg: productMainImg,
                    carousel: productCarousel, category: finalCategory, sizes: productSizes,
                    gender: productGender, price: productPrice, discount: productDiscount
                },
                { new: true } // Return the updated document
            );

            if (!updatedProduct) {
                return res.status(404).json({ message: "Product not found" });
            }

            res.json({ message: "product updated!!", product: updatedProduct });
        } catch(err){
            console.error("Error updating product:", err);
            res.status(500).json({message: "Error occurred while updating product"});
        }
    })


    // Update banner

    app.put('/api/banner', async(req, res)=>{
        const {banner} = req.body;
        try{
            const data = await Admin.find();
            if(data.length===0){
                const newData = new Admin({banner: banner, categories: []})
                await newData.save();
                res.json({message: "banner updated"});
            }else{
                const admin = await Admin.findOne();
                admin.banner = banner;
                await admin.save();
                res.json({message: "banner updated"});
            }
            
        }catch(err){
            res.status(500).json({message: "Error occured"});
        }
    })


    // buy product

    app.post('/api/orders/buy-now', async(req, res)=>{
        const {userId, name, email, mobile, address, pincode, title, description, mainImg, size, quantity, price, discount, paymentMethod, orderDate} = req.body;
        try{

            const newOrder = new Orders({userId, name, email, mobile, address, pincode, title, description, mainImg, size, quantity, price, discount, paymentMethod, orderDate})
            await newOrder.save();
            res.json({message: 'order placed'});

        }catch(err){
            res.status(500).json({message: "Error occured"});
        }
    })


   
    // cancel order

    app.put('/api/orders/cancel', async(req, res)=>{
        const {id} = req.body;
        try{

            const order = await Orders.findById(id);
            order.orderStatus = 'cancelled';
            await order.save();
            res.json({message: 'order cancelled'});

        }catch(err){
            res.status(500).json({message: "Error occured"});
        }
    })


    // update order status

    app.put('/api/orders/status', async(req, res)=>{
        const {id, updateStatus} = req.body;
        try{

            const order = await Orders.findById(id);
            order.orderStatus = updateStatus;
            await order.save();
            res.json({message: 'order status updated'});

        }catch(err){
            res.status(500).json({message: "Error occured"});
        }
    })


    // fetch cart items

    app.get('/api/cart', async(req, res)=>{
        try{
            
            const items = await Cart.find();
            res.json(items);

        }catch(err){
            res.status(500).json({message: "Error occured"});
        }
    })


    // add cart item

    app.post('/api/cart', async(req, res)=>{

        const {userId, title, description, mainImg, size, quantity, price, discount} = req.body
        try{

            const item = new Cart({userId, title, description, mainImg, size, quantity, price, discount});
            await item.save();

            res.json({message: 'Added to cart'});
            
        }catch(err){
            res.status(500).json({message: "Error occured"});
        }
    })


    // increase cart quantity

    app.put('/api/cart/increase', async(req, res)=>{
        const {id} = req.body;
        try{
            const item = await Cart.findById(id);
            item.quantity = parseInt(item.quantity) + 1;
            item.save();

            res.json({message: 'incremented'});
        }catch(err){
            res.status(500).json({message: "Error occured"});
        }
    })

    // decrease cart quantity

    app.put('/api/cart/decrease', async(req, res)=>{
        const {id} = req.body;
        try{
            const item = await Cart.findById(id);
            item.quantity = parseInt(item.quantity) - 1;
            item.save();

            res.json({message: 'decremented'});
        }catch(err){
            res.status(500).json({message: "Error occured"});
        }
    })


    // remove from cart

    app.delete('/api/cart/:id', async(req, res)=>{
        const {id} = req.params;
        try{
            await Cart.deleteOne({_id: id});
            res.json({message: 'item removed'});
        }catch(err){
            res.status(500).json({message: "Error occured"});
        }
    });


    // Order from cart

    app.post('/api/orders/from-cart', async(req, res)=>{
        const {userId, name, mobile, email, address, pincode, paymentMethod, orderDate} = req.body;
        try{

            const cartItems = await Cart.find({userId});
            cartItems.map(async (item)=>{

                const newOrder = new Orders({userId, name, email, mobile, address, pincode, title: item.title, description: item.description, mainImg: item.mainImg, size:item.size, quantity: item.quantity, price: item.price, discount: item.discount, paymentMethod, orderDate})
                await newOrder.save();
                await Cart.deleteOne({_id: item._id})
            })
            res.json({message: 'Order placed'});

        }catch(err){
            res.status(500).json({message: "Error occured"});
        }
    })



    app.listen(PORT, ()=>{
        console.log(`✅ Server is running on port ${PORT}`);
    })
}).catch((e)=> console.log(`Error in db connection ${e}`));