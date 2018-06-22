const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create Schema
const HonoreeSchema = new Schema({
    title: {
        type: String,
        required: false
    },
    name:{
        type: String,
        required: true
    },
    address:{
        addr1:{
            type: String
        },
        addr2:{
            type: String
        },
        city:{
            type: String
        },
        state:{
            type:String
        },
        zip:{
            type: String
        }
    },
    email:{
        type: String
    },
    cardSent:{
        type: Boolean,
        default: false
    },
    anonymous:{
        type: Boolean,
        default: false
    },
    deceased:{
        type: Boolean,
        default: false
    }
})

mongoose.model('honorees',HonoreeSchema);