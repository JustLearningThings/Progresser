const Skills = require('./models/skill.js')
const Plans = require('./models/plan.js')
const Badges = require('./models/badge.js')
const User = require('./models/user.js')

const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const { body, param, query, validationResult } = require('express-validator')
require('dotenv').config()

class Skill {
    static validators = {
        create: [
            body('name').escape().trim().matches(/[a-zA-Z0-9\s]+/).not().isEmpty(),
            body('description').escape().trim().matches(/^([a-zA-Z0-9\s]+|)$/),
            // body('levels').escape().isNumeric().not().isEmpty()
        ],
        read: [ param('id').isMongoId() ],
        update: [
            param('id').isMongoId().optional(),
            query('updateXp').isBoolean().optional().optional(),
            query('updateLevel').isBoolean().optional().optional(),
            body('name').escape().trim().matches(/[a-zA-Z0-9\s]+/).not().isEmpty().optional(),
            body('description').escape().trim().matches(/[a-zA-Z0-9\s]+/).optional(),
            // body('levels').escape().isNumeric().not().isEmpty().optional(),
            body('level').escape().isNumeric().optional(),
            body('xp').escape().isNumeric().optional(),
            body('requiredXp').escape().isNumeric().optional()
        ],
        delete: [ param('id').isMongoId() ]
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
            level: 1,
            xp: 0,
            // levels: req.body.levels,
            requiredXp: 10,
            actions: []
        }

        // optional fields
        if (req.body.description) model.description = req.body.description
        if (req.body.requiredXp) model.requiredXp = req.body.requiredXp
        if (req.body.actions) {
            model.actions = req.body.actions
            model.actions.forEach(action => action.value = Number(action.value))
        }
        // may need to validate actions
        // if (req.body.actions) model.actions = req.body.actions

