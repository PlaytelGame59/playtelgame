const mongoose = require('mongoose');

const DisclaimerSchema = new mongoose.Schema({
    
    disclaimer: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Disclaimer = mongoose.model('Disclaimer', DisclaimerSchema);

module.exports = Disclaimer;
