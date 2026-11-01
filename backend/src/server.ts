import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import userRouter from './routers/user.router'
import productRouter from './routers/product.router'
import categoryRouter from './routers/category.router'
import orderRouter from './routers/order.router'
import tenderRouter from './routers/tender.router'

const app = express()

app.use(cors())
app.use(express.json({ limit: '5mb' }))

mongoose.connect('mongodb://127.0.0.1:27017/printing_house')

const connection = mongoose.connection

connection.once('open', () => {
    console.log('MongoDB connection established successfully')
})

connection.on('error', (error) => {
    console.log(error)
})

app.use('/users', userRouter)
app.use('/products', productRouter)
app.use('/categories', categoryRouter)
app.use('/orders', orderRouter)
app.use('/tenders', tenderRouter)

app.get('/', (req, res) => {
    res.send('Printing House backend is running')
})

app.listen(4000, () => console.log('Express running on port 4000!'))
