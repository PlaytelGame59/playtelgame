const mongoose = require('mongoose');

const PanKYCSchema = new mongoose.Schema({
    player_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Players'
    },
    type: {
        type: String,
        default: ''
    },
    pan_image: {
        type: String, // Assuming you store the image path or URL as a string
        default: ''    
    },
    pan_no: {
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

const PanKYC = mongoose.model('PanKYC', PanKYCSchema);

module.exports = PanKYC;