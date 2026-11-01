import express from 'express'
import { OrderController } from '../controllers/order.controller'

const orderRouter = express.Router()

orderRouter.route('/create').post(
    (req, res) => new OrderController().createOrders(req, res)
)

orderRouter.route('/client/:clientId').get(
    (req, res) => new OrderController().getClientOrders(req, res)
)

orderRouter.route('/printer/:printerId').get(
    (req, res) => new OrderController().getPrinterOrders(req, res)
)

orderRouter.route('/archive/:clientId').get(
    (req, res) => new OrderController().getArchive(req, res)
)

orderRouter.route('/cancel/:id').put(
    (req, res) => new OrderController().cancelOrder(req, res)
)

orderRouter.route('/status/:id').put(
    (req, res) => new OrderController().changeStatus(req, res)
)

export default orderRouter
