const Plans = require('../models/plan.js')
const User = require('../models/user.js')
const Badge = require('./Badge.js')

const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const { body, param, query, validationResult } = require('express-validator')
require('dotenv').config()

class Plan {
    static pointsPerCreatedPlans = 2

    static validators = {
        create: [
            body('name').escape().trim().matches(/[a-zA-Z0-9\s]+/).not().isEmpty(),
            body('description').escape().trim().matches(/^([a-zA-Z0-9\s]+|)$/),
        ],
        read: [param('id').isMongoId()],
        update: [
            param('id').isMongoId().optional(),
            query('updateProgress').isBoolean().optional().optional(),
            body('name').escape().trim().matches(/[a-zA-Z0-9\s]+/).not().isEmpty().optional(),
            body('description').escape().trim().matches(/[a-zA-Z0-9\s]+/).optional(),
            body('completedTask').escape().trim().matches(/[a-zA-Z0-9\s]+/).optional()
        ],
        delete: [param('id').isMongoId()]
    }

    static async create(req, res, next) {
        if (!req.body) return res.status(400).json({ message: 'Bad Request: missing request body' })

        const { accessToken } = req.cookies

        if (!accessToken) return res.status(400).json({ message: 'Bad Request: missing access token' })

        const userId = await jwt.decode(accessToken).sub

        const errors = validationResult(req)

        if (!errors.isEmpty()) return res.status(400).json({ message: `Bad Request: validation error(s): ${errors}` })

        let model = {
            name: req.body.name,
            description: '',
            progress: 0,
            tasks: [],
            completed: false
        }

        if (req.body.description) model.description = req.body.description
        if (req.body.requiredXp) model.requiredXp = req.body.requiredXp
        if (req.body.tasks) {
            model.tasks = req.body.tasks
            model.tasks.forEach(task => {
                task.completed = false
                task.value = Number(100 / model.tasks.length)
            })
        }

        Plans.create(model, (err, plan) => {
            if (err) return res.status(409).json({ message: 'Conflict: cannot create plan document' })

            Plans.updateOne({ _id: plan._id }, { tasks: model.tasks }, err => {
                if (err) return res.status(409).json({ message: 'Conflict: cannot update plan document with tasks' })

                User.updateOne({ _id: userId },
                    {
                        $push: { plans: plan._id },
                        $inc: {
                            'stats.plans.created': 1,
                            'stats.points': this.pointsPerCreatedPlans
                        }
                    },
                    { new: true },
                    (err, updatedPlan) => {
                        if (err) return res.status(409).json({ message: 'Conflict: cannot populate user with plan' })

                        // create badge
                        let responseObject = {}

                        if (userId) {
                            User.findById(userId)
                                .exec((err, user) => {
                                    if (err) return res.status(409).json({ message: 'Conflict: cannot create user badge' })

                                    if (user.stats.plans.created === 2) {
                                        Badge.createBadge('Modelling', userId)
                                        responseObject.badge = { name: 'Modelling', state: 'created' }
                                    }
                                    else if ([4, 6, 8].includes(user.stats.plans.created)) {
                                        Badge.levelUpBadge('Modelling', `Create ${user.stats.plans.created} plans`, userId)
                                        responseObject.badge = { name: 'Modelling', state: 'updated' }
                                    }
                                })
                        }

                        responseObject = { ...responseObject, id: plan._id }

                        return res.status(201).json(responseObject)
                    })
            })
        })
    }

    static async readAll(req, res, next) {
        const { accessToken } = req.cookies

        if (!accessToken) return res.status(400).json({ message: 'Bad Request: missing access token' })

        const userId = await jwt.decode(accessToken).sub

        User.findById(userId, (err, user) => {
            if (err) return res.status(409).json({ message: 'Conflict: cannot find user' })
            if (!user || !user.plans) return res.status(409).json({ message: 'Conflict: user doesn\'t have plans' })

            Plans.find({ _id: { $in: user.plans } }, (err, plans) => {
                if (err) return res.status(409).json({ message: 'Conflict: cannot get all plans' })

                return res.json(plans)
            })
        })
    }

