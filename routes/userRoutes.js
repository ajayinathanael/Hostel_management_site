// ROUTES -  /signup, /login, /logout, AUTHORIZATION - /dashboard, /newRoom, /bookRoom, */payment

const dotenv = require('dotenv');
// const stripe = require("stripe")('sk_test_51LQjgQKi0GzkVsltN8aL7ynswZWiNDRPt4x2cXVtL4VGruTa3xc19CDTAImRWrMVulb4IeGsr339uMcuk1r8x6no00jsRAvjo8');
const User = require('../model/hotel_users');
const Room = require('../model/rooms');
const {promisify} = require('util');
const multer = require('multer');
const cookieParser = require("cookie-parser");
const express = require('express');
const router = express.Router();
const passport = require("passport");


router.use(cookieParser());
//load config.env file
dotenv.config({path: './config.env'});

const storage = multer.diskStorage({
    // to locate destination of a file which is being uploaded
    destination: function(res, file, callback){
        callback(null,'./public/uploads');
    },

    // add back the extension to the file name
    filename: function(res, file, callback){
        callback(null, file.originalname);
    },
});

// upload parameters for multer for uploading images
const upload = multer({
    // multer will only accept files with these extensions
    storage: storage,
    limits:{
        fileSize: 1024* 1024* 3,
    },
});


// ALL GET routes
router.get("/", async(req,res,next)=>{

    res.locals.user = req.user;

    doc = await Room.find();
    
    if(!doc){
        return next(err);
    }

    if(req.isAuthenticated()){

        res.render('index', {room:doc});
    }else{ 
        res.render('index', {room:doc});
    }
});
 
router.get("/roomDetail/:id", async(req,res)=>{
    res.locals.user = req.user;

    const requestedRoomId= req.params.id;
    // const user=req.user._id;
    // console.log({user,requestedRoomId});
    // console.log(req.query);

    let room = await Room.findOne({_id: requestedRoomId});

    // const bookings= await Bookings.create(user);

    res.render('roomDetail', {rooms:room});
});


// bookings start here
router.get("/bookings/roomDetail/:id", async(req,res)=>{

    // RoomID
    const requestedRoomId= req.params.id;
    
    // user id and update DB with RoomID
    const doc = await User.findByIdAndUpdate(req.user._id, {
        $push: {
            room: requestedRoomId
        }
    });
    res.redirect('/Mybookings');
});

// payment route after viewing the room
router.get("/checkout-session/:id", async(req,res)=>{

    // /bookings/roomDetail/<%= rooms._id %>
    
    if(req.isAuthenticated()){
        const room = await Room.findById(req.params.id); 
        // console.log(room);

            const session = await stripe.checkout.sessions.create({

                line_items: [{
                      price_data: {
                        currency: 'ngn',
                        unit_amount: `${room.price}` *100,
                        product_data: {
                            name: `${room.title}`,
                            description: `${room.description}`,
                            images: [`https://hostel-management-app-c9ta.onrender.com/uploads/${room.roomImage}`]
                            // images: ['https://randomuser.me/api/portraits/med/men/46.jpg']
                          },
                      } ,
                    quantity: 1,
                  }],
                mode: 'payment',
                success_url: `${req.protocol}://${req.get('host')}/`,
                cancel_url: `${req.protocol}://${req.get('host')}/roomDetail/${req.params.id}`,
            });
            // console.log(session);
            // console.log(room.roomImage);
    }
    else{
        res.redirect('/login');
    }
});
// payment route ends here

router.get("/Mybookings", async(req,res)=>{

    // Get userId, populate with RoomDB
    let booked = 
    await User.findOne({_id: req.user._id})
    .populate({
        path:'room',
        model: Room
    });
    
    // Get room from RoomDB
    const bookedRoom= booked.room;

    res.render('Bookings',{myBooking:bookedRoom});

});
// bookings end here

router.get("/dashboard", async (req,res,next)=>{
    res.locals.user = req.user;

    if(req.isAuthenticated()){

        const allUsers=await User.find();

        const details= await User.findOne({_id: req.user._id})
        .populate({
            path:'room',
            model: Room
        });
 
        const myBookings = details.room;

        const room =await Room.find();
        // console.log(req.user);
        res.render('dashboard', {users:myBookings,rooms:room, allUser:allUsers });


    }else{ 
        res.redirect("/");
    }
    
});

router.get("/logout", (req,res,next)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
});

router.get("/signup", (req,res)=>{
    res.render('signup');
});

router.get("/login", (req,res)=>{
    res.render('login');
});
 
router.get("/newRoom", async(req,res)=>{

    res.locals.user = req.user;

    if(req.isAuthenticated()){
        res.render('newRoom');
        // res.render('dashboard', {users:details, rooms:room });

    }else{ 
        res.redirect("/login");
    }

});


// ALL POST routes
router.post("/signup", async(req,res,next)=>{

    // upload.single('photo'),

    // let userDetails = new User({
    //     fullname: req.body.fullname,
    //     username: req.body.username,
    //     email: req.body.email,
    //     dateOfBirth: req.body.dateOfBirth,
    //     photo: req.file.filename
    // });

    // User.register(userDetails, req.body.password, function(err, user){
    //     if(err){
    //         return next(err);
    //         res.redirect('/signup');
    //     }else{
    //         passport.authenticate('local')(req,res, function(){
    //             res.redirect('/');
    //         })
    //     }
    // })

    // try{
    //     const userData = await User.create(userDetails); 
    //     res.redirect('/');
    //     // next();
    // }catch(err){
    //     // console.log(err);
    //     res.render('404');
    // }
    
    // User.register({username: req.body.username}, req.body.password, function(err, user){
    
    User.register(
        {
            username: req.body.username,
            firstname: req.body.firstname,
            lastname: req.body.lastname
        }, 
        req.body.password, 
        function(err, user){
        if(err){
            return next(err);
            res.redirect('/signup');
        }else{
            passport.authenticate('local')(req,res, function(){
                res.redirect('/');
            })
        }
    })
});

router.post("/login",  (req,res)=>{
     
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    // console.log(user);

    req.login(user, function(err){
        if(err){
            return next(err);
        }
        else{
            passport.authenticate('local')(req,res, function(){
                res.redirect('/');
            })
        }
    })
});

router.post("/newRoom", upload.single('image'), async(req,res)=>{

    let roomDetails = ({
        roomImage: req.file.filename,
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        price: req.body.price,
        nearby: req.body.nearby,
        occupant: req.body.occupant
    });

    try{
        const newRoom = await Room.create(roomDetails); 
        res.redirect('/');
    }catch(err){
        // console.log(err);
        res.render('404');

    }

});

// API routes

module.exports = router;