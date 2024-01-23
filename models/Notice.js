const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  message: {
        type: String,
        default: ''
  }
},{ collection: 'Notice', timestamps: true });

const Notice = mongoose.model('Notice', noticeSchema);

module.exports = Notice;

