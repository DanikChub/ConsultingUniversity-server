const { Test, TestPunct, TestStatictis, TestPunctStatictis } = require("../models/models");
const ApiError = require('../error/ApiError')
const { Op } = require('sequelize');
const uuid = require('uuid')
const path = require('path');
const fs =  require('fs');
const { time } = require("console");

class TestController {
    async create(req, res, next) {
        const {title, puncts, time_limit} = req.body;

    
        const testCreate = await Test.create({id: Math.floor(Math.random()*9000000) + 1000000, title: title, time_limit: time_limit})
        
        if (!title) {
            return next(ApiError.internal('Заполните название теста!'))
        }
        

        try {
            for (const punct of puncts) {
                if (!punct.question) {
                    return next(ApiError.internal('Заполните все вопросы в пунктах!'))
                }
                
                if (punct.correct_answer.length == 0) {
                    return next(ApiError.internal('Заполните правильные ответы!'))
                }
                let punctCreate = await TestPunct.create({question: punct.question, answers: punct.answers, correct_answer: punct.correct_answer, several_answers: punct.several_answers, testId: testCreate.id})

            }
        } catch(e) {
            return next(ApiError.badRequest('Ошибка при сохранении пунктов'))
        }
        
        
    
        
        return res.json({testCreate})
    }

   

    async getOne(req, res) {
        const {id} = req.params
        let test = null;
    
        try {
            if (id) {
                test = await Test.findOne(
                    {
                        where: {id}
                    },
                )
               
                const puncts = await TestPunct.findAll(
                    {
                        where: {testId: test.id}
                    }
                )
        
                test.dataValues["puncts"] = puncts
            }
            
        } catch(e) {

        }
        
       

        return res.json(test)
    }

    async remakeTest(req, res, next) {
        const {id, title, time_limit, puncts} = req.body;
        if (!title) {
            return next(ApiError.internal('Заполните название теста!'))
        }
        let new_arr = []
        const testCreate = await Test.findOne({where: {id}})
        testCreate.title = title;
        testCreate.time_limit = time_limit;
       
        const testPuncts = await TestPunct.destroy(
            {
                where: {testId: id}
            }
        )
        
        for (const punct of puncts) {
            if (!punct.question) {
                return next(ApiError.internal('Заполните все вопросы в пунктах!'))
            }
            
            if (punct.correct_answer.length == 0) {
                return next(ApiError.internal('Заполните правильные ответы!'))
            }
            let punctCreate = await TestPunct.create({question: punct.question, answers: punct.answers, correct_answer: punct.correct_answer, several_answers: punct.several_answers, testId: testCreate.id})

         
        }

        testCreate.save();

     

        return res.json({testCreate})
    }

    async deleteTest(req, res) {
        const {id} = req.body;
        const testCreate = await Test.destroy({where: {id}})


        return res.json({testCreate})
    }

    async updateTestStatistics(req, res, next) {
        const {user_id, punctsStatistic, test_id} = req.body;

        let testCreate = await TestStatictis.findOne(
            {
                where: {
                    [Op.and]: [{user_id: user_id, test_id: test_id}]
                }
            },
        )
    
        if (testCreate) {
            
            const punctsCreate = await TestPunctStatictis.destroy(
                {
                    where: {testId: testCreate.id}
                }
            )
            try {
                for (const punct of punctsStatistic) {
                    if (punct.user_answer.length == 0) {
                        return next(ApiError.internal('Заполните правильные ответы!'))
                    }
                    let punctCreate = await TestPunctStatictis.create({user_answer: punct, testId: testCreate.id})
    

    
                }
            } catch(e) {
                return next(ApiError.badRequest('Ошибка при сохранении пунктов'))
            }
        } else {
            testCreate = await TestStatictis.create({user_id: user_id, test_id: test_id})
            try {
                for (const punct of punctsStatistic) {
                  
                    if (punct.user_answer.length == 0) {
                        return next(ApiError.internal('Заполните правильные ответы!'))
                    }
                    let punctCreate = await TestPunctStatictis.create({user_answer: punct, testId: testCreate.id})
    
                }
            } catch(e) {
                return next(ApiError.badRequest('Ошибка при сохранении пунктов'))
            }
            
        }
      


      
        
    
        
        return res.json({testCreate})
    }

    async getTestStatistic(req, res, next) {
        const {user_id, test_id} = req.body;

        
        let test = null;
    
        try {
            if (id) {
                test = await TestStatictis.findOne(
                    {
                        where: {
                            [Op.and]: [{user_id: user_id, test_id: test_id}]
                        }
                    },
                )
               
                const punctsStatistic = await TestPunctStatictis.findAll(
                    {
                        where: {testId: test.id}
                    }
                )
        
                test.dataValues["punctsStatistic"] = puncts
            }
            
        } catch(e) {

        }
        
       

        return res.json(test)
    }
}

module.exports = new TestController();