const { Statistic, ThemeStatistic, PunctStatistic } = require("../models/models");
const { Op } = require("sequelize")
const ApiError = require('../error/ApiError')

class StatisticController {
    async updateVideos(req, res) {
        const {users_id, programs_id, punct_id} = req.body;

        let punctStatic = await PunctStatistic.findOne({
            where: {
                id: punct_id
            }
        })
    
        const statistic = await Statistic.findOne({
            where: {
                [Op.and]: [{ users_id: users_id, programs_id: programs_id }]
            }
        })


        if (statistic.well_videos < statistic.max_videos && !punctStatic.video) {
            statistic.well_videos += 1;
            punctStatic.video = true;
        }
        
        statistic.save();
        punctStatic.save();
        return res.json(statistic)
    }

    async updateTests(req, res) {
        const {users_id, programs_id, punct_id, theme_id} = req.body;

        let punctStatic = await PunctStatistic.findOne({
            where: {
                id: punct_id
            }
        })

        const statistic = await Statistic.findOne({
            where: {
                [Op.and]: [{ users_id: users_id, programs_id: programs_id }]
            }
        })

    

        if (statistic.well_tests < statistic.max_tests && !punctStatic.test_bool) {
            statistic.well_tests += 1;
            punctStatic.test_bool = true
        }


        const theme = await ThemeStatistic.findOne({
            where: {
                id: theme_id
            }
        })

        theme.well = true;
        theme.save();

        
        statistic.save();
        punctStatic.save();
        return res.json(statistic)
    }

    async updatePracticalWorks(req, res) {
        const {users_id, programs_id, punct_id} = req.body;

        
        
        let punctStatic = await PunctStatistic.findOne({
            where: {
                id: punct_id
            }
        })
        
   
        const statistic = await Statistic.findOne({
            where: {
                [Op.and]: [{ users_id: users_id, programs_id: programs_id }]
            }
        })
        if (statistic.well_practical_works < statistic.max_practical_works && !punctStatic.lection) {
            
            statistic.well_practical_works += 1;
            punctStatic.lection = true;
        }
        
        statistic.save();
        punctStatic.save();

        return res.json(statistic)
    }

    async getStatistics(req, res, next) {
        const {users_id, programs_id} = req.body;
        
        if (!users_id) {
            return next(ApiError.internal('Нет id пользователя'))
        }

        if (!programs_id) {
            return next(ApiError.internal('Нет id программы'))
        }
        const statistic = await Statistic.findOne({
            where: {
                [Op.and]: [{ users_id: users_id, programs_id: programs_id }]
            }
        })
     
        let themes;
      
            if (statistic) {
                themes = await ThemeStatistic.findAll(
                    {
                        where: {
                            statisticId: statistic.id
                        }
                    }
                )
                let arrOfThemeId = []
    
                themes.forEach(async theme => {
                    
                    arrOfThemeId.push(theme.dataValues.id);
                })
                
                let puncts = await PunctStatistic.findAll(
                    {
                        where: {
                            themeStatisticId: {
                                [Op.or]: arrOfThemeId,
                            }
                            
                        }
                    }
                )
                
                themes.forEach((theme, i) => {
                    let arr = [];
                    puncts.forEach((punct) => {
                        
                        if (theme.id == punct.themeStatisticId) {
                            arr.push(punct)
                        }
    
                    
                    })
                    arr.sort((a,b) => a.id-b.id);
                    theme.dataValues["punctsStatistic"] = arr;
                })
    
                themes.sort((a, b) => a.id - b.id);
                statistic.dataValues["themesStatistic"] = themes;
            }
       
        
        
      
        console.log(statistic);
        

        return res.json(statistic)
    }
}

module.exports = new StatisticController();