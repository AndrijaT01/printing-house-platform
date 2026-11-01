import express from 'express'
import TenderModel from '../models/tender'
import ProductModel from '../models/product'
import OrderModel from '../models/order'

export class TenderController {

    createTender = (req: express.Request, res: express.Response) => {
        let companyId = req.body.companyId
        let companyUsername = req.body.companyUsername
        let companyName = req.body.companyName
        let companyRole = req.body.companyRole
        let items = req.body.items

        if (companyRole != 'company') {
            res.json({ message: 'Javnu nabavku moze otvoriti samo pravno lice', tender: null })
            return
        }

        if (!companyId || !companyUsername || !companyName ||
            !Array.isArray(items) || items.length == 0) {
            res.json({ message: 'Podaci za javnu nabavku nisu ispravni', tender: null })
            return
        }

        for (let item of items) {
            if (!item.productName || !Number.isInteger(Number(item.quantity)) ||
                Number(item.quantity) <= 0) {
                res.json({ message: 'Stavke javne nabavke nisu ispravne', tender: null })
                return
            }
        }

        let tender = new TenderModel({
            tenderCode: 'JN-' + Date.now(),
            companyId: companyId,
            companyUsername: companyUsername,
            companyName: companyName,
            items: items.map((item: any) => {
                return {
                    productName: item.productName,
                    quantity: Number(item.quantity),
                    color: item.color || 'Bela',
                    serviceType: item.serviceType || '',
                    printText: item.printText || '',
                    printImage: item.printImage || ''
                }
            }),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            status: 'open',
            bids: []
        })

        tender.save().then((savedTender: any) => {
            res.json({
                message: 'Javna nabavka je otvorena i traje 10 minuta',
                tender: savedTender
            })
        }).catch((error: any) => {
            console.log(error)
            res.json({ message: 'Greska prilikom otvaranja javne nabavke', tender: null })
        })
    }

    getCompanyTenders = async (req: express.Request, res: express.Response) => {
        try {
            let companyId = String(req.params.companyId)
            await this.finishExpiredTenders(companyId)
            let tenders = await TenderModel.find({ companyId: companyId })
                .sort({ createdAt: -1 })
            res.json(tenders)
        } catch (error) {
            console.log(error)
            res.json([])
        }
    }

    getOpenTenders = async (req: express.Request, res: express.Response) => {
        try {
            let tenders = await TenderModel.find({
                status: 'open',
                expiresAt: { $gt: new Date() }
            }).sort({ createdAt: -1 })
            res.json(tenders)
        } catch (error) {
            console.log(error)
            res.json([])
        }
    }

    submitBid = async (req: express.Request, res: express.Response) => {
        let tenderId = req.params.id
        let printerId = req.body.printerId
        let printerName = req.body.printerName
        let totalAmount = Number(req.body.totalAmount)

        if (!printerId || !printerName || isNaN(totalAmount) || totalAmount <= 0) {
            res.json({ message: 'Ponuda mora imati ispravan ukupan iznos' })
            return
        }

        try {
            let tender: any = await TenderModel.findOne({ _id: tenderId })

            if (tender == null) {
                res.json({ message: 'Javna nabavka nije pronadjena' })
                return
            }

            if (tender.status != 'open' || new Date(tender.expiresAt) <= new Date()) {
                res.json({ message: 'Vreme za slanje ponude je isteklo' })
                return
            }

            if (tender.bids.some((bid: any) => bid.printerId == printerId)) {
                res.json({ message: 'Stamparija je vec poslala ponudu za ovu nabavku' })
                return
            }

            let stockCheck = await this.checkPrinterStock(tender, printerId)

            if (!stockCheck.valid) {
                res.json({
                    message: 'Stamparija nema sve trazene proizvode, boje, usluge ili dovoljne kolicine'
                })
                return
            }

            tender.bids.push({
                printerId: printerId,
                printerName: printerName,
                totalAmount: totalAmount,
                offeredAt: new Date()
            })

            await tender.save()
            res.json({ message: 'Ponuda je uspesno poslata' })
        } catch (error) {
            console.log(error)
            res.json({ message: 'Greska prilikom slanja ponude' })
        }
    }

