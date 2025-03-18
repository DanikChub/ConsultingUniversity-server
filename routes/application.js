const Router = require('express');
const router = new Router();

const ApplicationController = require('../controllers/applicationController');
const checkRole = require('../middleware/checkRoleMiddleware')

router.post('/', ApplicationController.create)
router.get('/', checkRole('ADMIN'), ApplicationController.getAll)

module.exports = router;