        // create the skill
        Skills.create(model, (err, skill) => {
            if (err) return res.status(409).json({ message: 'Conflict: cannot create skill document' })

            // then add the actions to the skill
            // Skills.updateOne({ _id: skill._id }, { $push: { actions: { $each: req.body.actions } } }, err => {
            Skills.updateOne({ _id: skill._id }, { actions: model.actions }, err => {
                if (err) return res.status(409).json({ message: 'Conflict: cannot update skill document with actions' })

                // then populate the user skills filed with the newly created skill
                // req.user._id , hmmm...
                User.updateOne({ _id: userId }, { $push: { skills: skill._id } }, { new: true }, (err, updatedSkill) => {
                    if (err) return res.status(409).json({ message: 'Conflict: cannot populate user with skill' })

                    return res.status(201).json({ id: skill._id })
                })
            })
        })
    }

    static readAll(req, res, next) {
        Skills.find({}, (err, skills) => {
            if (err) return res.status(409).json({ message: 'Conflict: cannot get all skills' })

            return res.json(skills)
        })
    }

    // perhaps should check if the desired skills is in
    // the skill list of the authenticated user (through JWT's user id from payload)
    static read(req, res, next) {
        if (!req.params.id) return res.status(400).json({ message: 'Bad Request: missing query parameter' })

        const { accessToken } = req.cookies

        if (!accessToken) return res.status(400).json({ message: 'Bad Request: missing access token' })

        const errors = validationResult(req)

        if (!errors.isEmpty()) return res.status(400).json({ message: `Bad Request: invalid query parameter.Errors:  ${errors}` })

        Skills.findById(req.params.id, (err, skill) => {
            if (err) return res.status(409).json({ message: 'Conflict: cannot find skill' })

            return res.json(skill)
        })
    }

    static async update(req, res, next) {
        if (!req.body) return res.status(400).json({ message: 'Bad Request: missing request body' })
        if (!req.params.id) return res.status(400).json({ message: 'Bad Request: missing query parameter' })

        const { accessToken } = req.cookies

        if (!accessToken) return res.status(401).json({ message: 'Bad Request: missing access token' })

        const errors = validationResult(req)

        if (!errors.isEmpty()) return res.status(400).json({ message: `Bad Request: invalid query parameter. Errors: ${errors}` })

        Skills.findById(req.params.id, (err, skill) => {
            if (err) return res.status(409).json({ message: 'Conflict: cannot find skill' })

            let update = req.body

            if (update.value) update.value = Number(update.value)

            // if query asks to update xp or level, do this
            if (req.query.updateXp === 'true' && !req.query.updateLevel && req.body.value) {
                // if not leveling up, just update the xp value
                if (skill.requiredXp > skill.xp + req.body.value) update = { xp: skill.xp + req.body.value }
                // if leveling up, update the level, and add to that new level the difference of the xp
                else update = {
                    level: skill.level + 1,
                    requiredXp: skill.requiredXp + process.env.SKILL_LEVELUP_MULTIPLIER * (skill.level + 1),
                    xp: 0 + (skill.xp + req.body.value) - skill.requiredXp
                }
            }
            else if (req.query.updateLevel === 'true' && !req.query.updateXp) update = {
                level: skill.level + 1,
                requiredXp: skill.requiredXp + process.env.SKILL_LEVELUP_MULTIPLIER * (skill.level + 1)
            }

            Skills.findOneAndUpdate({ _id: req.params.id }, update, { new: true }, (err, updatedSkill) => {
                if (err) return res.status(409).json({ message: 'Conflict: cannot update skill' })

                return res.json(updatedSkill)
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

        // delete the skill from the user document
        // getting id from JWT token
        User.updateOne({ _id: userId }, { $pull: { skills: mongoose.Types.ObjectId(req.params.id) } }, err => {
            if (err) return res.status(409).json({ message: 'Conflict: cannot pull skill from user' })

            // then delete the skill itself
            Skills.deleteOne({ _id: req.params.id }, err => {
                if (err) return res.status(409).json({ message: 'Conflict: cannot delete skill' })

                return res.json({ message: 'Skill deleted' })
            })
        })
    }
}

class Plan {
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
        // if (req.body.tasks) {
        //     model.tasks = req.body.tasks
        //     model.tasks.forEach(task => {
        //         task.completed = false
        //         task.completionSteps = task.completionSteps ? task.completionSteps : 1
        //         task.value = Number(100 / model.tasks.length / task.completionSteps)
        //     })
        // }

        Plans.create(model, (err, plan) => {
            if (err) return res.status(409).json({ message: 'Conflict: cannot create plan document' })

            Plans.updateOne({ _id: plan._id }, { tasks: model.tasks }, err => {
                if (err) return res.status(409).json({ message: 'Conflict: cannot update plan document with tasks' })

                User.updateOne({ _id: userId }, { $push: { plans: plan._id } }, { new: true }, (err, updatePlan) => {
                    if (err) return res.status(409).json({ message: 'Conflict: cannot populate user with plan' })

                    return res.status(201).json({ id: plan._id })
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
            if (!user || !user.plans) return res.status(409).json({ message: 'Conflict: user doesnt have plans' })

            Plans.find({ _id: { $in: user.plans } }, (err, plans) => {
                if (err) return res.status(409).json({ message: 'Conflict: cannot get all plans' })

                return res.json(plans)
            })
        })

        // Plans.find({}, (err, plans) => {
        //     if (err) return res.status(409).json({ message: 'Conflict: cannot get all plans' })

        //     return res.json(plans)
        // })
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
            if (!user || !user.plans) return res.status(409).json({ message: 'Conflict: user doesnt have plans' })
            if ((user.plans.find(plan => plan._id == req.params.id)).length === 0) return res.status(409).json({ message: 'Conflict user doenst have this skill' })

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

        const errors = validationResult(req)

        if (!errors.isEmpty()) return res.status(400).json({ message: `Bad Request: invalid query parameter. Errors: ${errors}` })

        Plans.findById(req.params.id, (err, plan) => {
            if (err) return res.status(409).json({ message: 'Conflict: cannot find plan' })

            let update = req.body
            update.completed = false
            update.progress = plan.progress

            if (req.query.updateProgress && !plan.completed && update.completedTask) {
                update.tasks = plan.tasks
                update.tasks.forEach(task => {
                    if (task.name == update.completedTask) {
                        task.completed = true
                        if (task.value + plan.progress >= 100) {
                            update.completed = true
                            update.progress = 100
                        }
                        else update.progress += task.value
                    }
                })

                delete update.completedTask
            }

            Plans.findOneAndUpdate({ _id: req.params.id }, update, { new: true }, (err, updatePlan) => {
                if (err) return res.status(409).json({ message: 'Conflict: cannot update plan' })

                return res.json(updatePlan)
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

// update read and readAll on Skill object 
module.exports = {
    Skill,
    Plan,
}