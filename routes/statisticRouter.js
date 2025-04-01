const Router = require('express');
const router = new Router();

const StatisticController = require('../controllers/statisticController')


router.post('/updateVideos', StatisticController.updateVideos)
router.post('/updateTests', StatisticController.updateTests)
router.post('/updatePracticalWorks', StatisticController.updatePracticalWorks)
router.post('/', StatisticController.getStatistics)

module.exports = router;