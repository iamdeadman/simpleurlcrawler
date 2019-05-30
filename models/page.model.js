const mongoose = require("mongoose");

const PageSchema = new mongoose.Schema({
    baseUrl: String,
    status: String,
    related: [{
        url: String,
        title: String
    }]
}, {usePushEach: true});

module.exports = mongoose.model('Page', PageSchema);