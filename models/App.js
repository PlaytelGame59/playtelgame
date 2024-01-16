const mongoose = require('mongoose');

const AppSchema = new mongoose.Schema({
    version_control: {
        type: String
    },
    joining_link: {
        type: String
    }
}, {
    collection: 'App',
    timestamps: true
});

const App = mongoose.model('App', AppSchema);

module.exports = App;