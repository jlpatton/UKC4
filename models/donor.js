const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create Schema
const DonorSchema = new Schema({
    stripeId:[
        {
            type: String
    }
    ],
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
            type: String
        },
        zip:{
            type: String
        }
    },
    email:{
        type: String
    },
    phone:{
        type: String        
    },
    newsletter:{
        type: Boolean,
        default: false
    },
    donatingAs: {
        title: {
            type: String
        },
        name:{
            type: String
        }
    }
})



mongoose.model('donors',DonorSchema);