const { Program, Theme, Punct, Test } = require("../models/models");
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
        try {
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
        } catch (e) {

        }

        let presentationNames = [];
        try {
            if (files.presentation_src != null) {

              
                let {presentation_src} = files;
             
                if (Array.isArray(presentation_src)) {
                    presentation_src.forEach(el => {
                        
                        let fileName = uuid.v4() + ".pdf"
                        el.mv(path.resolve(__dirname, '..', 'static', fileName))
                        presentationNames.push(fileName);
                    })
                    
                } else {
                    let fileName = uuid.v4() + ".pdf"
                    presentation_src.mv(path.resolve(__dirname, '..', 'static', fileName))
                    presentationNames.push(fileName);
                }
                


                    
            }
        } catch (e) {

        }
        
        
        
        
     
        const program = await Program.create({title, admin_id, number_of_practical_work, number_of_test, number_of_videos})
        let theme;
        let punct;

       
        parsedThemes.forEach( async (theme_el)  =>  {
            console.log(theme_el.presentation_id)
            theme = await Theme.create({title: theme_el.title, programId: program.id, presentation_src: presentationNames[theme_el.presentation_id]})
           
            theme_el.puncts.forEach(async (punct_el, i) => {
              
                punct = await Punct.create({title: punct_el.title, themeId: theme.id, video_src: punct_el.video_src, lection_src: arr_of_titles[punct_el.lection_id], lection_title: punct_el.lection_title, practical_work: punct_el.practical_work, test_id: punct_el.test_id})
                
                    
               
                
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

            arr.sort((a, b) => a.id - b.id)
            theme.dataValues["puncts"] = arr;
        })

        themes.sort((a, b) => a.id - b.id)
        program.dataValues["themes"] = themes;

        return res.json(program)
    }

    async deleteProgram(req, res) {
        const {id} = req.body;
        const program = await Program.findOne({
            where: {
              id: id,
            },
          })
        
          
        let themes = await Theme.findAll({where: {programId: program.id}})
        
        themes.forEach(async (theme) => {
            
            let puncts = await Punct.findAll({where: {themeId: theme.id}})
            
            puncts.forEach(async (punct) => {
               
                if (punct.lection_src) {
                            
                    fs.unlinkSync(path.resolve(__dirname, '..', 'static', punct.lection_src)); 
                }
            })
            
                
         
            
        })
        await Program.destroy({
            where: {
              id: id,
            },
          });

        return res.json(program);
    }

    async remake(req, res) {
        const {title, number_of_practical_work, number_of_test, number_of_videos, themes, id} = req.body;
        const files = req.files
  
     
        const parsedThemes = JSON.parse(themes);
     
        let arr_of_titles = [];
        try {
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
        } catch (e) {
            
        }
        
        
        let presentationNames = [];
        try {
            if (files.presentation_src != null) {

              
                let {presentation_src} = files;
             
                if (Array.isArray(presentation_src)) {
                    presentation_src.forEach(el => {
                        
                        let fileName = uuid.v4() + ".pdf"
                        el.mv(path.resolve(__dirname, '..', 'static', fileName))
                        presentationNames.push(fileName);
                    })
                    
                } else {
                    let fileName = uuid.v4() + ".pdf"
                    presentation_src.mv(path.resolve(__dirname, '..', 'static', fileName))
                    presentationNames.push(fileName);
                }
                


                    
            }
        } catch (e) {

        }
        
        
     
        const program = await Program.findOne({where: {id}})
        program.title = title;
        program.number_of_practical_work = number_of_practical_work;
        program.number_of_test = number_of_test;
        program.number_of_videos = number_of_videos;

        let theme;
        let punct;
        theme = await Theme.destroy({where: {programId: program.id}})
        console.log(presentationNames);
        parsedThemes.forEach( async (theme_el)  =>  {
            
            theme = await Theme.create({title: theme_el.title, programId: program.id, presentation_src: presentationNames[theme_el.presentation_id]})
            
            
            theme_el.puncts.forEach(async (punct_el, i) => {
               
                
                punct = await Punct.create({title: punct_el.title, themeId: theme.id, video_src: punct_el.video_src, lection_src: arr_of_titles[punct_el.lection_id]?arr_of_titles[punct_el.lection_id]:punct_el.lection_src, test_id: punct_el.test_id})
  
            })
            theme_el.puncts.forEach(async (punct_el, i) => {
                punct = await Punct.destroy({where: {themeId: theme.id}})
            })
        })

        program.save();
        

        
        return res.json({"messange": "err"})
        
    }
}

module.exports = new ProgramController();