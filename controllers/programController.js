const { Program, Theme, Punct } = require("../models/models");
const ApiError = require('../error/ApiError')
const { Op } = require('sequelize');
const uuid = require('uuid')
const path = require('path');
const fs =  require('fs')

class ProgramController {
    async create(req, res) {
        const {title, admin_id, number_of_practical_work, number_of_test, number_of_videos, themes} = req.body;
        const files = req.files
  
     
        const parsedThemes = JSON.parse(themes);
     
        let arr_of_titles = [];
       
        if (files.docs != null) {
            let {docs} = files;
            if (Array.isArray(docs)) {
                docs.forEach(el => {
                    let fileName = uuid.v4() + ".docx"
                    el.mv(path.resolve(__dirname, '..', 'static', fileName))
                    arr_of_titles.push(fileName);
                })
                
            } else {
                let fileName = uuid.v4() + ".docx"
                docs.mv(path.resolve(__dirname, '..', 'static', fileName))
                arr_of_titles.push(fileName);
            }
        }
        
        
        
     
        const program = await Program.create({title, admin_id, number_of_practical_work, number_of_test, number_of_videos})
        let theme;
        let punct;

        
        parsedThemes.forEach( async (theme_el)  =>  {
            
            theme = await Theme.create({title: theme_el.title, programId: program.id})
           
            theme_el.puncts.forEach(async (punct_el, i) => {
                
                punct = await Punct.create({title: punct_el.title, themeId: theme.id, video_src: punct_el.video_src, lection_src: arr_of_titles[punct_el.lection_id], test_id: punct_el.test_id})
                
                    
               
                
            })
        })

        
        return res.json({"messange": "err"})
    }

    async getAll(req, res) {
        const programs = await Program.findAll()
        return res.json(programs);
    }

    async getOne(req, res) {
        const {id} = req.params
        const program = await Program.findOne(
            {
                where: {id}
            },
        )
       
       
        const themes = await Theme.findAll(
            {
                where: {
                    programId: program.id
                }
            }
        )
      

        let arrOfThemeId = []

        themes.forEach(async theme => {
            
            arrOfThemeId.push(theme.dataValues.id);
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
        
        themes.forEach((theme, i) => {
            let arr = [];
            puncts.forEach((punct) => {
                
                if (theme.dataValues.id == punct.dataValues.themeId) {
                    arr.push(punct)
                }

               
            })
            theme.dataValues["puncts"] = arr;
        })
        program.dataValues["themes"] = themes;

        return res.json(program)
    }

    async deleteProgram(req, res) {
        const {id} = req.body;
        const program =  await Program.destroy({
            where: {
              id: id,
            },
          });
        

        return res.json(program);
    }

    async remake(req, res) {
        const {id, title, admin_id, number_of_practical_work, number_of_test, number_of_videos, themes} = req.body;
        

     
        const program = await Program.findOne({where: {id: id}})
        program.title = title;
        program.admin_id = admin_id;
        program.number_of_practical_work = number_of_practical_work;
        program.number_of_test = number_of_test;
        program.number_of_videos = number_of_videos;

        program.save();
        
        let theme;
        let punct;

        
        themes.forEach( async (theme_el, i)  =>  {
            

            theme = await Theme.findOne({where: {id: theme_el.id}})
            if (theme) {
                theme.title = theme_el.title;
            } else {

            }
           
            theme_el.puncts.forEach(async (punct_el) => {

                punct = await Punct.findOne({where: {id: punct_el.id}})
                
                
            })
        })

        
        return res.json(punct)
        
    }
}

module.exports = new ProgramController();