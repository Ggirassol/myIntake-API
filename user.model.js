const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
    {
        _id: {
            type: Object,
            required: false
        },
        name:  {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true
        },
        createdAt: {
            type: String,
            required: true
        }
    }
)

const User = mongoose.model("User", userSchema);

module.exports = User;