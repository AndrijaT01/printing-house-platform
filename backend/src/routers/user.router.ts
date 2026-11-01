import express from 'express'
import { UserController } from '../controllers/user.controller'

const userRouter = express.Router()

userRouter.route('/register').post(
    (req, res) => new UserController().register(req, res)
)

userRouter.route('/login').post(
    (req, res) => new UserController().login(req, res)
)

userRouter.route('/admin-login').post(
    (req, res) => new UserController().adminLogin(req, res)
)

userRouter.route('/pending').get(
    (req, res) => new UserController().getPendingUsers(req, res)
)

userRouter.route('/registration/:id').put(
    (req, res) => new UserController().changeRegistrationStatus(req, res)
)

userRouter.route('/all').get(
    (req, res) => new UserController().getAllUsers(req, res)
)

userRouter.route('/printer-count').get(
    (req, res) => new UserController().countPrinters(req, res)
)

userRouter.route('/forgot-password').post(
    (req, res) => new UserController().requestPasswordReset(req, res)
)

userRouter.route('/reset-password/:token').post(
    (req, res) => new UserController().resetPassword(req, res)
)

userRouter.route('/change-password/:id').put(
    (req, res) => new UserController().changePassword(req, res)
)

userRouter.route('/profile/:id')
    .get((req, res) => new UserController().getUser(req, res))
    .put((req, res) => new UserController().updateProfile(req, res))

userRouter.route('/:id').delete(
    (req, res) => new UserController().deleteUser(req, res)
)

export default userRouter