    private checkPrinterStock = async (tender: any, printerId: string) => {
        let products: any[] = await ProductModel.find({ printerId: printerId })
        let requestedByProduct: any = {}
        let matches: any[] = []

        for (let item of tender.items) {
            let product = products.find((candidate: any) => {
                let sameName = candidate.name.toLowerCase() == item.productName.toLowerCase()
                let hasColor = !item.color || candidate.colors.includes(item.color)
                let hasService = !item.serviceType || candidate.services.some((service: any) =>
                    service.type == item.serviceType
                )
                return sameName && hasColor && hasService
            })

            if (product == null) {
                return { valid: false, matches: [] }
            }

            let productId = product._id.toString()

            if (requestedByProduct[productId] == null) {
                requestedByProduct[productId] = 0
            }

            requestedByProduct[productId] += item.quantity

            if (requestedByProduct[productId] > product.stock) {
                return { valid: false, matches: [] }
            }

            matches.push({ product: product, item: item })
        }

        return { valid: true, matches: matches }
    }

    private finishExpiredTenders = async (companyId: string) => {
        let tenders: any[] = await TenderModel.find({
            companyId: companyId,
            status: 'open',
            expiresAt: { $lte: new Date() }
        })

        for (let tender of tenders) {
            let sortedBids = [...tender.bids].sort((first: any, second: any) =>
                first.totalAmount - second.totalAmount
            )
            let winningBid: any = null
            let winningStock: any = null

            for (let bid of sortedBids) {
                let stockCheck = await this.checkPrinterStock(tender, bid.printerId)

                if (stockCheck.valid) {
                    winningBid = bid
                    winningStock = stockCheck
                    break
                }
            }

            if (winningBid == null) {
                tender.status = 'no_offers'
                await tender.save()
                continue
            }

            let quantitiesToRemove: any = {}

            for (let match of winningStock.matches) {
                let productId = match.product._id.toString()

                if (quantitiesToRemove[productId] == null) {
                    quantitiesToRemove[productId] = 0
                }

                quantitiesToRemove[productId] += match.item.quantity
            }

            for (let productId of Object.keys(quantitiesToRemove)) {
                await ProductModel.updateOne(
                    { _id: productId },
                    { $inc: { stock: -quantitiesToRemove[productId] } }
                )
            }

            let totalQuantity = tender.items.reduce((sum: number, item: any) =>
                sum + item.quantity, 0
            )
            let averageUnitPrice = Math.round(
                winningBid.totalAmount / totalQuantity * 100
            ) / 100

            let order = new OrderModel({
                invoiceId: 'RAC-JN-' + Date.now(),
                clientId: tender.companyId,
                clientUsername: tender.companyUsername,
                printerId: winningBid.printerId,
                printerName: winningBid.printerName,
                city: winningStock.matches[0].product.city,
                items: tender.items.map((item: any, index: number) => {
                    return {
                        productId: winningStock.matches[index].product._id.toString(),
                        productName: item.productName,
                        quantity: item.quantity,
                        color: item.color,
                        serviceType: item.serviceType,
                        unitPrice: averageUnitPrice,
                        additionalPrice: 0,
                        printText: item.printText,
                        printImage: item.printImage
                    }
                }),
                totalAmount: winningBid.totalAmount,
                status: 'printing'
            })

            await order.save()

            tender.status = 'finished'
            tender.winnerPrinterId = winningBid.printerId
            tender.winnerPrinterName = winningBid.printerName
            tender.winningAmount = winningBid.totalAmount
            tender.orderId = order._id.toString()
            await tender.save()
        }
    }
}
