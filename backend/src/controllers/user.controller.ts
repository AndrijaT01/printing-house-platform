import express from 'express'
import { createHash, randomBytes } from 'crypto'
import UserModel from '../models/user'

export class UserController {

    register = (req: express.Request, res: express.Response) => {
        let username = req.body.username
        let password = req.body.password
        let firstName = req.body.firstName
        let lastName = req.body.lastName
        let phone = req.body.phone
        let email = req.body.email
        let profileImage = req.body.profileImage
        let role = req.body.role
        let companyName = req.body.companyName
        let address = req.body.address
        let city = req.body.city
        let registrationNumber = req.body.registrationNumber
        let taxNumber = req.body.taxNumber

        if (!username || !password || !firstName || !lastName || !phone || !email || !role) {
            res.json({ message: 'Nisu uneti svi obavezni podaci' })
            return
        }

        if (!['person', 'company', 'printer'].includes(role)) {
            res.json({ message: 'Neispravan tip korisnika' })
            return
        }

        let passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z].{7,11}$/

        if (!passwordRegex.test(password)) {
            res.json({ message: 'Lozinka nije u dobrom formatu' })
            return
        }

        if (role == 'company' || role == 'printer') {
            if (!companyName || !address || !city || !registrationNumber || !taxNumber) {
                res.json({ message: 'Nisu uneti svi podaci o instituciji' })
                return
            }

            if (!/^\d{8}$/.test(registrationNumber)) {
                res.json({ message: 'Maticni broj mora imati tacno 8 cifara' })
                return
            }

            if (!/^[1-9]\d{8}$/.test(taxNumber)) {
                res.json({ message: 'PIB mora imati 9 cifara i ne sme pocinjati nulom' })
                return
            }
        }

        let conditions: any[] = [
            { username: username },
            { email: email }
        ]

        if (role == 'company' || role == 'printer') {
            conditions.push({ registrationNumber: registrationNumber })
            conditions.push({ taxNumber: taxNumber })
        }

