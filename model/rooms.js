const mongoose = require('mongoose');
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
    },
    available:{
        type: String,
        default: 'Available'
    }
});
 
const Room = mongoose.model('room', roomSchema);

module.exports=Room;
