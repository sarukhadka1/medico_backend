const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    doctorName: {
        type: String,
        required: true  
    },
    doctorSpecialization: {
        type: String,
        required: true,
    },
    doctorFees: {
        type: Number,
        required: true,
    },
    doctorDescription: {
        type: String,
        required: true,
        maxLength: 500
    },
    doctorImage: {
        type: String,
        required: true,
        default:null
    },
    createdAt: {
        type: Date,
        default: Date.now  
    }
});

const Doctor = mongoose.model('doctors', doctorSchema);

module.exports = Doctor;
