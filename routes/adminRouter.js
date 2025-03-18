const Router = require('express');
const router = new Router();

const AdminController = require('../controllers/adminController')

router.post('/registration', AdminController.registration)
router.post('/login', AdminController.login)
router.get('/auth', AdminController.check)

module.exports = router;