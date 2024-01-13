const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  redirectionUrl: {
        type: String,
        required: true
      },

  title: {
        type: String,
        default: ''
  },

  redirectTo: {
      type: String
  },
  
  bannerImage: {
    type: String,
  },
},{ collection: 'Banners', timestamps: true });

const Banners = mongoose.model('Banners', bannerSchema);

module.exports = Banners;

