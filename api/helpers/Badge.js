const User = require('../models/user.js')
const badgeList = require('../badges.js')

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
                    'stats.distinctBadges': 1,
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

        User.findById(userId, async (err, user) => {
            if (err) return false

            const badgeIdx = user.badges.findIndex(b => b.name === name)

            const update = {
                '$inc': {
                    'stats.earnedBadges': 1,
                    'stats.pointsFromBadges': 1,
                    'stats.points': this.tiers[tierId].value
                },
                '$set': {}
            }

            update['$set'][`badges.${badgeIdx}.tier`] = badge.tier
            if (description) update['$set'][`badges.${badgeIdx}.description`] = description

            User.updateOne({ _id: userId, 'badges.name': name }, update, err => err ? false : true)
        })
    }

    static readAll(req, res, next) {
        let badges = Array.from(badgeList)

        badges.forEach(badge => {
            delete badge.cdn
            delete badge.quote
            delete badge.quoteAuthor
        })
        
        res.json(badges)
    }
}

module.exports = Badge