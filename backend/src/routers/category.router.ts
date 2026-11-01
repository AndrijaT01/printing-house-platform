import express from 'express'
import { CategoryController } from '../controllers/category.controller'

const categoryRouter = express.Router()

categoryRouter.route('/').get(
    (req, res) => new CategoryController().getAll(req, res)
)

categoryRouter.route('/add').post(
    (req, res) => new CategoryController().addCategory(req, res)
)

categoryRouter.route('/subcategory/:id').put(
    (req, res) => new CategoryController().addSubcategory(req, res)
)

export default categoryRouter
