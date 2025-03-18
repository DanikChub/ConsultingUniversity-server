
const Router = require('express');
const router = new Router();

const adminRouter = require('./adminRouter')
const programRouter = require('./programRouter')
const userRouter = require('./userRouter')
const application = require('./application');
const testRouter = require('./testRouter');

router.use('/user', userRouter)
router.use('/admin', adminRouter)
router.use('/program', programRouter)
router.use('/application', application)
router.use('/test', testRouter)

module.exports = router;