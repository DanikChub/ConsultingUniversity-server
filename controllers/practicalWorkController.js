const { PracticalWork } = require("../models/models");
const ApiError = require('../error/ApiError')
const nodemailer = require('nodemailer');
const uuid = require('uuid')
const path = require('path');
const fs =  require('fs')

class PracticalWorkController {
    async create(req, res) {
        const {task, users_id} = req.body;
        const {file_src} = req.files

        let fileName = uuid.v4() + ".docx"
        file_src.mv(path.resolve(__dirname, '..', 'static', fileName))
  

        const practical_work = await PracticalWork.create({task, file_src: fileName, users_id});

        return res.json(practical_work);
    }

    async getOne(req, res) {
        const {id} = req.params
        const practical_work = await PracticalWork.findOne({where: {id: id}})

        return res.json(practical_work);
    }

    async getAll(req, res) {
        const practical_works = await PracticalWork.findAll();
        
        return res.json(practical_works)
    }


    async createAnswer(req, res) {
        const {id, answer} = req.body;
        const practical_work = await PracticalWork.findOne({where: {id: id}})

        practical_work.answer = answer;

        practical_work.save();

        return res.json(practical_work);
    }
    
}

module.exports = new PracticalWorkController();