import express from 'express'
import CategoryModel from '../models/category'

export class CategoryController {

    getAll = (req: express.Request, res: express.Response) => {
        CategoryModel.find({}).sort({ name: 1 }).then((categories) => {
            res.json(categories)
        }).catch((error: any) => {
            console.log(error)
            res.json([])
        })
    }

    addCategory = (req: express.Request, res: express.Response) => {
        let name = req.body.name

        if (!name) {
            res.json({ message: 'Unesite naziv kategorije' })
            return
        }

        CategoryModel.findOne({ name: name }).then((category) => {
            if (category != null) {
                res.json({ message: 'Kategorija vec postoji' })
                return
            }

            let newCategory = new CategoryModel({
                name: name,
                subcategories: []
            })

            newCategory.save().then(() => {
                res.json({ message: 'Kategorija je uspesno dodata' })
            }).catch((error: any) => {
                console.log(error)
                res.json({ message: 'Greska prilikom dodavanja kategorije' })
            })
        }).catch((error: any) => {
            console.log(error)
            res.json({ message: 'Greska prilikom provere kategorije' })
        })
    }

    addSubcategory = (req: express.Request, res: express.Response) => {
        let id = req.params.id
        let name = req.body.name

        if (!name) {
            res.json({ message: 'Unesite naziv potkategorije' })
            return
        }

        CategoryModel.findOne({ _id: id }).then((category) => {
            if (category == null) {
                res.json({ message: 'Kategorija nije pronadjena' })
                return
            }

            if (category.subcategories.includes(name)) {
                res.json({ message: 'Potkategorija vec postoji' })
                return
            }

            CategoryModel.updateOne(
                { _id: id },
                { $push: { subcategories: name } }
            ).then(() => {
                res.json({ message: 'Potkategorija je uspesno dodata' })
            }).catch((error: any) => {
                console.log(error)
                res.json({ message: 'Greska prilikom dodavanja potkategorije' })
            })
        }).catch((error: any) => {
            console.log(error)
            res.json({ message: 'Kategorija nije pronadjena' })
        })
    }
}
