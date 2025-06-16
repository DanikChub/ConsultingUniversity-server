const { Program, Theme, Punct, Test, User, Statistic, ThemeStatistic, PunctStatistic } = require("../models/models");
const ApiError = require('../error/ApiError')
const { Op } = require('sequelize');
const uuid = require('uuid')
const path = require('path');
const fs =  require('fs');
const docxConverter = require('docx-pdf');
const mammoth = require('mammoth');


class ProgramController {
    async create(req, res, next) {
        const {title, admin_id, number_of_practical_work, number_of_test, number_of_videos, themes} = req.body;
        const files = req.files
  
     
        const parsedThemes = JSON.parse(themes);
        if (!title) {
            return next(ApiError.internal( `Программа не имеет названия!`))
        }
        parsedThemes.forEach(theme_el => {
            if (!theme_el.title) {
                return next(ApiError.internal( `Модуль "${theme_el.theme_id + 1}" не имеет названия!`))
            }
            let bool = [];
            theme_el.puncts.forEach(punct_el => {
                if (punct_el.test_id) {
                    bool.push(true);
                }
                
                if (!punct_el.lection_title && !punct_el.video_src && !punct_el.test_id && !punct_el.practical_work) {
                    return next(ApiError.internal( `Пункт "${punct_el.punct_id + 1}" не может быть пустым`))
                }

                if (!punct_el.title) {
                    return next(ApiError.internal( `Пункт "${punct_el.punct_id + 1}" не имеет названия!`))
                }
            })
            
            if (bool.length == 0) {
                return next(ApiError.internal( `В теме "${theme_el.title}" нет теста! (В каждой теме должен быть один тест для подсчета статистики!)`))
            }
            if (bool.length > 1) {
                return next(ApiError.internal( `В теме "${theme_el.title}" ${bool.length} тестов! (В каждой теме может быть только один тест для правильного подсчета статистики!)`))
            }
        })
     
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
            return next(ApiError.internal( 'Ошибка при сохранении файлов лекций пунктов'))
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
            return next(ApiError.internal( 'Ошибка при сохранении файлов презентаций'))
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
            
            return next(ApiError.internal( 'Ошибка при сохранении файлов лекций тем'))
        }
        
     
        const program = await Program.create({title, admin_id, number_of_practical_work, number_of_test, number_of_videos})
        let theme;
        let punct;

        
        parsedThemes.forEach( async (theme_el)  =>  {
            
            if (theme_arr_of_titles[theme_el.lection_id]) {
                try {
                    mammoth.convertToHtml({path: path.resolve(__dirname, '..', 'static', theme_arr_of_titles[theme_el.lection_id])})
                    .then(async function(result){
                        var html = result.value;
                        try {
                            await Theme.create({
                                title: theme_el.title, 
                                programId: program.id, 
                                theme_id: theme_el.theme_id,
                                presentation_src: presentationNames[theme_el.presentation_id], 
                                presentation_title: theme_el.presentation_title, 
                                video_src: theme_el.video_src,
                                lection_src: theme_arr_of_titles[theme_el.lection_id], 
                                lection_html: html, 
                                lection_title: theme_el.lection_title, 
                                lection_id: theme_el.lection_id
                            })
                            .then(theme => {
                                try {
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
                                } catch(e) {
                                    return next(ApiError.internal( 'Ошибка сохранении пунктов'))
                                }
                                
        
        
        
                            })
                        } catch(e) {
                            return next(ApiError.internal( 'Ошибка сохранении тем'))
                        }
                        
                    })
                } catch(e) {
                    return next(ApiError.internal( 'Ошибка при конвертировании docx файлов в html'))
                }
                
            } else {
                try {
                    await Theme.create({
                        title: theme_el.title, 
                        programId: program.id, 
                        theme_id: theme_el.theme_id,
                        presentation_src: presentationNames[theme_el.presentation_id], 
                        presentation_title: theme_el.presentation_title, 
                        video_src: theme_el.video_src,
                        lection_src: theme_arr_of_titles[theme_el.lection_id], 
                        lection_html: ``, 
                        lection_title: theme_el.lection_title, 
                        lection_id: theme_el.lection_id
                    })
                    .then(theme => {
                        try {
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
                        } catch(e) {
                            return next(ApiError.internal( 'Ошибка при сохранении пунктов'))
                        }
                        


                        
                    })
                } catch(e) {
                    return next(ApiError.internal( 'Ошибка сохранении тем'))
                }
                
            }
        
            
            
           
            
        })

        
        return res.json({"messange": "err"})
    }

    async getAll(req, res) {
        const programs = await Program.findAll()
        return res.json(programs);
    }

    async getOnePunct(req, res, next) {
        const {id} = req.params
        
        const punct = await Punct.findOne({where: {id}})
        if (!punct) {
            return next(ApiError.internal( 'Пункт не найден'))
        }

        return res.json(punct)
    }

    async getOneTheme(req, res, next) {
        const {id} = req.params
        const theme = await Theme.findOne({where: {id}})
        if (!theme) {
            return next(ApiError.internal( 'Тема не найдена'))
        }

        return res.json(theme)
    }

    async getOne(req, res, next) {
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
        
        themes.sort((a, b) => a.theme_id - b.theme_id)
       
        program.dataValues["themes"] = themes;
    
        return res.json(program)
    }

    async deleteProgram(req, res, next) {
        const {id} = req.body;
        const program = await Program.findOne({
            where: {
              id: id,
            },
          })
        if (!program) {
            return next(ApiError.internal( 'Программа для удаления не найдена'))
        }

        const users = await User.findAll({where: {
            programs_id: [program.id]
        }})
       
        if (users[0]) {

            return next(ApiError.internal(`Программу уже проходят ${users.length} пользователей и ее удаление невозможно!`))
        }
          
        let themes = await Theme.findAll({where: {programId: program.id}})

        if (!themes) {
            return next(ApiError.internal( 'Темы для удаления не найдены'))
        }
      
        themes.forEach(async (theme) => {
            if (theme.presetation_src) {
                    
                fs.unlink(path.resolve(__dirname, '..', 'static', theme.presetation_src), (err) => {
                    if (err) throw err;

                    
                }); 
            }
            let puncts = await Punct.findAll({where: {themeId: theme.id}})
            if (!puncts) {
                return next(ApiError.internal( 'Пункты для удаления не найдены'))
            }
            puncts.forEach(async (punct) => {
                try {
                    if (punct.lection_src) {
                    
                        fs.unlink(path.resolve(__dirname, '..', 'static', punct.lection_src), (err) => {
                            if (err) throw err;
    
                          
                        }); 
                    } 
                } catch(e) {
                    return next(ApiError.internal( 'Ошибка при удалении файлов с сервера'))
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

    async remake(req, res, next) {
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

        if (number_of_test < program.number_of_test) {
            return next(ApiError.internal( 'Нельзя удалять тесты при изменении программы'))
        }

        program.title = title;
        program.number_of_practical_work = number_of_practical_work;
        program.number_of_test = number_of_test;
        program.number_of_videos = number_of_videos;

        let theme;
        let punct;
        theme = await Theme.destroy({where: {programId: program.id}})
        
        const statistics = await Statistic.findAll({where: {programs_id: program.id}})

        statistics.forEach( async statistic => {
            for (let i = 0; i < number_of_test-statistic.max_tests; i++) {
                const themeStatistic = await ThemeStatistic.create({
                    theme_id: i,
                    well: false, 
                    statisticId: statistic.id
                })
                const punctStatistic = await PunctStatistic.create({   
                    punct_id: i,
                    lection: false,
                    practical_work: null,
                    video: false,
                    test_bool: false,
                    themeStatisticId: themeStatistic.id
                })
            }
            statistic.max_videos = number_of_videos;
            statistic.max_tests = number_of_test;
            statistic.max_practical_works = number_of_practical_work;
            
            statistic.save();
        })

    
        parsedThemes.forEach( async (theme_el)  =>  {
                console.log("############################", presentationNames[theme_el.presentation_id], theme_el.presentation_id, "############################");
                if (theme_el.lection_src) {
                    mammoth.convertToHtml({path: path.resolve(__dirname, '..', 'static', typeof theme_el.lection_src == 'string' ? theme_el.lection_src :  theme_arr_of_titles[theme_el.lection_id])})
                    .then(async function(result){
                        var html = result.value;
                        await Theme.create({
                            title: theme_el.title, 
                            programId: program.id, 
                            theme_id: theme_el.theme_id,
                            presentation_src: theme_el.presentation_src ? theme_el.presentation_src : presentationNames[theme_el.presentation_id] ,
                            presentation_title: theme_el.presentation_title, 
                            presentation_id: theme_el.presentation_id,
                            video_src: theme_el.video_src,
                            lection_src: typeof theme_el.lection_src == 'string' ? theme_el.lection_src : theme_arr_of_titles[theme_el.lection_id], 
                            lection_html: html, 
                            lection_title: theme_el.lection_title, 
                            lection_id: theme_el.lection_id
                        })
                        .then(theme => {
                            theme_el.puncts.forEach(async (punct_el, i) => {
                                
                                if (arr_of_titles[punct_el.lection_id]) {
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
                                } else {
                                    punct = await Punct.create({
                                        title: punct_el.title, 
                                        themeId: theme.id, 
                                        video_src: punct_el.video_src, 
                                        lection_src: typeof punct_el.lection_src == 'string' ? punct_el.lection_src :  arr_of_titles[punct_el.lection_id], 
                                        lection_html: punct_el.lection_html, 
                                        lection_title: punct_el.lection_title, 
                                        lection_id: punct_el.lection_id, 
                                        practical_work: punct_el.practical_work, 
                                        test_id: punct_el.test_id,
                                        punct_id: punct_el.punct_id
                                    })
                                }
                               
                                
                                
                            
                
                            })
                            theme_el.puncts.forEach(async (punct_el, i) => {
                                punct = await Punct.destroy({where: {themeId: theme.id}})
                            })
                        })
                    })
                } else {
                    
                    await Theme.create({
                        title: theme_el.title, 
                        programId: program.id, 
                        theme_id: theme_el.theme_id,
                        presentation_src: typeof theme_el.presentation_src == 'string' ? theme_el.presentation_src : presentationNames[theme_el.presentation_id] ,
                        presentation_title: theme_el.presentation_title, 
                        presentation_id: theme_el.presentation_id,
                        video_src: theme_el.video_src,
                        lection_src: ``, 
                        lection_html: ``, 
                        lection_title: ``, 
                        lection_id: theme_el.lection_id
                    })
                    .then(theme => {
                        theme_el.puncts.forEach(async (punct_el, i) => {
                           
                            if (arr_of_titles[punct_el.lection_id]) {
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
                            } else {
                                punct = await Punct.create({
                                    title: punct_el.title, 
                                    themeId: theme.id, 
                                    video_src: punct_el.video_src, 
                                    lection_src: typeof punct_el.lection_src == 'string' ? punct_el.lection_src :  arr_of_titles[punct_el.lection_id], 
                                    lection_html: punct_el.lection_html, 
                                    lection_title: punct_el.lection_title, 
                                    lection_id: punct_el.lection_id, 
                                    practical_work: punct_el.practical_work, 
                                    test_id: punct_el.test_id,
                                    punct_id: punct_el.punct_id
                                })
                            }
                            
                        
            
                        })
                        theme_el.puncts.forEach(async (punct_el, i) => {
                            punct = await Punct.destroy({where: {themeId: theme.id}})
                        })
                    })
                    
                }
           
               
            
            
            
        })

        program.save();
        

        

        
        return res.json({"messange": "err"})
        
    }
}

module.exports = new ProgramController();