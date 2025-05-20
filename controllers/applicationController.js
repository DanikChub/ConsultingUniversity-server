const { Application, User } = require("../models/models");
const ApiError = require('../error/ApiError')
const nodemailer = require('nodemailer');
const { badRequest } = require("../error/ApiError");

class ApplicationController {
    async create(req, res, next) {
        const {name, email, number} = req.body;

        const cand1 = await User.findOne({where: {email}})
        const cand2 = await User.findOne({where: {number}})
        const cand3 = await Application.findOne({where: {email}})
     
        if (cand1) {
            return next(ApiError.internal( `Пользователь с таким email уже существует!`))
        }
        if (cand2) {
            return next(ApiError.internal( `Пользователь с таким номером уже существует!`))
        }

        if (cand3) {
            return next(ApiError.internal( `Вы уже оставляли заявку. Мы перезвоним Вам в ближайшее время!`))
        }

        if (!name || !email || !number) {
            return next(ApiError.internal( `Заполните все поля!`))
        }
        

        const application = Application.create({name, email, number});

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'chabanovdan@gmail.com',
                pass: 'fmdn veek hhnz wirs'
            }
        })

        const mailOptions = {
            from: "chabanovdan@gmail.com",
            to: "chabanovdan@gmail.com",
            subject: 'Новая заявка от пользователя',
            html: `
                <p>Имя: ${name}</p>
                <p>Почта: ${email}</p>
                <p>
                    Телефон: <a href="tel:${number}"> ${number}</a>
                </p>
                
            `
        }

        const send = () => {
            return new Promise((resolve, reject) => {
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(info);
                })
            })
        }

        await send();

        return res.json({application});
    }

    async getAll(req, res) {
        const applications = await Application.findAll()
        return res.json(applications);
    }

    async destroyApplication(req, res) {
        const {id} = req.body;
        const application = await Application.destroy({where: {id}})

        return res.json(application)
    }

    
}

module.exports = new ApplicationController();