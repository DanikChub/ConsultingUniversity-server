const Router = require('express');
const router = new Router();

const ApplicationController = require('../controllers/applicationController');
const checkRole = require('../middleware/checkRoleMiddleware')

router.post('/', ApplicationController.create)
router.get('/', checkRole('ADMIN'), ApplicationController.getAll)
router.post('/delete', checkRole('ADMIN'), ApplicationController.destroyApplication)

module.exports = router;