const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create Schema
const DonationSchema = new Schema({
    dType: {
        type: String,
        required: true
    },
    amount:{
        type: Number,
        required: true
    },
    dDate: {
        type: Date,
        default: Date.now
    },
    stripeId:[
        {
            type: String
    }
    ],
    donorId: {
        type: String
    },
    honoreeId: {
        type: String
    },
    childId:[
        {
            type: String
    }
    ],
    anonymous:{
        type: Boolean,
        default: false
    }
})



mongoose.model('donations',DonationSchema);