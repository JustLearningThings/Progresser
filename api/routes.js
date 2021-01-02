const express = require('express')
const router = express.Router()

const auth = require('./auth.js')

const { Skill, Plan, UserController } = require('./helpers/helpers')

router.get('/all', auth.authroizeRequest, (req, res) => res.send('YOU\'RE A USER ^^'))
router.get('/any', (req, res) => res.send('YOURE A VISITOR'))

router.post('/skills',
    auth.authroizeRequest,
    Skill.validators.create, 
    (req, res, next) => Skill.create(req, res, next)
)
router.get('/skills', auth.authroizeRequest, (req, res, next) => Skill.readAll(req, res, next))
router.get('/skills/:id',
    auth.authroizeRequest,
    Skill.validators.read,
    (req, res, next) => Skill.read(req, res, next)
)
router.put('/skills/:id',
    auth.authroizeRequest,
    Skill.validators.update,
    (req, res, next) => Skill.update(req, res, next)
)
router.delete('/skills/:id',
    auth.authroizeRequest,
    Skill.validators.delete,
    (req, res, next) => Skill.delete(req, res, next)
)

router.post('/plans',
    auth.authroizeRequest,
    Plan.validators.create,
    (req, res, next) => Plan.create(req, res, next)
)
router.get('/plans', auth.authroizeRequest, (req, res, next) => Plan.readAll(req, res, next))
router.get('/plans/:id',
    auth.authroizeRequest,
    Plan.validators.read,
    (req, res, next) => Plan.read(req, res, next)
)
router.put('/plans/:id',
    auth.authroizeRequest,
    Plan.validators.update,
    (req, res, next) => Plan.update(req, res, next)
)
router.delete('/plans/:id',
    auth.authroizeRequest,
    Plan.validators.delete,
    (req, res, next) => Plan.delete(req, res, next)
)

router.get('/user',
    auth.authroizeRequest,
    (req, res, next) => UserController.read(req, res, next)
)

module.exports = router