import express from 'express'
import OrderModel from '../models/order'
import ProductModel from '../models/product'

export class OrderController {

    createOrders = async (req: express.Request, res: express.Response) => {
        let clientId = req.body.clientId
        let clientUsername = req.body.clientUsername
        let clientRole = req.body.clientRole
        let items = req.body.items

        if (!clientId || !clientUsername || !Array.isArray(items) || items.length == 0) {
            res.json({ message: 'Korpa je prazna ili podaci o kupcu nisu ispravni', orders: [] })
            return
        }

        if (clientRole != 'person') {
            res.json({ message: 'Poslovni korisnici narucuju putem javne nabavke', orders: [] })
            return
        }

        try {
            let checkedItems: any[] = []

            for (let item of items) {
                let quantity = Number(item.quantity)
                let product: any = await ProductModel.findOne({ _id: item.productId })

                if (product == null) {
                    res.json({ message: `Proizvod ${item.productName} vise ne postoji`, orders: [] })
                    return
                }

                if (!Number.isInteger(quantity) || quantity <= 0 || product.stock < quantity) {
                    res.json({
                        message: `Nema dovoljno proizvoda ${product.name} na lageru`,
                        orders: []
                    })
                    return
                }

                let selectedService = product.services.find((service: any) =>
                    service.type == item.serviceType
                )
                let additionalPrice = selectedService == null ? 0 : selectedService.additionalPrice

                checkedItems.push({
                    productId: product._id.toString(),
                    productName: product.name,
                    quantity: quantity,
                    color: item.color || product.colors[0] || 'Bela',
                    serviceType: selectedService == null ? '' : selectedService.type,
                    unitPrice: product.unitPrice,
                    additionalPrice: additionalPrice,
                    printText: item.printText || '',
                    printImage: item.printImage || '',
                    printerId: product.printerId,
                    printerName: product.printerName,
                    city: product.city,
                    availableStock: product.stock
                })
            }

            let requestedQuantities: any = {}

            for (let item of checkedItems) {
                if (requestedQuantities[item.productId] == null) {
                    requestedQuantities[item.productId] = 0
                }

                requestedQuantities[item.productId] += item.quantity

                if (requestedQuantities[item.productId] > item.availableStock) {
                    res.json({
                        message: `Nema dovoljno proizvoda ${item.productName} na lageru`,
                        orders: []
                    })
                    return
                }
            }

            let groups: any = {}

            for (let item of checkedItems) {
                if (groups[item.printerId] == null) {
                    groups[item.printerId] = []
                }

                groups[item.printerId].push(item)
            }

            let createdOrders: any[] = []

            for (let printerId of Object.keys(groups)) {
                let group = groups[printerId]
                let invoiceId = 'RAC-' + Date.now() + '-' + (createdOrders.length + 1)
                let totalAmount = group.reduce((sum: number, item: any) => {
                    return sum + (item.unitPrice + item.additionalPrice) * item.quantity
                }, 0)

                let order = new OrderModel({
                    invoiceId: invoiceId,
                    clientId: clientId,
                    clientUsername: clientUsername,
                    printerId: printerId,
                    printerName: group[0].printerName,
                    city: group[0].city,
                    items: group.map((item: any) => {
                        return {
                            productId: item.productId,
                            productName: item.productName,
                            quantity: item.quantity,
                            color: item.color,
                            serviceType: item.serviceType,
                            unitPrice: item.unitPrice,
                            additionalPrice: item.additionalPrice,
                            printText: item.printText,
                            printImage: item.printImage
                        }
                    }),
                    totalAmount: totalAmount,
                    status: 'ordered'
                })

                await order.save()
                createdOrders.push(order)
            }

            for (let item of checkedItems) {
                await ProductModel.updateOne(
                    { _id: item.productId },
                    { $inc: { stock: -item.quantity } }
                )
            }

            res.json({
                message: `Kupovina je uspesna. Kreirano racuna: ${createdOrders.length}`,
                orders: createdOrders
            })
        } catch (error) {
            console.log(error)
            res.json({ message: 'Greska prilikom kreiranja porudzbine', orders: [] })
        }
    }

