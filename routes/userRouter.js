const Router = require('express');
const router = new Router();
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')

const checkRole = require('../middleware/checkRoleMiddleware')

router.post('/registration', checkRole('ADMIN'), userController.registration)
router.post('/remake', checkRole('ADMIN'), userController.remakeUser)
router.post('/delete', checkRole('ADMIN'), userController.deleteUser)
router.post('/set_well_tests', userController.setWellTests)
router.post('/set_well_videos', userController.setWellVideos)
router.post('/set_well_practical_works', userController.setWellPracticalWorks)
router.post('/login', userController.login)
router.post('/forgot_password', userController.forgotPassword)
router.post('/check_forgot_password', userController.checkForgotPassword)
router.get('/auth', authMiddleware, userController.check)
router.get('/getUser/:id', userController.getUserById)
router.get('/getUser/', checkRole('ADMIN'), userController.getAllUsers)
router.post('/setGraduationDate/', userController.setGraduationDate)

module.exports = router;