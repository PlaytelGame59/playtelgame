const mongoose = require('mongoose')

const noticeSchema = mongoose.Schema({ 
    message: { type: String, required: true }
})

const NoticeModel = mongoose.model('notice', noticeSchema)


module.exports = { NoticeModel }