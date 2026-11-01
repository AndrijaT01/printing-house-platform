import express from 'express'
import { TenderController } from '../controllers/tender.controller'

const tenderRouter = express.Router()

tenderRouter.route('/create').post(
    (req, res) => new TenderController().createTender(req, res)
)

tenderRouter.route('/company/:companyId').get(
    (req, res) => new TenderController().getCompanyTenders(req, res)
)

tenderRouter.route('/open').get(
    (req, res) => new TenderController().getOpenTenders(req, res)
)

tenderRouter.route('/:id/bid').post(
    (req, res) => new TenderController().submitBid(req, res)
)

export default tenderRouter