    getClientOrders = (req: express.Request, res: express.Response) => {
        OrderModel.find({ clientId: req.params.clientId })
            .sort({ orderDate: -1 })
            .then((orders) => res.json(orders))
            .catch((error: any) => {
                console.log(error)
                res.json([])
            })
    }

    getPrinterOrders = (req: express.Request, res: express.Response) => {
        OrderModel.find({
            printerId: req.params.printerId,
            status: { $ne: 'cancelled' }
        })
            .sort({ orderDate: -1 })
            .then((orders) => res.json(orders))
            .catch((error: any) => {
                console.log(error)
                res.json([])
            })
    }

    getArchive = async (req: express.Request, res: express.Response) => {
        let clientId = String(req.params.clientId)

        try {
            let orders: any[] = await OrderModel.find({
                clientId: clientId,
                status: { $in: ['delivered', 'received'] }
            }).sort({ orderDate: -1 })

            let productIds: string[] = []

            for (let order of orders) {
                for (let item of order.items) {
                    if (!productIds.includes(item.productId)) {
                        productIds.push(item.productId)
                    }
                }
            }

            let products: any[] = await ProductModel.find({ _id: { $in: productIds } })
                .select('_id ratings')
            let archiveItems: any[] = []

            for (let order of orders) {
                for (let item of order.items) {
                    let product = products.find((currentProduct: any) =>
                        currentProduct._id.toString() == item.productId
                    )
                    let rating = product == null ? null : product.ratings.find((currentRating: any) =>
                        currentRating.clientId == clientId
                    )

                    archiveItems.push({
                        orderId: order._id.toString(),
                        invoiceId: order.invoiceId,
                        productId: item.productId,
                        productName: item.productName,
                        quantity: item.quantity,
                        printerName: order.printerName,
                        city: order.city,
                        status: order.status,
                        orderDate: order.orderDate,
                        userRating: rating == null ? '' : rating.value
                    })
                }
            }

            res.json(archiveItems)
        } catch (error) {
            console.log(error)
            res.json([])
        }
    }

    cancelOrder = async (req: express.Request, res: express.Response) => {
        let id = req.params.id
        let clientId = req.body.clientId

        try {
            let order: any = await OrderModel.findOne({ _id: id, clientId: clientId })

            if (order == null) {
                res.json({ message: 'Porudzbina nije pronadjena' })
                return
            }

            if (order.status != 'ordered') {
                res.json({ message: 'Moze se otkazati samo porudzbina koja jos nije u stampi' })
                return
            }

            for (let item of order.items) {
                await ProductModel.updateOne(
                    { _id: item.productId },
                    { $inc: { stock: item.quantity } }
                )
            }

            order.status = 'cancelled'
            await order.save()
            res.json({ message: 'Porudzbina je otkazana, a proizvodi su vraceni na lager' })
        } catch (error) {
            console.log(error)
            res.json({ message: 'Greska prilikom otkazivanja porudzbine' })
        }
    }

    changeStatus = (req: express.Request, res: express.Response) => {
        let id = req.params.id
        let newStatus = req.body.status
        let nextStatus: any = {
            ordered: 'printing',
            printing: 'delivered',
            delivered: 'received'
        }

        OrderModel.findOne({ _id: id }).then((order: any) => {
            if (order == null) {
                res.json({ message: 'Porudzbina nije pronadjena' })
                return
            }

            if (nextStatus[order.status] != newStatus) {
                res.json({ message: 'Nije dozvoljena ta promena statusa' })
                return
            }

            OrderModel.updateOne({ _id: id }, { status: newStatus }).then(() => {
                res.json({ message: 'Status porudzbine je uspesno promenjen' })
            }).catch((error: any) => {
                console.log(error)
                res.json({ message: 'Greska prilikom promene statusa' })
            })
        }).catch((error: any) => {
            console.log(error)
            res.json({ message: 'Greska prilikom pronalazenja porudzbine' })
        })
    }
}
