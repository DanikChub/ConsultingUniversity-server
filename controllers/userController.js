const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {User, Statistic, Program, Theme, Punct, ThemeStatistic, PunctStatistic} = require('../models/models')
const { Op, fn } = require('sequelize');
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
        const {email, password, role, name, number, organiztion, programs_id, diplom, inn, address} = req.body
        if (!email) {
            return next(ApiError.badRequest('Некорректный email'))
        }
        if (!password) {
            return next(ApiError.badRequest('Некорректный пароль'))
        }
        if (!number) {
            return next(ApiError.badRequest('Некорректный номер'))
        }
       
        if (!programs_id[0]) {
            return next(ApiError.badRequest('Отсутствует программа у пользователя'))
        }
        const candidate = await User.findOne({where: {email}})
        if (candidate) {
            return next(ApiError.badRequest('Пользователь с таким email уже существует'))
        }
        const candidate2 = await User.findOne({where: {number}})
        if (candidate2) {
            return next(ApiError.badRequest('Пользователь с таким телефоном уже существует'))
        }
        const hashPassword = await bcrypt.hash(password, 5)
       
        const user = await User.create({email, role, password: hashPassword, name, number, organiztion, programs_id, diplom, inn, address})



        let program = await Program.findOne({where: {id: programs_id[0]}})

        let statistic = await Statistic.create({
            users_id: user.id, 
            programs_id: program.id, 
            max_videos: program.number_of_videos,
            max_tests: program.number_of_test,
            max_practical_works: program.number_of_practical_work
        })

        const themes = await Theme.findAll(
            {
                where: {
                    programId: program.id
                }
            }
        )
      

        let arrOfThemeId = []
        let themesStatisticArray = []

        themes.forEach(async theme => {
       
               
            
            arrOfThemeId.push(theme.id);
        })
   
        
        let puncts = await Punct.findAll(
            {
                where: {
                    themeId: {
                        [Op.or]: arrOfThemeId,
                    }
                    
                }
            }
        )
        
        themes.forEach(async (theme, i) => {
            let themeStatic = await ThemeStatistic.create({theme_id: theme.id,
                well: false, statisticId: statistic.id});
       
            puncts.forEach(async (punct) => {
                if (theme.id == punct.themeId) {
                    let punctStatic = await PunctStatistic.create(
                        {   punct_id: punct.id,
                            lection: false,
                            practical_work: null,
                            video: false,
                            test_bool: false,
                            themeStatisticId: themeStatic.id
                        })
                }
                
                

               
            })
            
        })

        

        const token = generateJwt(user.id, user.email, user.role)
        return res.json({token})
    }

    async registrationAdmin(req, res, next) {
        const {email, password, role, name, number, organiztion, programs_id, diplom, inn, address} = req.body
        if (!email) {
            return next(ApiError.badRequest('Некорректный email'))
        }
        if (!password) {
            return next(ApiError.badRequest('Некорректный пароль'))
        }
        if (!number) {
            return next(ApiError.badRequest('Некорректный номер'))
        }
       
        const candidate = await User.findOne({where: {email}})
        if (candidate) {
            return next(ApiError.badRequest('Пользователь с таким email уже существует'))
        }
        const candidate2 = await User.findOne({where: {number}})
        if (candidate2) {
            return next(ApiError.badRequest('Пользователь с таким телефоном уже существует'))
        }
        const hashPassword = await bcrypt.hash(password, 5)
       
        const user = await User.create({email, role, password: hashPassword, name, number, organiztion, programs_id: programs_id || [-1], diplom, inn, address})


        

        const token = generateJwt(user.id, user.email, user.role)
        return res.json({token})
    }

    async setGraduationDate(req, res, next) {
        const {id, graduation_date} = req.body

        const user = await User.findOne({where: {id}})
        

        if (!user.graduation_date) {
            user.graduation_date = graduation_date;
            user.save();
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
                subject: 'Поздравляем с окончанием обучения!',
                html: `
                    <h1>Поздравляем вас с окончанием обучения!: </h1>
                    
                    
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
            
        } 

       

        

        return res.json(user);
        
    }

    async remakeUser(req, res, next) {
        const {id, email, password, role, name, number, organiztion, programs_id, diplom, inn, address} = req.body
        const user = await User.findOne({where: {id}})
        if (!email) {
            return next(ApiError.badRequest('Некорректный email'))
        }
       
        if (!number) {
            return next(ApiError.badRequest('Некорректный номер'))
        }
       
        if (!programs_id[0]) {
            return next(ApiError.badRequest('Отсутствует программа у пользователя'))
        }
        const candidate = await User.findOne({where: {email}})
        if (candidate && candidate.id != user.id) {
            return next(ApiError.badRequest('Пользователь с таким email уже существует'))
        }
        const candidate2 = await User.findOne({where: {number}})
        if (candidate2  && candidate2.id != user.id) {
            return next(ApiError.badRequest('Пользователь с таким телефоном уже существует'))
        }
        
    
        
        user.email = email;

        
    
        if (password) {
            const hashPassword = await bcrypt.hash(password, 5)
            user.password = hashPassword;
        } 
        user.role = role;
        user.name = name;
        user.number = number;
        user.organiztion = organiztion;
        user.inn = inn;
        user.address = address;

        if (user.programs_id[0] != programs_id[0]) {
            let prevStat = await Statistic.destroy({
                where: {
                    [Op.and]: [{ users_id: id, programs_id: user.programs_id[0] }]
                }
            })
            let program = await Program.findOne({where: {id: programs_id[0]}})

            let statistic = await Statistic.create({
                users_id: user.id, 
                programs_id: program.id, 
                max_videos: program.number_of_videos,
                max_tests: program.number_of_test,
                max_practical_works: program.number_of_practical_work
            })
    
            const themes = await Theme.findAll(
                {
                    where: {
                        programId: program.id
                    }
                }
            )
          
    
            let arrOfThemeId = []
            let themesStatisticArray = []
    
            themes.forEach(async theme => {
           
                   
                
                arrOfThemeId.push(theme.id);
            })
       
            
            let puncts = await Punct.findAll(
                {
                    where: {
                        themeId: {
                            [Op.or]: arrOfThemeId,
                        }
                        
                    }
                }
            )
            
            for (const theme of themes) {
                let themeStatic = await ThemeStatistic.create({theme_id: theme.id,
                    well: false, statisticId: statistic.id});
                
                for (const punct of puncts) {
                    if (theme.id == punct.themeId) {
                        let punctStatic = await PunctStatistic.create(
                            {   punct_id: punct.id,
                                lection: false,
                                practical_work: null,
                                video: false,
                                test_bool: false,
                                themeStatisticId: themeStatic.id
                            })
                    }
                }
                
                
            }
           
        }
        
        
        user.programs_id = programs_id;
        user.diplom = diplom;


        

       
        user.save();
   
        return res.json({user})
    }

    async remakeAdmin(req, res, next) {
        const {id, email, password, name, number} = req.body
        const user = await User.findOne({where: {id}})
        if (!email) {
            return next(ApiError.badRequest('Некорректный email'))
        }
       
        if (!number) {
            return next(ApiError.badRequest('Некорректный номер'))
        }
       
        
        user.email = email;

        
    
        if (password) {
            const hashPassword = await bcrypt.hash(password, 5)
            user.password = hashPassword;
        } 
        user.name = name;
        user.number = number;
       

       
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
       
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'chabanovdan@gmail.com',
                pass: 'fmdn veek hhnz wirs'
            }
        })

        const code = Math.round(Math.random()*1000+1000);
        const hashCode = await bcrypt.hash(`${code}`, 5)

        const user = await User.findOne({where: {email}})

        user.forgot_pass_code = hashCode;

        
        user.save();
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

        return res.json({user});
    }

    async checkForgotPassword(req, res, next) {
        const {email, code, pass} = req.body;

        const user = await User.findOne({where: {email}})

       
        let comparePassword = bcrypt.compareSync(code, user.forgot_pass_code)
        if (!comparePassword) {
            return next(ApiError.internal('код неверный'))
        }

        const hashPass = await bcrypt.hash(pass, 5)

        user.password = hashPass;
        user.forgot_pass_code = null;

        user.save();

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
       
        
        let users = await User.findAll({
            where: {role: 'USER'}
        })
        
       
        return res.json(users);
    }
    async getAllUsersGraduation(req, res, next) {
       
        
        let users = await User.findAll({
            where: {
                role: 'USER',
                graduation_date: {
                    [Op.not]: null, // Like: sellDate IS NOT NULL
                },
            }
        })
        
       
        return res.json(users);
    }

    async getAllAdmins(req, res, next) {
       
        
        let users = await User.findAll({
            where: {role: 'ADMIN'}
        })
        
       
        return res.json(users);
    }

    async getAllUsersWithPage(req, res, next) {
        const {page} = req.params; 
        const {sort_type, sort_down} = req.query;

        let usersFirst = await User.findAll({
            where: {role: 'USER'},
        })
        
        async function makeUsers() {
            

            for (const user of usersFirst) {
                if (user.role != 'ADMIN') {
                    const statistic = await Statistic.findOne({where: {[Op.and]: [{ users_id: user.id, programs_id: user.programs_id[0] }]}})
                    try {
                        if (statistic.well_tests) {
                            user.statistic = Math.round((statistic.well_tests)/(statistic.max_tests)*100);
                            user.save();
                        }
                    } catch(e) {
                        
                    }
                    
                    
                }
                
            }
                
            
        }

        await makeUsers();

        let users = await User.findAndCountAll({
            offset:((page-1)*10),
            limit : 10,
            where: {role: 'USER'},
            order: [
                [sort_type, sort_down],
              
              ]
        })
     


       
        return res.json(users);
    }

    async searchUsers(req, res, next) {
        const {page} = req.params;
        const {q} = req.query;




        let users = await User.findAndCountAll({
            offset:((page-1)*10),
            limit : 10,
            where: {
                role: 'USER',
                [Op.or]: [
                    {name: { [Op.regexp]: `${q}` }},
                    {organiztion: { [Op.regexp]: `${q}` }}
                ]
                
            }

        })

      
        async function makeUsers() {
            let practic_copy = users.rows;

            for (const user of practic_copy) {
                if (user.role != 'ADMIN') {
                    const statistic = await Statistic.findOne({where: {[Op.and]: [{ users_id: user.id, programs_id: user.programs_id[0] }]}})
               
                    user.dataValues["statistic"] = Math.round((statistic.well_tests)/(statistic.max_tests)*100);
                }
                
            }
            

            users.rows = practic_copy;

            return  users;
                
            
        }

        let res_users = await makeUsers()
        
        return res.json(res_users);
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
