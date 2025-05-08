const { Program, Theme, Punct, Test } = require("../models/models");
const ApiError = require('../error/ApiError')
const { Op } = require('sequelize');
const uuid = require('uuid')
const path = require('path');
const fs =  require('fs');
const docxConverter = require('docx-pdf');
const mammoth = require('mammoth');


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
                      
                        let fileName = uuid.v4();
                        let fileNameDocx = fileName + ".docx";
                        let fileNamePDF = fileName + ".pdf";
                        el.mv(path.resolve(__dirname, '..', 'static', fileNameDocx))
                        // .then(data => {
                        //     docxConverter(path.resolve(__dirname, '..', 'static', fileNameDocx), path.resolve(__dirname, '..', 'static', fileNamePDF), (err, result) => {
                        //         if (err) console.log(' RESULT\n', err);
                        //         else console.log(' RESULT\n', result); // writes to file for us
                        //     });
                        // })
                        

                        arr_of_titles.push(fileNameDocx);
                    })
                    
                } else {
                    let fileName = uuid.v4();
                    let fileNameDocx = fileName + ".docx";
                    let fileNamePDF = fileName + ".pdf";
                    await docs.mv(path.resolve(__dirname, '..', 'static', fileNameDocx))
                    // .then(data => {
                    //     docxConverter(path.resolve(__dirname, '..', 'static', fileNameDocx), path.resolve(__dirname, '..', 'static', fileNamePDF), (err, result) => {
                    //         if (err) console.log(' RESULT\n', err);
                    //         else console.log(' RESULT\n', result); // writes to file for us
                    //     });
                    // })
                    
                        
                        
                  
                    arr_of_titles.push(fileNameDocx);
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
        
        
        let theme_arr_of_titles = [];
        try {
            if (files.theme_lection_src != null) {

              
                let {theme_lection_src} = files;
             
                if (Array.isArray(theme_lection_src)) {
                    theme_lection_src.forEach(el => {
                        
                        let fileName = uuid.v4() + ".docx"
                        el.mv(path.resolve(__dirname, '..', 'static', fileName))
                        theme_arr_of_titles.push(fileName);
                    })
                    
                } else {
                    let fileName = uuid.v4() + ".docx"
                    theme_lection_src.mv(path.resolve(__dirname, '..', 'static', fileName))
                    theme_arr_of_titles.push(fileName);
                }
                


                    
            }
        } catch (e) {

        }
        
     
        const program = await Program.create({title, admin_id, number_of_practical_work, number_of_test, number_of_videos})
        let theme;
        let punct;

        
        parsedThemes.forEach( async (theme_el)  =>  {
            
            if (theme_arr_of_titles[theme_el.lection_id]) {
                mammoth.convertToHtml({path: path.resolve(__dirname, '..', 'static', theme_arr_of_titles[theme_el.lection_id])})
                .then(async function(result){
                    var html = result.value;
                    await Theme.create({
                        title: theme_el.title, 
                        programId: program.id, 
                        presentation_src: presentationNames[theme_el.presentation_id], 
                        presentation_title: theme_el.presentation_title, 
                        video_src: theme_el.video_src,
                        lection_src: theme_arr_of_titles[theme_el.lection_id], 
                        lection_html: html, 
                        lection_title: theme_el.lection_title, 
                        lection_id: theme_el.lection_id
                    })
                    .then(theme => {
                        theme_el.puncts.forEach(async (punct_el, i) => {
                            
                            if (arr_of_titles[punct_el.lection_id]) {
                                mammoth.convertToHtml({path: path.resolve(__dirname, '..', 'static', arr_of_titles[punct_el.lection_id])})
                                .then(async function(result){
                                    var html = result.value; // The generated HTML
                                    punct = await Punct.create({
                                        title: punct_el.title, 
                                        themeId: theme.id, 
                                        video_src: punct_el.video_src, 
                                        lection_src: arr_of_titles[punct_el.lection_id], 
                                        lection_html: html, 
                                        lection_title: punct_el.lection_title, 
                                        lection_id: punct_el.lection_id, 
                                        practical_work: punct_el.practical_work, 
                                        test_id: punct_el.test_id,
                                        punct_id: punct_el.punct_id
                                    })
                                    
                                })
                                .done();
                            } else {
                                punct = await Punct.create({title: punct_el.title, themeId: theme.id, video_src: punct_el.video_src, lection_src: arr_of_titles[punct_el.lection_id], lection_html: ``, lection_title: punct_el.lection_title, lection_id: punct_el.lection_id, practical_work: punct_el.practical_work, test_id: punct_el.test_id,
                                punct_id: punct_el.punct_id
                                })
                            }
                            
                        })



                    })
                })
            } else {
                await Theme.create({
                        title: theme_el.title, 
                        programId: program.id, 
                        presentation_src: presentationNames[theme_el.presentation_id], 
                        presentation_title: theme_el.presentation_title, 
                        video_src: theme_el.video_src,
                        lection_src: theme_arr_of_titles[theme_el.lection_id], 
                        lection_html: ``, 
                        lection_title: theme_el.lection_title, 
                        lection_id: theme_el.lection_id
                    })
                    .then(theme => {
                        theme_el.puncts.forEach(async (punct_el, i) => {
                            
                            if (arr_of_titles[punct_el.lection_id]) {
                                mammoth.convertToHtml({path: path.resolve(__dirname, '..', 'static', arr_of_titles[punct_el.lection_id])})
                                .then(async function(result){
                                    var html = result.value; // The generated HTML
                                    punct = await Punct.create({
                                        title: punct_el.title, 
                                        themeId: theme.id, 
                                        video_src: punct_el.video_src, 
                                        lection_src: arr_of_titles[punct_el.lection_id], 
                                        lection_html: html, 
                                        lection_title: punct_el.lection_title, 
                                        lection_id: punct_el.lection_id, 
                                        practical_work: punct_el.practical_work, 
                                        test_id: punct_el.test_id,
                                        punct_id: punct_el.punct_id
                                    })
                                    
                                })
                                .done();
                            } else {
                                punct = await Punct.create({title: punct_el.title, themeId: theme.id, video_src: punct_el.video_src, lection_src: arr_of_titles[punct_el.lection_id], lection_html: ``, lection_title: punct_el.lection_title, lection_id: punct_el.lection_id, practical_work: punct_el.practical_work, test_id: punct_el.test_id,
                                punct_id: punct_el.punct_id
                                })
                            }
                            
                        })


                        
                    })
            }
        
            
            
           
            
        })

        
        return res.json({"messange": "err"})
    }

    async getAll(req, res) {
        const programs = await Program.findAll()
        return res.json(programs);
    }

    async getOnePunct(req, res) {
        const {id} = req.params
        const punct = await Punct.findOne({where: {id}})

        return res.json(punct)
    }

    async getOneTheme(req, res) {
        const {id} = req.params
        const theme = await Theme.findOne({where: {id}})

        return res.json(theme)
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

            arr.sort((a, b) => a.punct_id - b.punct_id)
            theme.dataValues["puncts"] = arr;
        })
        
        themes.sort((a, b) => a.createdAt - b.createdAt)
       
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
            if (theme.presetation_src) {
                    
                fs.unlink(path.resolve(__dirname, '..', 'static', theme.presetation_src), (err) => {
                    if (err) throw err;

                    
                }); 
            }
            let puncts = await Punct.findAll({where: {themeId: theme.id}})
            
            puncts.forEach(async (punct) => {
              
                if (punct.lection_src) {
                    
                    fs.unlink(path.resolve(__dirname, '..', 'static', punct.lection_src), (err) => {
                        if (err) throw err;

                      
                    }); 
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

        let theme_arr_of_titles = [];
        try {
            if (files.theme_lection_src != null) {

              
                let {theme_lection_src} = files;
             
                if (Array.isArray(theme_lection_src)) {
                    theme_lection_src.forEach(el => {
                        
                        let fileName = uuid.v4() + ".docx"
                        el.mv(path.resolve(__dirname, '..', 'static', fileName))
                        theme_arr_of_titles.push(fileName);
                    })
                    
                } else {
                    let fileName = uuid.v4() + ".docx"
                    theme_lection_src.mv(path.resolve(__dirname, '..', 'static', fileName))
                    theme_arr_of_titles.push(fileName);
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
        



        parsedThemes.forEach( async (theme_el)  =>  {

            // title: theme_el.title, 
            // programId: program.id, 
            // presentation_src: presentationNames[theme_el.presentation_id], 
            // presentation_title: theme_el.presentation_title, 
            // video_src: theme_el.video_src,
            // lection_src: theme_arr_of_titles[theme_el.lection_id], 
            // lection_html: ``, 
            // lection_title: theme_el.lection_title, 
            // lection_id: theme_el.lection_id
           
                mammoth.convertToHtml({path: path.resolve(__dirname, '..', 'static', typeof theme_el.lection_src == 'string' ? theme_el.lection_src :  theme_arr_of_titles[theme_el.lection_id])})
                .then(async function(result){
                    var html = result.value;
                    await Theme.create({
                        title: theme_el.title, 
                        programId: program.id, 
                        presentation_src: presentationNames[theme_el.presentation_id],
                        presentation_title: theme_el.presentation_title, 
                        video_src: theme_el.video_src,
                        lection_src: typeof theme_el.lection_src == 'string' ? theme_el.lection_src : theme_arr_of_titles[theme_el.lection_id], 
                        lection_html: html, 
                        lection_title: theme_el.lection_title, 
                        lection_id: theme_el.lection_id
                    })
                    .then(theme => {
                        theme_el.puncts.forEach(async (punct_el, i) => {
                    

                            await mammoth.convertToHtml({path: path.resolve(__dirname, '..', 'static', typeof punct_el.lection_src == 'string' ? punct_el.lection_src :  arr_of_titles[punct_el.lection_id])})
                            .then(async function(result){
                                var html = result.value; // The generated HTML
            
                            
                                punct = await Punct.create({
                                    title: punct_el.title, 
                                    themeId: theme.id, 
                                    video_src: punct_el.video_src, 
                                    lection_src: typeof punct_el.lection_src == 'string' ? punct_el.lection_src :  arr_of_titles[punct_el.lection_id], 
                                    lection_html: html, 
                                    lection_title: punct_el.lection_title, 
                                    lection_id: punct_el.lection_id, 
                                    practical_work: punct_el.practical_work, 
                                    test_id: punct_el.test_id,
                                    punct_id: punct_el.punct_id
                                })
                            
                            })
                            .done();
                            
                            
                        
            
                        })
                        theme_el.puncts.forEach(async (punct_el, i) => {
                            punct = await Punct.destroy({where: {themeId: theme.id}})
                        })
                    })
                })
            
            
            
        })

        program.save();
        

        
        return res.json({"messange": "err"})
        
    }
}

module.exports = new ProgramController();