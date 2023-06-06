const mongoose = require('mongoose');
const validator = require('validator');
 
// MODEL
const roomSchema = new mongoose.Schema({
    
    roomImage: {
        type: String,
        default: 'default.jpg'
    },
    title: String,
    description: {
        type: String
    },
    location: {
        type: String
    },
    price:{
        type: Number
    },
    nearby: {
        type: String,
    },
    occupant: { 
        type: String,
    }
});
 
const Room = mongoose.model('room', roomSchema);

module.exports=Room;
