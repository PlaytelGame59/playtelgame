const mongoose = require('mongoose');

const AdharKYCSchema = new mongoose.Schema({
    player_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Players'
    },
    type: {
        type: String,
        default: ''
    },
    aadhar_front_image: {
        type: String, // Assuming you store the image path or URL as a string
        default: ''    
    },
    aadhar_back_image: {
        type: String, // Assuming you store the image path or URL as a string
        default: ''    
    },
    aadhar_no: {
        type: String, // Assuming you store the image path or URL as a string
        default: ''    
    },
    status: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const AdharKYC = mongoose.model('AdharKYC', AdharKYCSchema);

module.exports = AdharKYC;
