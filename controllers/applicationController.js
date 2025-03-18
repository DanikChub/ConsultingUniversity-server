const { Application } = require("../models/models");
const ApiError = require('../error/ApiError')
const nodemailer = require('nodemailer');

class ApplicationController {
    async create(req, res) {
        const {name, email, number} = req.body;
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

    
}

module.exports = new ApplicationController();