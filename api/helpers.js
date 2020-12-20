const Skills = require('./models/skill.js')
const Plans = require('./models/plan.js')
const Badges = require('./models/badge.js')
const User = require('./models/user.js')
const badgeList = require('./badges.js')

const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const { body, param, query, validationResult } = require('express-validator')
require('dotenv').config()

// using classes with static methods as a means to organize code
class Skill {
    static pointsPerCreatedSkills = 2

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

        // create the skill
        Skills.create(model, (err, skill) => {
            if (err) return res.status(409).json({ message: 'Conflict: cannot create skill document' })

            // then add the actions to the skill
            Skills.updateOne({ _id: skill._id }, { actions: model.actions }, err => {
                if (err) return res.status(409).json({ message: 'Conflict: cannot update skill document with actions' })

                // then populate the user skills filed with the newly created skill
                User.updateOne({ _id: userId }, {
                        $push: { skills: skill._id },
                        $inc: {
                            'stats.skills.created': 1,
                            'stats.points': this.pointsPerCreatedSkills
                        }
                    },
                    { new: true },
                    (err, updatedSkill) => {
                        if (err) return res.status(409).json({ message: 'Conflict: cannot populate user with skill' })

                        return res.status(201).json({ id: skill._id })
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
            if (!user || !user.skills) return res.status(409).json({ message: 'Conflict: user doesn\'t have skills' })
        
            Skills.find({ _id: { $in: user.skills } }, (err, skills) => {
                if (err) return res.status(409).json({ message: 'Conflict: cannot get all skills' })

                return res.json(skills)
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
            if (!user || !user.skills) return res.status(409).json({ message: 'Conflict: user doesn\'t have skills' })
            if ((user.skills.find(skill => skill._id == req.params.id)).length === 0) return res.status(409).json({ message: 'Conflict user doesn\'t have this skill' })
        
            Skills.findById(req.params.id, (err, skill) => {
                if (err) return res.status(409).json({ message: 'Conflict: cannot find skill' })

                return res.json(skill)
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

        Skills.findById(req.params.id, (err, skill) => {
            if (err) return res.status(409).json({ message: 'Conflict: cannot find skill' })

            let update = req.body
            let updateUser = {}

            if (update.value) update.value = Number(update.value)

            // if query asks to update xp or level, do this
            if (req.query.updateXp === 'true' && !req.query.updateLevel && req.body.value) {
                // if not leveling up, just update the xp value
                if (skill.requiredXp > skill.xp + req.body.value) {
                    update = { xp: skill.xp + req.body.value }
                    updateUser = { $inc: { 'stats.skills.earnedXp': req.body.value } }
                }
                // if leveling up, update the level, and add to that new level the difference of the xp
                else {
                    update = {
                        level: skill.level + 1,
                        requiredXp: skill.requiredXp + process.env.SKILL_LEVELUP_MULTIPLIER * (skill.level + 1),
                        xp: 0 + (skill.xp + req.body.value) - skill.requiredXp
                    }

                    updateUser = { $inc: {
                        'stats.skills.earnedXp': req.body.value,
                        'stats.skills.completedLevels': 1
                    }}
                }
            }
            else if (req.query.updateLevel === 'true' && !req.query.updateXp) {
                update = {
                    level: skill.level + 1,
                    requiredXp: skill.requiredXp + process.env.SKILL_LEVELUP_MULTIPLIER * (skill.level + 1)
                }

                updateUser = { $inc: { 'stats.skills.completedLevels': 1 } }
            }

            Skills.findOneAndUpdate({ _id: req.params.id }, update, { new: true }, (err, updatedSkill) => {
                if (err) return res.status(409).json({ message: 'Conflict: cannot update skill' })

                User.findByIdAndUpdate(userId, updateUser ,err => {
                    if (err) return res.status(409).json({ message: 'Conflict: cannot update user' })

                    return res.json(updatedSkill)
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
        // it is used to sent additional data when a badge is created
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
                            updateUser = { $inc: {
                                'stats.plans.completed': 1,
                                'stats.plans.completedTasks': 1
                            }}

                            // create badge
                            if (userId) {
                                User.findById(userId)
                                .populate({ path: 'plans' })
                                .exec((err, user) => {
                                    if (err) return res.status(409).json({ message: 'Conflict: cannot create user badge' })

                                    if (user.stats.plans.completed === 0) {
                                        Badge.createBadge('Strategian', userId)
                                        responseObject.badge = { name: 'Strategian', state: 'created' }
                                    }
                                    else if ([2, 4, 6].includes(user.stats.plans.completed)) {
                                        Badge.levelUpBadge('Strategian', `Complete ${user.stats.plans.completed + 1} plans`,userId)
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

class Badge {
    // each tier has a value to update the user xp based on earned badge tier
    static tiers = [
        { name: 'Common', value: 15 },
        { name: 'Rare', value: 25 },
        { name: 'Honored', value: 50 },
        { name: 'Legendary', value: 100 },
    ]

    // add error handling
    static async createBadge(name, userId) {
        let badge = badgeList.find(b => b.name === name)

        badge.tier = this.tiers[0].name

        User.findById(userId, (err, user) => {
            if (err) return false

            // dont create the badge if the user already has it
            if (user.badges.find(b => b.name === name)) return false

            User.findByIdAndUpdate(userId, {
                $push: { badges: badge },
                $inc: {
                    'stats.earnedBadges': 1,
                    'stats.points': this.tiers[0].value
                }
            }, err => err ? false : true)
        })
    }

    static levelUpBadge(name, description, userId) {
        let badge = badgeList.find(b => b.name === name)

        // if current tier is the last one, do nothing
        if (badge.tier === this.tiers[this.tiers.length - 1]) return true
      
        // update tier
        const tierId = this.tiers.findIndex(t => t.name === badge.tier) + 1
        badge.tier = this.tiers[tierId].name

        User.findById(userId, (err, user) => {
            if (err) return false

            const badgeIdx = user.badges.findIndex(b => b.name === name)

            const update = {
                '$inc': {
                    'stats.earnedBadges': 1,
                    'stats.points': this.tiers[tierId].value
                },
                '$set': {}
            }

            update['$set'][`badges.${badgeIdx}.tier`] = badge.tier
            if (description) update['$set'][`badges.${badgeIdx}.description`] = description

            User.updateOne({ _id: userId, 'badges.name': name}, update , err => err ? false : true)
        })
    }
}

class UserController {
    static async read(req, res, next) {
        const { accessToken } = req.cookies

        if (!accessToken) return res.status(400).json({ message: 'Bad Request: missing access token' })

        const userId = await jwt.decode(accessToken).sub

        User.findById(userId)
        .populate([
            { path: 'skills' },
            { path: 'plans' }
        ])
        .exec((err, foundUser) => {
            if (err || !foundUser) return res.status(409).json({ message: 'Conflict: cannot find user' })

            const user = foundUser.toObject()

            delete user.refresh
            delete user.password
            delete user._id
            delete user.__v

            res.json(user)
        })
    }
}

// remove badge model 
module.exports = {
    Skill,
    Plan,
    Badge,
    UserController
}