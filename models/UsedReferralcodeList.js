const mongoose = require('mongoose');

const UsedReferralcodeListSchema = new mongoose.Schema(
  {
    player_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Players'
    },
    used_referral_code: {
      type: String,
      default: '',
    },
    friend_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Players'
    },
  },
  { collection: 'UsedReferralcodeList', timestamps: true }
);

const UsedReferralcodeList = mongoose.model('UsedReferralcodeList', UsedReferralcodeListSchema);

module.exports = UsedReferralcodeList;
