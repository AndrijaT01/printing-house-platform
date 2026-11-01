import mongoose from 'mongoose'

const Schema = mongoose.Schema

const PrintService = new Schema<any>({
    serviceId: String,
    type: String,
    additionalPrice: Number,
    maxWidth: Number,
    maxHeight: Number
}, { _id: false })

const ProductRating = new Schema<any>({
    clientId: String,
    value: String
}, { _id: false })

const ProductComment = new Schema<any>({
    clientId: String,
    username: String,
    text: String,
    date: {
        type: Date,
        default: Date.now
    }
}, { _id: false })

const Product = new Schema<any>({
    code: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    subcategory: {
        type: String,
        required: true
    },
    unitPrice: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    colors: {
        type: [String],
        default: ['Bela']
    },
    image: {
        type: String,
        default: ''
    },
    additionalImages: {
        type: [String],
        default: []
    },
    services: {
        type: [PrintService],
        default: []
    },
    printerId: {
        type: String,
        required: true
    },
    printerName: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    printerAddress: {
        type: String,
        default: ''
    },
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    },
    ratings: {
        type: [ProductRating],
        default: []
    },
    comments: {
        type: [ProductComment],
        default: []
    }
})

export default mongoose.model<any>('ProductModel', Product, 'products')
