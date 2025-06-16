const { PracticalWork, User } = require("../models/models");
const ApiError = require('../error/ApiError')
const nodemailer = require('nodemailer');
const uuid = require('uuid')
const path = require('path');
const fs =  require('fs')
const { Op } = require('sequelize');

class PracticalWorkController {
    async create(req, res, next) {
        const {task, users_id, program_id, theme_id, punct_id, practic_title} = req.body;
        const {file_src} = req.files

        const cand = await PracticalWork.findOne({
            where: {[Op.and]: [{ users_id: users_id, program_id: program_id, theme_id: theme_id, punct_id: punct_id }]}
        })
        let fileName = uuid.v4() + ".docx"
        file_src.mv(path.resolve(__dirname, '..', 'static', fileName));

        if (cand) {
            cand.test = null;
            cand.answer = '';
            cand.file_src = fileName;
            cand.practic_title = practic_title;
            cand.save();
            return res.json(cand);
        }

        
        const practical_work = await PracticalWork.create({task, file_src: fileName, users_id, program_id: program_id, theme_id: theme_id, punct_id: punct_id, practic_title });

        return res.json(practical_work);
    }

    async getOne(req, res) {
        const {id} = req.params
        const practical_work = await PracticalWork.findOne({where: {id: id}})

        return res.json(practical_work);
    }

    async getOneToUser(req, res) {
        const {users_id, program_id, theme_id, punct_id} = req.body
        
        const practical_work = await PracticalWork.findOne({
            where: {[Op.and]: [{ users_id: users_id, program_id: program_id, theme_id: theme_id, punct_id: punct_id }]}
        })



        return res.json(practical_work);
    }

    async getAll(req, res) {
        let practical_works = await PracticalWork.findAll();

        async function makePractic() {
            let practic_copy = practical_works;

            for (const practic of practic_copy) {
                const user = await User.findOne({where: {id: practic.users_id}})
               
                practic.dataValues["user_name"] = user.name;
            }
            
            return  practic_copy;
                
            
        }
        

        practical_works = await makePractic();

        
        return res.json(practical_works)
    }


    async createAnswer(req, res) {
        const {id, answer, test} = req.body;
        const practical_work = await PracticalWork.findOne({where: {id: id}})

        if (!test) {
            practical_work.practic_title = '';
        } 
        practical_work.answer = answer;
        practical_work.test = test;

        practical_work.save();

        return res.json(practical_work);
    }
    
}

module.exports = new PracticalWorkController();