const { Statistic } = require("../models/models");
const { Op } = require("sequelize")
const ApiError = require('../error/ApiError')

class StatisticController {
    async updateVideos(req, res) {
        const {users_id, programs_id} = req.body;

        const statistic = await Statistic.findOne({
            where: {
                [Op.and]: [{ users_id: users_id, programs_id: programs_id }]
            }
        })
        if (statistic.well_videos < statistic.max_videos) {
            statistic.well_videos += 1;
        }
        
        statistic.save();
        return res.json(statistic)
    }

    async updateTests(req, res) {
        const {users_id, programs_id} = req.body;

        const statistic = await Statistic.findOne({
            where: {
                [Op.and]: [{ users_id: users_id, programs_id: programs_id }]
            }
        })
        if (statistic.well_tests < statistic.max_tests) {
            statistic.well_tests += 1;
        }
        
        statistic.save();
        return res.json(statistic)
    }

    async updatePracticalWorks(req, res) {
        const {users_id, programs_id} = req.body;

        const statistic = await Statistic.findOne({
            where: {
                [Op.and]: [{ users_id: users_id, programs_id: programs_id }]
            }
        })
        if (statistic.well_practical_works < statistic.max_practical_works) {
            statistic.well_practical_works += 1;
        }
        
        statistic.save();
        return res.json(statistic)
    }

    async getStatistics(req, res) {
        const {users_id, programs_id} = req.body;

        const statistic = await Statistic.findOne({
            where: {
                [Op.and]: [{ users_id: users_id, programs_id: programs_id }]
            }
        })

        return res.json(statistic);
    }
}

module.exports = new StatisticController();