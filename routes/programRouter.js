const Router = require('express');
const router = new Router();

const ProgramController = require('../controllers/programController')
const checkRole = require('../middleware/checkRoleMiddleware')

router.post('/', checkRole('ADMIN'), ProgramController.create)
router.get('/', ProgramController.getAll)
router.post('/delete', checkRole('ADMIN'), ProgramController.deleteProgram)
router.post('/remake', checkRole('ADMIN'), ProgramController.remake)
router.get('/:id', ProgramController.getOne)

module.exports = router;