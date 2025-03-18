const { Test, TestPunct } = require("../models/models");
const ApiError = require('../error/ApiError')
const { Op } = require('sequelize');
const uuid = require('uuid')
const path = require('path');
const fs =  require('fs')

class TestController {
    async create(req, res) {
        const {title, puncts} = req.body;

    
        const testCreate = await Test.create({id: Math.floor(Math.random()*9000000) + 1000000, title: title})
    
      
        puncts.forEach( async (punct) => {
            let punctCreate = await TestPunct.create({question: punct.question, answers: punct.answers, correct_answer: punct.correct_answer, several_answers: punct.several_answers, testId: testCreate.id})
       })

        
        return res.json({testCreate})
    }

   

    async getOne(req, res) {
        const {id} = req.params
        const test = await Test.findOne(
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
       

        return res.json(test)
    }

   
}

module.exports = new TestController();