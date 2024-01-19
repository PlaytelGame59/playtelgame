const mongoose = require('mongoose')

const playerSchema = mongoose.Schema({
    // player_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    // email, first_name, device_type, device_token, user_type
    // email: { type: String }, 
    // first_name: { type: String}, 

    device_type: { type: String}, 
    device_token: { type: String }, 
    // user_type: { type: Number },
    player_image: { type: String }, 
    // mobile: { type: String },
    amount: { type: String },

    // winningAmount: { type: String },
    // player_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' }, 

    name: { type: String }, 
    email: { type: String }, 
    mobileNo: { type: String },

    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    isApprove: { type: Boolean, default: true }, 

    walletAmount: { type: String, default: 0 },
    bonusWalletAmount: { type: String, default: 0 },


    
    // notificationTitle: { type: String },
    // notificationMessage: { type: String },
    // aadharImg: { type: String }
},{
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

const Player = mongoose.model("player", playerSchema)

module.exports = Player    
