import mongoose from 'mongoose'

const Schema = mongoose.Schema

const TenderItem = new Schema<any>({
    productName: String,
    quantity: Number,
    color: String,
    serviceType: String,
    printText: String,
    printImage: String
}, { _id: false })

const TenderBid = new Schema<any>({
    printerId: String,
    printerName: String,
    totalAmount: Number,
    offeredAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false })

const Tender = new Schema<any>({
    tenderCode: {
        type: String,
        required: true,
        unique: true
    },
    companyId: {
        type: String,
        required: true
    },
    companyUsername: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    items: {
        type: [TenderItem],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'finished', 'no_offers'],
        default: 'open'
    },
    bids: {
        type: [TenderBid],
        default: []
    },
    winnerPrinterId: {
        type: String,
        default: ''
    },
    winnerPrinterName: {
        type: String,
        default: ''
    },
    winningAmount: {
        type: Number,
        default: 0
    },
    orderId: {
        type: String,
        default: ''
    }
})

export default mongoose.model<any>('TenderModel', Tender, 'tenders')
