const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create Schema
const ChildSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    gender: {
        type: String
    },
    age: {
        type: Number
    },
    town: {
        type: String
    },
    country: {
        type: String
    },
    donorId: [{
        type: String
    }],
    honoreeId: [{
        type: String
    }]
})

mongoose.model('childs',ChildSchema);