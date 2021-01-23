const Skills = require('../models/skill.js')
const User = require('../models/user.js')
const Badge = require('./Badge.js')

const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const { body, param, query, validationResult } = require('express-validator')
require('dotenv').config()

class Skill {
    static pointsPerCreatedSkills = 2

    static validators = {
        create: [
            body('name').escape().trim().matches(/[a-zA-Z0-9\s]+/).not().isEmpty(),
            body('description').escape().trim().matches(/^([a-zA-Z0-9\s]+|)$/),
        ],
        read: [param('id').isMongoId()],
        update: [
            param('id').isMongoId().optional(),
            query('updateXp').isBoolean().optional().optional(),
            query('updateLevel').isBoolean().optional().optional(),
            body('name').escape().trim().matches(/[a-zA-Z0-9\s]+/).not().isEmpty().optional(),
            body('description').escape().trim().matches(/[a-zA-Z0-9\s]+/).optional(),
            body('level').escape().isNumeric().optional(),
            body('xp').escape().isNumeric().optional(),
            body('requiredXp').escape().isNumeric().optional()
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

                        // create badge
                        let responseObject = {}

                        if (userId) {
                            User.findById(userId)
                                .exec((err, user) => {
                                    if (err) return res.status(409).json({ message: 'Conflict: cannot create user badge' })

                                    if (user.stats.skills.created === 2) {
                                        Badge.createBadge('Skillful', userId)
                                        responseObject.badge = { name: 'Skillful', state: 'created' }
                                    }
                                    else if ([4, 6, 8].includes(user.stats.skills.created)) {
                                        Badge.levelUpBadge('Skillful', `Create ${user.stats.skills.created} skills`, userId)
                                        responseObject.badge = { name: 'Skillful', state: 'updated' }
                                    }
                                })
                        }

                        responseObject = { ...responseObject, id: skill._id }

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

        // an object to store the data sent when everything works as expected
        // it is used to send additional data when a badge is created
        // for the purpose to display a notification on the front-end
        let responseObject = {}

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

                    // create badge
                    if (userId) {
                        User.findById(userId)
                            .exec((err, user) => {
                                if (err) return res.status(409).json({ message: 'Conflict: cannot create user badge' })

                                // breakpoints indicating the range of xp needed for each badge tier
                                let breakpoints = [50, 100, 200, 500]

                                let badge = user.badges.find(b => b.name === 'Cultivated')

                                if (badge == undefined
                                    && user.stats.skills.earnedXp >= breakpoints[0]
                                    && user.stats.skills.earnedXp < breakpoints[1]) {
                                    Badge.createBadge('Cultivated', userId)
                                    responseObject.badge = { name: 'Cultivated', state: 'created' }
                                }
                                else if (badge
                                    && badge.tier === 'Common'
                                    && user.stats.skills.earnedXp >= breakpoints[1]
                                    && user.stats.skills.earnedXp < breakpoints[2]) {
                                    Badge.levelUpBadge('Cultivated', `Earn ${breakpoints[1]} skill xp`, userId)
                                    responseObject.badge = { name: 'Cultivated', state: 'updated' }
                                }
                                else if (badge
                                    && badge.tier === 'Rare'
                                    && user.stats.skills.earnedXp >= breakpoints[2]
                                    && user.stats.skills.earnedXp < breakpoints[3]) {
                                    Badge.levelUpBadge('Cultivated', `Earn ${breakpoints[2]} skill xp`, userId)
                                    responseObject.badge = { name: 'Cultivated', state: 'updated' }
                                }
                                else if (badge
                                    && badge.tier === 'Honored'
                                    && user.stats.skills.earnedXp >= breakpoints[3]) {
                                    Badge.levelUpBadge('Cultivated', `Earn ${breakpoints[3]} skill xp`, userId)
                                    responseObject.badge = { name: 'Cultivated', state: 'updated' }
                                }
                            })
                    }
                }
                // if leveling up, update the level, and add to that new level the difference of the xp
                else {
                    update = {
                        level: skill.level + 1,
                        requiredXp: skill.requiredXp + process.env.SKILL_LEVELUP_MULTIPLIER * (skill.level + 1),
                        xp: 0 + (skill.xp + req.body.value) - skill.requiredXp
                    }

                    // if request xp value is too high, then penalise to user to just leveling up with a start of 0 xp
                    if (update.xp > update.requiredXp) update.xp = 0

                    updateUser = {
                        $inc: {
                            'stats.skills.earnedXp': req.body.value,
                            'stats.skills.completedLevels': 1
                        }
                    }

                    // create badge
                    if (userId) {
                        User.findById(userId)
                            .exec((err, user) => {
                                if (err) return res.status(409).json({ message: 'Conflict: cannot create user badge' })

                                if (user.stats.skills.completedLevels === 2) {
                                    Badge.createBadge('Practitioner', userId)
                                    responseObject.badge = { name: 'Practitioner', state: 'created' }
                                }
                                else if ([4, 9, 14].includes(user.stats.skills.completedLevels)) {
                                    Badge.levelUpBadge('Practitioner', `Complete ${user.stats.skills.completedLevels + 1} skill levels`, userId)
                                    responseObject.badge = { name: 'Practitioner', state: 'updated' }
                                }
                            })
                    }
                }
            }
            else if (req.query.updateLevel === 'true' && !req.query.updateXp) {
                update = {
                    level: skill.level + 1,
                    requiredXp: skill.requiredXp + process.env.SKILL_LEVELUP_MULTIPLIER * (skill.level + 1)
                }

                updateUser = { $inc: { 'stats.skills.completedLevels': 1 } }

                // create badge
                if (userId) {
                    User.findById(userId)
                        .exec((err, user) => {
                            if (err) return res.status(409).json({ message: 'Conflict: cannot create user badge' })

                            if (user.stats.skills.completedLevels === 2) {
                                Badge.createBadge('Practitioner', userId)
                                responseObject.badge = { name: 'Practitioner', state: 'created' }
                            }
                            else if ([4, 9, 14].includes(user.stats.skills.completedLevels)) {
                                Badge.levelUpBadge('Practitioner', `Complete ${user.stats.skills.completedLevels + 1} skill levels`, userId)
                                responseObject.badge = { name: 'Practitioner', state: 'updated' }
                            }
                        })
                }
            }

            Skills.findOneAndUpdate({ _id: req.params.id }, update, { new: true }, (err, updatedSkill) => {
                if (err) return res.status(409).json({ message: 'Conflict: cannot update skill' })

                User.findByIdAndUpdate(userId, updateUser, err => {
                    if (err) return res.status(409).json({ message: 'Conflict: cannot update user' })

                    responseObject = { ...responseObject, updatedSkill }

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

module.exports = Skill