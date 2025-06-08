const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required:true,
    },
    username: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    list: [
        {
        type:mongoose.Types.ObjectId,
        ref: "List",
    },
],
    authProvider: {
        type: String,
        enum: ['local', 'google', 'github'],
        default: 'local'
    },
    authProviderId: String
},
{
    timestamps:true
});
// Add comparePassword method to the schema
UserSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password)
    } catch (error) {
        throw new Error('Password comparison failed')
    }
}
module.exports = mongoose.model("User",UserSchema)