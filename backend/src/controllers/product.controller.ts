import express from 'express'
import ProductModel from '../models/product'
import OrderModel from '../models/order'

export class ProductController {

    addProduct = (req: express.Request, res: express.Response) => {
        let product = req.body

        if (!product.code || !product.name || !product.description ||
            !product.category || !product.subcategory ||
            product.unitPrice == null || product.stock == null ||
            !product.printerId || !product.printerName || !product.city) {
            res.json({ message: 'Nisu uneti svi obavezni podaci' })
            return
        }

        if (product.unitPrice <= 0 || product.stock < 0) {
            res.json({ message: 'Cena mora biti veca od nule, a kolicina ne sme biti negativna' })
            return
        }

        ProductModel.findOne({
            code: product.code,
            printerId: product.printerId
        }).then((existingProduct) => {
            if (existingProduct != null) {
                res.json({ message: 'Proizvod sa tom sifrom vec postoji u stampariji' })
                return
            }

            delete product._id
            let newProduct = new ProductModel(product)

            newProduct.save().then(() => {
                res.json({ message: 'Proizvod je uspesno dodat' })
            }).catch((error: any) => {
                console.log(error)
                res.json({ message: 'Greska prilikom dodavanja proizvoda' })
            })
        }).catch((error: any) => {
            console.log(error)
            res.json({ message: 'Greska prilikom provere proizvoda' })
        })
    }

    getPrinterProducts = (req: express.Request, res: express.Response) => {
        let printerId = req.params.printerId

        ProductModel.find({ printerId: printerId })
            .select('-ratings -comments')
            .sort({ name: 1 }).then((products) => {
            res.json(products)
        }).catch((error: any) => {
            console.log(error)
            res.json([])
        })
    }

    updateStock = (req: express.Request, res: express.Response) => {
        let id = req.params.id
        let stock = Number(req.body.stock)

        if (isNaN(stock) || stock < 0) {
            res.json({ message: 'Kolicina ne sme biti negativna' })
            return
        }

        ProductModel.updateOne({ _id: id }, { stock: stock }).then((result) => {
            if (result.matchedCount == 0) {
                res.json({ message: 'Proizvod nije pronadjen' })
            } else {
                res.json({ message: 'Kolicina je uspesno azurirana' })
            }
        }).catch((error: any) => {
            console.log(error)
            res.json({ message: 'Greska prilikom azuriranja kolicine' })
        })
    }

    importProducts = (req: express.Request, res: express.Response) => {
        let data = req.body.data
        let printerId = req.body.printerId
        let printerName = req.body.printerName
        let city = req.body.city
        let printerAddress = req.body.printerAddress

        if (data == null || !Array.isArray(data.proizvodi) ||
            !printerId || !printerName || !city) {
            res.json({ message: 'JSON fajl nije u odgovarajucem formatu' })
            return
        }

        ProductModel.find({ printerId: printerId }).then((existingProducts) => {
            let existingCodes = existingProducts.map((product: any) => product.code)

            let productsToImport = data.proizvodi
                .filter((product: any) => !existingCodes.includes(product.sifra))
                .map((product: any) => {
                    return {
                        code: product.sifra,
                        name: product.naziv,
                        description: product.opis,
                        category: product.kategorija,
                        subcategory: product.potkategorija,
                        unitPrice: product.jedinicnaCena,
                        stock: product.kolicinaNaLageru,
                        colors: product.dostupneBoje || ['Bela'],
                        image: product.slikaUrl || '',
                        additionalImages: product.dodatneSlike || [],
                        services: (product.uslugeStampe || []).map((service: any) => {
                            return {
                                serviceId: service.idUsluge,
                                type: service.tipStampe,
                                additionalPrice: service.dodatnaCenaPoKomadu,
                                maxWidth: service.maxSirinaMm,
                                maxHeight: service.maxVisinaMm
                            }
                        }),
                        printerId: printerId,
                        printerName: printerName,
                        city: city,
                        printerAddress: printerAddress || '',
                        likes: 0,
                        dislikes: 0
                    }
                })

            if (productsToImport.length == 0) {
                res.json({ message: 'Svi proizvodi iz fajla vec postoje' })
                return
            }

            ProductModel.insertMany(productsToImport).then(() => {
                res.json({ message: `Uspesno je uvezeno proizvoda: ${productsToImport.length}` })
            }).catch((error: any) => {
                console.log(error)
                res.json({ message: 'Greska prilikom uvoza proizvoda' })
            })
        }).catch((error: any) => {
            console.log(error)
            res.json({ message: 'Greska prilikom provere postojecih proizvoda' })
        })
    }

    updateImage = (req: express.Request, res: express.Response) => {
        let id = req.params.id
        let image = req.body.image

        if (!image) {
            res.json({ message: 'Slika nije izabrana' })
            return
        }

        ProductModel.updateOne({ _id: id }, { image: image }).then((result) => {
            if (result.matchedCount == 0) {
                res.json({ message: 'Proizvod nije pronadjen' })
            } else {
                res.json({ message: 'Slika je uspesno dodata' })
            }
        }).catch((error: any) => {
            console.log(error)
            res.json({ message: 'Greska prilikom dodavanja slike' })
        })
    }

