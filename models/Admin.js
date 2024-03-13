const mongoose = require('mongoose')

const adminSchema = mongoose.Schema({
    username: { type: String },
    email: { type: String },
    password: { type: String }
}, {
    collection: 'admins',
    timestamps: true
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
