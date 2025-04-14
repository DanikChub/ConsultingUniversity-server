const { Test, TestPunct } = require("../models/models");
const ApiError = require('../error/ApiError')
const { Op } = require('sequelize');
const uuid = require('uuid')
const path = require('path');
const fs =  require('fs');
const { time } = require("console");

class TestController {
    async create(req, res) {
        const {title, puncts, time_limit} = req.body;

    
        const testCreate = await Test.create({id: Math.floor(Math.random()*9000000) + 1000000, title: title, time_limit: time_limit})
    
      
        puncts.forEach( async (punct) => {
            let punctCreate = await TestPunct.create({question: punct.question, answers: punct.answers, correct_answer: punct.correct_answer, several_answers: punct.several_answers, testId: testCreate.id})
       })

        
        return res.json({testCreate})
    }

   

    async getOne(req, res) {
        const {id} = req.params
        let test = null;
        console.log(id);
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

    async remakeTest(req, res) {
        const {id, title, time_limit, puncts} = req.body;
       
    
        const testCreate = await Test.findOne({where: {id}})
        testCreate.title = title;
        testCreate.time_limit = time_limit;
       
        const testPuncts = await TestPunct.destroy(
            {
                where: {testId: id}
            }
        )
        puncts.forEach( async (punct) => {
            let punctCreate = await TestPunct.create({question: punct.question, answers: punct.answers, correct_answer: punct.correct_answer, several_answers: punct.several_answers, testId: testCreate.id})
        })

        testCreate.save();

        
        return res.json({testCreate})
    }

    async deleteTest(req, res) {
        const {id} = req.body;
        const testCreate = await Test.destroy({where: {id}})


        return res.json({testCreate})
    }

   
}

module.exports = new TestController();