const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');

// MODEL
const userSchema = new mongoose.Schema({

    // fullname: {
    //     type: String,
    //     required: [true, 'Please tell us your fullname!']
    // },   
    // username: {
    //     type: String,
    //     required: [true, 'Please choose a username!']
    // },
    
    email:String,
    password: {
        type: String,
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    role: {
        type: String,
        default: 'customer'
    }
});
 
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = mongoose.model('hotel_users', userSchema);

module.exports=User;
