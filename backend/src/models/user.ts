import mongoose from 'mongoose'

const Schema = mongoose.Schema

const User = new Schema<any>({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    profileImage: {
        type: String,
        default: 'default_profile_image.jpg'
    },
    role: {
        type: String,
        enum: ['person', 'company', 'printer', 'admin'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'rejected'],
        default: 'pending'
    },
    companyName: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    registrationNumber: {
        type: String,
        default: ''
    },
    taxNumber: {
        type: String,
        default: ''
    },
    resetToken: {
        type: String,
        default: ''
    },
    resetTokenExpires: {
        type: Date,
        default: null
    }
})

export default mongoose.model<any>('UserModel', User, 'users')