        UserModel.findOne({ $or: conditions }).then((user) => {
            if (user != null) {
                res.json({ message: 'Korisnicko ime, email, maticni broj ili PIB vec postoji' })
                return
            }

            let encryptedPassword = createHash('sha256').update(password).digest('hex')

            let newUser = new UserModel({
                username: username,
                password: encryptedPassword,
                firstName: firstName,
                lastName: lastName,
                phone: phone,
                email: email,
                profileImage: profileImage || 'default_profile_image.jpg',
                role: role,
                status: 'pending',
                companyName: companyName || '',
                address: address || '',
                city: city || '',
                registrationNumber: registrationNumber || '',
                taxNumber: taxNumber || ''
            })

            newUser.save().then(() => {
                res.json({ message: 'Zahtev za registraciju je uspesno poslat' })
            }).catch((error: any) => {
                console.log(error)
                res.json({ message: 'Greska prilikom registracije' })
            })
        }).catch((error: any) => {
            console.log(error)
            res.json({ message: 'Greska prilikom registracije' })
        })
    }

    login = (req: express.Request, res: express.Response) => {
        let username = req.body.username
        let password = req.body.password

        if (!username || !password) {
            res.json(null)
            return
        }

        let encryptedPassword = createHash('sha256').update(password).digest('hex')

        UserModel.findOne({
            username: username,
            password: encryptedPassword,
            status: 'active',
            role: { $ne: 'admin' }
        }).select('-password -resetToken -resetTokenExpires').then((user) => {
            res.json(user)
        }).catch((error: any) => {
            console.log(error)
            res.json(null)
        })
    }

    adminLogin = (req: express.Request, res: express.Response) => {
        let username = req.body.username
        let password = req.body.password

        if (!username || !password) {
            res.json(null)
            return
        }

        let encryptedPassword = createHash('sha256').update(password).digest('hex')

        UserModel.findOne({
            username: username,
            password: encryptedPassword,
            status: 'active',
            role: 'admin'
        }).select('-password -resetToken -resetTokenExpires').then((user) => {
            res.json(user)
        }).catch((error: any) => {
            console.log(error)
            res.json(null)
        })
    }

    getPendingUsers = (req: express.Request, res: express.Response) => {
        UserModel.find({ status: 'pending' })
            .select('-password -resetToken -resetTokenExpires').then((users) => {
            res.json(users)
        }).catch((error: any) => {
            console.log(error)
            res.json([])
        })
    }

    changeRegistrationStatus = (req: express.Request, res: express.Response) => {
        let id = req.params.id
        let status = req.body.status

        if (status != 'active' && status != 'rejected') {
            res.json({ message: 'Neispravan status' })
            return
        }

        UserModel.updateOne({ _id: id }, { status: status }).then((result) => {
            if (result.matchedCount == 0) {
                res.json({ message: 'Korisnik nije pronadjen' })
            } else {
                res.json({ message: 'Status je uspesno promenjen' })
            }
        }).catch((error: any) => {
            console.log(error)
            res.json({ message: 'Greska prilikom promene statusa' })
        })
    }

    getAllUsers = (req: express.Request, res: express.Response) => {
        UserModel.find({
            role: { $ne: 'admin' },
            status: { $ne: 'pending' }
        }).select('-password -resetToken -resetTokenExpires').then((users) => {
            res.json(users)
        }).catch((error: any) => {
            console.log(error)
            res.json([])
        })
    }

    getUser = (req: express.Request, res: express.Response) => {
        let id = req.params.id

        UserModel.findOne({ _id: id })
            .select('-password -resetToken -resetTokenExpires').then((user) => {
            res.json(user)
        }).catch((error: any) => {
            console.log(error)
            res.json(null)
        })
    }

    updateProfile = (req: express.Request, res: express.Response) => {
        let id = req.params.id
        let firstName = req.body.firstName
        let lastName = req.body.lastName
        let phone = req.body.phone
        let email = req.body.email
        let profileImage = req.body.profileImage
        let companyName = req.body.companyName
        let address = req.body.address
        let city = req.body.city
        let registrationNumber = req.body.registrationNumber
        let taxNumber = req.body.taxNumber

        if (!firstName || !lastName || !phone || !email) {
            res.json({ message: 'Nisu uneti svi obavezni podaci' })
            return
        }

        UserModel.findOne({ _id: id }).then((user) => {
            if (user == null) {
                res.json({ message: 'Korisnik nije pronadjen' })
                return
            }

            if (user.role == 'company' || user.role == 'printer') {
                if (!companyName || !address || !city || !registrationNumber || !taxNumber) {
                    res.json({ message: 'Nisu uneti svi podaci o instituciji' })
                    return
                }

                if (!/^\d{8}$/.test(registrationNumber)) {
                    res.json({ message: 'Maticni broj mora imati tacno 8 cifara' })
                    return
                }

                if (!/^[1-9]\d{8}$/.test(taxNumber)) {
                    res.json({ message: 'PIB mora imati 9 cifara i ne sme pocinjati nulom' })
                    return
                }
            }

            let conditions: any[] = [{ email: email }]

            if (user.role == 'company' || user.role == 'printer') {
                conditions.push({ registrationNumber: registrationNumber })
                conditions.push({ taxNumber: taxNumber })
            }

            UserModel.findOne({
                _id: { $ne: id },
                $or: conditions
            }).then((existingUser) => {
                if (existingUser != null) {
                    res.json({ message: 'Email, maticni broj ili PIB vec postoji' })
                    return
                }

                UserModel.updateOne({ _id: id }, {
                    firstName: firstName,
                    lastName: lastName,
                    phone: phone,
                    email: email,
                    profileImage: profileImage || user.profileImage,
                    companyName: companyName || '',
                    address: address || '',
                    city: city || '',
                    registrationNumber: registrationNumber || '',
                    taxNumber: taxNumber || ''
                }).then(() => {
                    res.json({ message: 'Podaci su uspesno azurirani' })
                }).catch((error: any) => {
                    console.log(error)
                    res.json({ message: 'Greska prilikom azuriranja' })
                })
            }).catch((error: any) => {
                console.log(error)
                res.json({ message: 'Greska prilikom provere podataka' })
            })
        }).catch((error: any) => {
            console.log(error)
            res.json({ message: 'Korisnik nije pronadjen' })
        })
    }

    deleteUser = (req: express.Request, res: express.Response) => {
        let id = req.params.id

        UserModel.deleteOne({ _id: id, role: { $ne: 'admin' } }).then((result) => {
            if (result.deletedCount == 0) {
                res.json({ message: 'Korisnik nije pronadjen' })
            } else {
                res.json({ message: 'Korisnik je uspesno obrisan' })
            }
        }).catch((error: any) => {
            console.log(error)
            res.json({ message: 'Greska prilikom brisanja korisnika' })
        })
    }

    countPrinters = (req: express.Request, res: express.Response) => {
        UserModel.countDocuments({
            role: 'printer',
            status: 'active'
        }).then((count) => {
            res.json({ count: count })
        }).catch((error: any) => {
            console.log(error)
            res.json({ count: 0 })
        })
    }

    requestPasswordReset = async (req: express.Request, res: express.Response) => {
        let identifier = String(req.body.identifier || '').trim()

        if (identifier == '') {
            res.json({ message: 'Unesite korisnicko ime ili email adresu', resetLink: '' })
            return
        }

        try {
            let user: any = await UserModel.findOne({
                $or: [{ username: identifier }, { email: identifier }]
            })

            if (user == null) {
                res.json({ message: 'Korisnik nije pronadjen', resetLink: '' })
                return
            }

            let token = randomBytes(32).toString('hex')
            user.resetToken = token
            user.resetTokenExpires = new Date(Date.now() + 5 * 60 * 1000)
            await user.save()

            res.json({
                message: 'Link za promenu lozinke je napravljen i vazi 5 minuta',
                resetLink: `http://localhost:4200/reset-password/${token}`
            })
        } catch (error) {
            console.log(error)
            res.json({ message: 'Greska prilikom pravljenja linka', resetLink: '' })
        }
    }

    resetPassword = async (req: express.Request, res: express.Response) => {
        let token = req.params.token
        let password = req.body.password
        let passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z].{7,11}$/

        if (!passwordRegex.test(password)) {
            res.json({ message: 'Lozinka nije u dobrom formatu' })
            return
        }

        try {
            let user: any = await UserModel.findOne({
                resetToken: token,
                resetTokenExpires: { $gt: new Date() }
            })

            if (user == null) {
                res.json({ message: 'Link nije ispravan ili je istekao' })
                return
            }

            user.password = createHash('sha256').update(password).digest('hex')
            user.resetToken = ''
            user.resetTokenExpires = null
            await user.save()
            res.json({ message: 'Lozinka je uspesno promenjena' })
        } catch (error) {
            console.log(error)
            res.json({ message: 'Greska prilikom promene lozinke' })
        }
    }

    changePassword = async (req: express.Request, res: express.Response) => {
        let id = req.params.id
        let oldPassword = req.body.oldPassword
        let newPassword = req.body.newPassword
        let passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z].{7,11}$/

        if (!passwordRegex.test(newPassword)) {
            res.json({ message: 'Nova lozinka nije u dobrom formatu' })
            return
        }

        try {
            let oldPasswordHash = createHash('sha256').update(oldPassword || '').digest('hex')
            let user: any = await UserModel.findOne({ _id: id, password: oldPasswordHash })

            if (user == null) {
                res.json({ message: 'Stara lozinka nije ispravna' })
                return
            }

            let newPasswordHash = createHash('sha256').update(newPassword).digest('hex')

            if (newPasswordHash == oldPasswordHash) {
                res.json({ message: 'Nova lozinka mora biti razlicita od stare' })
                return
            }

            user.password = newPasswordHash
            await user.save()
            res.json({ message: 'Lozinka je uspesno promenjena' })
        } catch (error) {
            console.log(error)
            res.json({ message: 'Greska prilikom promene lozinke' })
        }
    }
}