    static async read(req, res, next) {
        if (!req.params.id) return res.status(400).json({ message: 'Bad Request: missing query parameter' })

        const { accessToken } = req.cookies

        if (!accessToken) return res.status(400).json({ message: 'Bad Request: missing access token' })

        const userId = await jwt.decode(accessToken).sub

        const errors = validationResult(req)

        if (!errors.isEmpty()) return res.status(400).json({ message: `Bad Request: invalid query parameter.Errors:  ${errors}` })

        User.findById(userId, (err, user) => {
            if (err) return res.status(409).json({ message: 'Conflict: cannot find user' })
            if (!user || !user.plans) return res.status(409).json({ message: 'Conflict: user doesn\t have plans' })
            if ((user.plans.find(plan => plan._id == req.params.id)).length === 0) return res.status(409).json({ message: 'Conflict user doesn\'t have this plan' })

            Plans.findById(req.params.id, (err, plan) => {
                if (err) return res.status(409).json({ message: 'Conflict: cannot find plan' })

                return res.json(plan)
            })
        })
    }

    static async update(req, res, next) {
        if (!req.body) return res.status(400).json({ message: 'Bad Request: missing request body' })
        if (!req.params.id) return res.status(400).json({ message: 'Bad Request: missing query parameter' })

        const { accessToken } = req.cookies

        if (!accessToken) return res.status(401).json({ message: 'Bad Request: missing access token' })

        const userId = await jwt.decode(accessToken).sub

        const errors = validationResult(req)

        if (!errors.isEmpty()) return res.status(400).json({ message: `Bad Request: invalid query parameter. Errors: ${errors}` })

        // an object to store the data sent when everything works as expected
        // it is used to send additional data when a badge is created
        // for the purpose to display a notification on the front-end
        let responseObject = {}

        Plans.findById(req.params.id, (err, plan) => {
            if (err) return res.status(409).json({ message: 'Conflict: cannot find plan' })

            let update = req.body
            update.completed = false
            update.progress = plan.progress

            let updateUser = {}

            if (req.query.updateProgress && !plan.completed && update.completedTask) {
                update.tasks = plan.tasks
                update.tasks.forEach(async (task) => {
                    if (task.name == update.completedTask) {
                        task.completed = true
                        updateUser = { $inc: { 'stats.plans.completedTasks': 1 } }

                        if (task.value + plan.progress >= 100) {
                            update.completed = true
                            update.progress = 100
                            updateUser = {
                                $inc: {
                                    'stats.plans.completed': 1,
                                    'stats.plans.completedTasks': 1
                                }
                            }

                            // create badge
                            if (userId) {
                                User.findById(userId)
                                    .exec((err, user) => {
                                        if (err) return res.status(409).json({ message: 'Conflict: cannot create user badge' })

                                        if (user.stats.plans.completed === 0) {
                                            Badge.createBadge('Strategian', userId)
                                            responseObject.badge = { name: 'Strategian', state: 'created' }
                                        }
                                        else if ([2, 4, 6].includes(user.stats.plans.completed)) {
                                            Badge.levelUpBadge('Strategian', `Complete ${user.stats.plans.completed + 1} plans`, userId)
                                            responseObject.badge = { name: 'Strategian', state: 'updated' }
                                        }
                                    })
                            }
                        }
                        else update.progress += task.value
                    }
                })

                delete update.completedTask
            }

            Plans.findOneAndUpdate({ _id: req.params.id }, update, { new: true }, (err, updatedPlan) => {
                if (err) return res.status(409).json({ message: 'Conflict: cannot update plan' })

                User.updateOne({ _id: userId }, updateUser, err => {
                    if (err) return res.status(409).json({ message: 'Conflict: cannot update user' })

                    responseObject = { ...responseObject, updatedPlan }

                    return res.json(responseObject)
                })
            })
        })
    }

    static async delete(req, res, next) {
        if (!req.params.id) return res.status(400).json({ message: 'Bad Request: missing query parameter' })

        const { accessToken } = req.cookies

        if (!accessToken) return res.status(400).json({ message: 'Bad Request: missing access token' })

        const userId = await jwt.decode(accessToken).sub

        const errors = validationResult(req)

        if (!errors.isEmpty()) return res.status(400).json({ message: `Bad Request: invalid query parameter. Errors: ${errors}` })

        // delete the plan from the user document first
        User.updateOne({ _id: userId }, { $pull: { plans: mongoose.Types.ObjectId(req.params.id) } }, err => {
            if (err) return res.status(409).json({ message: 'Conflict: cannot pull plan from user' })

            // then delete the plan itself
            Plans.deleteOne({ _id: req.params.id }, err => {
                if (err) return res.status(409).json({ message: 'Conflict: cannot delete plan' })

                return res.json({ message: 'Plan deleted' })
            })
        })
    }
}

module.exports = Plan