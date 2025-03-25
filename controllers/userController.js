const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {User} = require('../models/models')
const nodemailer = require('nodemailer');

const generateJwt = (id, email, role) => {
    return jwt.sign(
        {id, email, role},
        process.env.SECRET_KEY,
        {expiresIn: '24h'}
    )
}

class UserController {
    async registration(req, res, next) {
        const {email, password, role, name, number, organiztion, programs_id, diplom} = req.body
        if (!email || !password) {
            return next(ApiError.badRequest('Некорректный email или password'))
        }
        const candidate = await User.findOne({where: {email}})
        if (candidate) {
            return next(ApiError.badRequest('Пользователь с таким email уже существует'))
        }
        const hashPassword = await bcrypt.hash(password, 5)
        const user = await User.create({email, role, password: hashPassword, name, number, organiztion, programs_id, diplom})
   
        const token = generateJwt(user.id, user.email, user.role)
        return res.json({token})
    }

    async remakeUser(req, res, next) {
        const {id, email, password, role, name, number, organiztion, programs_id, diplom} = req.body
        
        const user = await User.findOne({where: {id}})
    
        
        user.email = email;

        
    
        if (password) {
            const hashPassword = await bcrypt.hash(password, 5)
            user.password = hashPassword;
        } 
        user.role = role;
        user.name = name;
        user.number = number;
        user.organiztion = organiztion;
        user.programs_id = programs_id;
        user.diplom = diplom
        user.save();
   
        return res.json({user})
    }

    async login(req, res, next) {
        const {email, password} = req.body
        const user = await User.findOne({where: {email}})
        if (!user) {
            return next(ApiError.internal( 'Пользователь не найден'))
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        if (!comparePassword) {
            return next(ApiError.internal('Указан неверный пароль'))
        }
        const token = generateJwt(user.id, user.email, user.role)
        return res.json({token})
    }

    async forgotPassword(req, res) {
        const {email} = req.body;
        console.log(email);
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'chabanovdan@gmail.com',
                pass: 'fmdn veek hhnz wirs'
            }
        })

        const code = Math.round(Math.random()*1000);
        const hashCode = bcrypt.hash(`${code}`, 5)

        const user = User.findOne({where: {email}})

        user.forgot_pass_code = hashCode;

        const mailOptions = {
            from: "chabanovdan@gmail.com",
            to: email,
            subject: 'Код для восстановления пароля',
            html: `
                <p>Код: ${code}</p>
                
                
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

        return req.json({user});
    }

    async checkForgotPassword(req, res, next) {
        const {email, code, pass} = req.body;

        const user = User.findOne({where: {email}})


        let comparePassword = bcrypt.compareSync(code, user.forgot_pass_code)
        if (!comparePassword) {
            return next(ApiError.internal('код неверный'))
        }

        const hashPass = bcrypt.hash(pass, 5)

        user.password = hashPass;
        

        return res.json({user})
    }

    async check(req, res, next) {
        const token = generateJwt(req.user.id, req.user.email, req.user.role)
        return res.json({token})
    }

    async getUserById(req, res, next) {
        const {id} = req.params;
        const user = await User.findOne({where: {id}})
     
        
        return res.json(user);
    }

    async getAllUsers(req, res, next) {
       
        const users = await User.findAll()
       
        return res.json(users);
    }

    async deleteUser(req, res) {
        const {id} = req.body;
        const user =  await User.destroy({
            where: {
              id: id,
            },
          });
        

        return res.json(user);
    }

    async setWellTests(req, res) {
        const {id} = req.body;

        const user = await User.findOne({where: {id}})

        user.well_tests += 1;
        user.save();

        return res.json(user);
    }

    async setWellVideos(req, res) {
        const {id} = req.body;

        const user = await User.findOne({where: {id}})

        user.well_videos += 1;
        user.save();

        return res.json(user);
    }

    async setWellPracticalWorks(req, res) {
        const {id} = req.body;

        const user = await User.findOne({where: {id}})

        user.well_practical_works += 1;
        user.save();

        return res.json(user);
    }
}

module.exports = new UserController()
