import express from 'express'
import { ProductController } from '../controllers/product.controller'

const productRouter = express.Router()

productRouter.route('/add').post(
    (req, res) => new ProductController().addProduct(req, res)
)

productRouter.route('/import').post(
    (req, res) => new ProductController().importProducts(req, res)
)

productRouter.route('/search').get(
    (req, res) => new ProductController().search(req, res)
)

productRouter.route('/top-five').get(
    (req, res) => new ProductController().getTopFive(req, res)
)

productRouter.route('/active-categories').get(
    (req, res) => new ProductController().getActiveCategories(req, res)
)

productRouter.route('/printer/:printerId').get(
    (req, res) => new ProductController().getPrinterProducts(req, res)
)

productRouter.route('/stock/:id').put(
    (req, res) => new ProductController().updateStock(req, res)
)

productRouter.route('/image/:id').put(
    (req, res) => new ProductController().updateImage(req, res)
)

productRouter.route('/additional-images/:id').put(
    (req, res) => new ProductController().updateAdditionalImages(req, res)
)

productRouter.route('/rate/:id').post(
    (req, res) => new ProductController().rateProduct(req, res)
)

productRouter.route('/comment/:id').post(
    (req, res) => new ProductController().addComment(req, res)
)

productRouter.route('/:id').get(
    (req, res) => new ProductController().getProduct(req, res)
)

export default productRouter
