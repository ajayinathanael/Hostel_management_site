// ROUTES -  /signup, /login, /logout, AUTHORIZATION - /dashboard, /newRoom, /bookRoom, */payment

const dotenv = require('dotenv');
const User = require('../model/hotel_users');
const {promisify} = require('util');
const Room = require('../model/rooms');
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
})


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

    let room = await Room.findOne({_id: requestedRoomId});

    res.render('roomDetail', {rooms:room});
});

router.get("/dashboard", async (req,res,next)=>{
    res.locals.user = req.user;

    if(req.isAuthenticated()){

        const details= await User.find();
        const room =await Room.find();
        res.render('dashboard', {users:details, rooms:room });

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

router.get("/newRoom", (req,res)=>{
    res.render('newRoom');
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

module.exports = router;
