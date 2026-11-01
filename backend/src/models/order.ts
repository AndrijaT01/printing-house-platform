import mongoose from 'mongoose'

const Schema = mongoose.Schema

const OrderItem = new Schema<any>({
    productId: String,
    productName: String,
    quantity: Number,
    color: String,
    serviceType: String,
    unitPrice: Number,
    additionalPrice: Number,
    printText: String,
    printImage: String
}, { _id: false })

const Order = new Schema<any>({
    invoiceId: {
        type: String,
        required: true
    },
    clientId: {
        type: String,
        required: true
    },
    clientUsername: {
        type: String,
        required: true
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
    items: {
        type: [OrderItem],
        default: []
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['ordered', 'printing', 'delivered', 'received', 'cancelled'],
        default: 'ordered'
    },
    orderDate: {
        type: Date,
        default: Date.now
    }
})

export default mongoose.model<any>('OrderModel', Order, 'orders')
