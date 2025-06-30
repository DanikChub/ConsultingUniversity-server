const Router = require('express');
const router = new Router();

const PracticalWorkController = require('../controllers/practicalWorkController');
const checkRole = require('../middleware/checkRoleMiddleware')

router.post('/', PracticalWorkController.create)
router.post('/delete', PracticalWorkController.deletePracticalWork)
router.get('/:id', PracticalWorkController.getOne)
router.post('/getOneToUser', PracticalWorkController.getOneToUser)
router.get('/', PracticalWorkController.getAll)
router.post('/answer', checkRole('ADMIN'), PracticalWorkController.createAnswer)

module.exports = router;