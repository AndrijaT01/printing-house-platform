import mongoose from 'mongoose'

const Schema = mongoose.Schema

const Category = new Schema<any>({
    name: {
        type: String,
        required: true,
        unique: true
    },
    subcategories: {
        type: [String],
        default: []
    }
})

export default mongoose.model<any>('CategoryModel', Category, 'categories')
