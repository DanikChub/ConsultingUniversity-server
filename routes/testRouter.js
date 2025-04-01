const Router = require('express');
const router = new Router();

const TestController = require('../controllers/testController')
const checkRole = require('../middleware/checkRoleMiddleware')

router.post('/', checkRole('ADMIN'), TestController.create)
router.get('/:id', TestController.getOne)
router.post('/remake', checkRole('ADMIN'), TestController.remakeTest)

module.exports = router;