    updateAdditionalImages = (req: express.Request, res: express.Response) => {
        let id = req.params.id
        let images = req.body.images

        if (!Array.isArray(images) || images.length > 3 ||
            images.some((image: any) => typeof image != 'string' ||
                !image.startsWith('data:image'))) {
            res.json({ message: 'Moguce je dodati najvise tri ispravne slike' })
            return
        }

        ProductModel.updateOne({ _id: id }, { additionalImages: images }).then((result) => {
            if (result.matchedCount == 0) {
                res.json({ message: 'Proizvod nije pronadjen' })
            } else {
                res.json({ message: 'Dodatne slike su uspesno sacuvane' })
            }
        }).catch((error: any) => {
            console.log(error)
            res.json({ message: 'Greska prilikom cuvanja dodatnih slika' })
        })
    }

    search = (req: express.Request, res: express.Response) => {
        let name = String(req.query.name || '')
        let category = String(req.query.category || '')
        let conditions: any = { stock: { $gt: 0 } }

        if (name != '') {
            conditions.name = { $regex: name, $options: 'i' }
        }

        if (category != '') {
            conditions.category = category
        }

        ProductModel.find(conditions).select('-ratings -comments').then((products) => {
            res.json(products)
        }).catch((error: any) => {
            console.log(error)
            res.json([])
        })
    }

    getProduct = (req: express.Request, res: express.Response) => {
        let id = req.params.id

        ProductModel.findOne({ _id: id }).select('-ratings').then((product) => {
            res.json(product)
        }).catch((error: any) => {
            console.log(error)
            res.json(null)
        })
    }

    getTopFive = (req: express.Request, res: express.Response) => {
        ProductModel.find({ stock: { $gt: 0 } })
            .select('-ratings -comments')
            .sort({ likes: -1 })
            .limit(5)
            .then((products) => {
                res.json(products)
            }).catch((error: any) => {
                console.log(error)
                res.json([])
            })
    }

    getActiveCategories = (req: express.Request, res: express.Response) => {
        ProductModel.distinct('category', { stock: { $gt: 0 } }).then((categories) => {
            res.json(categories.sort())
        }).catch((error: any) => {
            console.log(error)
            res.json([])
        })
    }

    rateProduct = async (req: express.Request, res: express.Response) => {
        let productId = req.params.id
        let clientId = req.body.clientId
        let value = req.body.value

        if (!clientId || (value != 'like' && value != 'dislike')) {
            res.json({ message: 'Ocena nije ispravna' })
            return
        }

        try {
            let receivedOrder = await OrderModel.findOne({
                clientId: clientId,
                status: 'received',
                'items.productId': productId
            })

            if (receivedOrder == null) {
                res.json({ message: 'Mozete oceniti samo primljen proizvod' })
                return
            }

            let product: any = await ProductModel.findOne({ _id: productId })

            if (product == null) {
                res.json({ message: 'Proizvod nije pronadjen' })
                return
            }

            let existingRating = product.ratings.find((rating: any) =>
                rating.clientId == clientId
            )

            if (existingRating != null && existingRating.value == value) {
                res.json({ message: 'Vec ste izabrali tu ocenu' })
                return
            }

            if (existingRating != null) {
                if (existingRating.value == 'like') {
                    product.likes = Math.max(0, product.likes - 1)
                } else {
                    product.dislikes = Math.max(0, product.dislikes - 1)
                }
                existingRating.value = value
            } else {
                product.ratings.push({ clientId: clientId, value: value })
            }

            if (value == 'like') {
                product.likes += 1
            } else {
                product.dislikes += 1
            }

            await product.save()
            res.json({ message: 'Ocena je sacuvana' })
        } catch (error) {
            console.log(error)
            res.json({ message: 'Greska prilikom ocenjivanja proizvoda' })
        }
    }

    addComment = async (req: express.Request, res: express.Response) => {
        let productId = req.params.id
        let clientId = req.body.clientId
        let username = req.body.username
        let text = String(req.body.text || '').trim()

        if (!clientId || !username || text == '') {
            res.json({ message: 'Komentar ne sme biti prazan' })
            return
        }

        if (text.length > 500) {
            res.json({ message: 'Komentar moze imati najvise 500 karaktera' })
            return
        }

        try {
            let receivedOrder = await OrderModel.findOne({
                clientId: clientId,
                status: 'received',
                'items.productId': productId
            })

            if (receivedOrder == null) {
                res.json({ message: 'Mozete komentarisati samo primljen proizvod' })
                return
            }

            let product: any = await ProductModel.findOne({ _id: productId })

            if (product == null) {
                res.json({ message: 'Proizvod nije pronadjen' })
                return
            }

            product.comments.push({
                clientId: clientId,
                username: username,
                text: text,
                date: new Date()
            })

            await product.save()
            res.json({ message: 'Komentar je dodat' })
        } catch (error) {
            console.log(error)
            res.json({ message: 'Greska prilikom dodavanja komentara' })
        }
    }
}
