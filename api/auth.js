const express = require('express')
const router = express.Router()

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('./models/user.js')

require('dotenv').config()

router.post('/signup', async (req, res) => {
    if (!req.body) return res.status(204).json({ message: 'Empty request body' })

    const { username, password } = req.body

    if (!username || !password) return res.status(204).json({ message: 'Missing username or password' })

    // check if the user exists in the db
    const foundUser = await User.findOne({ username })

    if (foundUser) return res.status(403).json({ message: 'A user with this username already exists' })

    // create the user
    const user = await User.create({ username, password })

    // create jwts
    // const token_expiry = 10
    const { refreshToken, refreshTokenCookieString } = createRefreshToken('7d', '604800', user._id, user.username, res)
    const { accessTokenCookieString } = createAcessToken('10m', '600', user._id, user.username, res)
    const cookies = [refreshTokenCookieString, accessTokenCookieString]

    await User.updateOne({ _id: user._id }, { refresh: refreshToken })

    res.set('Set-Cookie', cookies)
    res.status(201).json({ userId: user._id, username: user.username })
    // res.set('Authorization', `Bearer ${token}`)
    // res.status(201).json({ token, token_expiry }) // expiry in minutes
})

router.post('/login', async (req, res) => {
    if (!req.body) return res.status(204).json({ message: 'Empty request body' })

    const { username, password } = req.body

    if (!username || !password) return res.status(204).json({ message: 'Missing username or password' })

    const user = await User.findOne({ username })

    if (!user) return res.status(403).json({ message: 'Incorrect username' })

    bcrypt.compare(password, user.password, async (err, same) => {
        if (err) return res.status(500).json({ mesage: 'An error occured. Try again' })
        if (!same) return res.status(401).json({ message: 'Incorrect password' })

        // const token_expiry = 10
        const { refreshToken, refreshTokenCookieString } = createRefreshToken('7d', '604800', user._id, user.username, res)
        const { accessTokenCookieString } = createAcessToken('10m', '600', user._id, user.username, res)
        const cookies = [ refreshTokenCookieString, accessTokenCookieString ]

        await User.updateOne({ username }, { refresh: refreshToken })

        res.set('Set-Cookie', cookies)
        res.status(201).json({ userId: user._id, username: user.username })
        // res.set('Authorization', `Bearer ${ token }`)
        // res.json({ token, token_expiry })
    })
})

// issue a new access token
// Note: if refresh token is missing or invalid, the client must perform a /login POST request
// router.post('/auth/refresh', async (req, res) => {
//     const { refreshToken } = req.cookies

//     if (!refreshToken) return res.status(403).json({ message: 'Forbidden: refresh token is missing' })

//     // const userId = rt.sub
//     // const { refresh } = await User.findById(userId)

//     // if (refreshToken !== refresh) return res.status(403).json({ message: 'Forbidden: refresh tokens from client and database don\'t match' })

//     // verify the refresh token
//     jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
//         if (err) return res.status(403).json({ message: 'Forbidden: refresh token is invalid' })

//         const userId = jwt.decode(refreshToken).sub
//         const { refresh } = await User.findById(userId)

//         if (refreshToken !== refresh) return res.status(403).json({ message: 'Forbidden: refresh tokens from client and database don\'t match' })

//         // if refresh token is valid, issue a new access token
//         const token_expiry = 10
//         const token = createAcessToken('10m', decoded.sub, decoded.name)
//         const rt = createRefreshToken('7d', '604800', decoded.sub, decoded.name, res)

//         await User.updateOne({ _id: decoded.sub }, { refresh: rt })

//         res.set('Authorization', `Bearer ${token}`)
//         res.json({ token, token_expiry })
//     })
// })

router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.cookies

    if (!refreshToken) return res.status(401).json({ message: 'Unauthorized: missing refresh token' })

    const userId = await jwt.decode(refreshToken).sub
    const user = await User.findById(userId)

    if (refreshToken !== user.refresh) return res.status(403).json({ message: 'Forbidden: refresh tokens don\'t match' })

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Unauthroized: invalid refresh token' })

        const { refreshToken, refreshTokenCookieString } = createRefreshToken('7d', '604800', user._id, user.username, res)
        const { accessTokenCookieString } = createAcessToken('10m', '600', user._id, user.username, res)
        const cookies = [refreshTokenCookieString, accessTokenCookieString]

        await User.updateOne({ _id: userId }, { refresh: refreshToken })

        res.set('Set-Cookie', cookies)
        res.status(201).json({ userId: user._id, username: user.username })
    })
})

// route to check if the refresh token is valid
// and if so send user data to update the App component state on client
// router.get('/auth/checkRefresh', async (req, res) => {
//     const { refreshToken } = req.cookies

//     if (!refreshToken) return res.status(401).json({ message: 'Unauthorized: missing refresh token' })

//     const userId = await jwt.decode(refreshToken).sub
//     const user = await User.findById(userId)

//     if (refreshToken !== user.refresh) return res.status(403).json({ message: 'Forbidden: refresh tokens don\'t match' })

//     jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async err => {
//         if (err) return res.status(401).json({ message: 'Unauthroized: invalid refresh token' })

//         res.status(201).json({ userId: user._id, username: user.username })
//     })
// })

// this expires only the cookie on the client side, not the jwt
// if jwt is required to be removed, perhaps tamper it
router.get('/logout', (req, res) => {
    const cookies = [
        'accessToken=; Max-Age: 0; Path=/',
        'refreshToken=; HttpOnly; Max-Age: 0; Path=/'
    ]
    res.set('Set-Cookie', cookies)
    res.json({ message: 'Logged out' })
})

// expiresIn is a string of the type '10m'
const createAcessToken = (expiresIn, cookieExpiry, id, username, res) => {
    const accessToken = jwt.sign({ sub: id, name: username }, process.env.JWT_SECRET, { expiresIn })
    // set SECURE and SameSite!
    const accessTokenCookieString = `accessToken=${accessToken}; Max-Age=${cookieExpiry}; Path=/`
    return { accessToken, accessTokenCookieString }
}

const createRefreshToken = (expiresIn, cookieExpiry, id, username, res) => {
    const refreshToken = jwt.sign({ sub: id, name: username }, process.env.JWT_REFRESH_SECRET, { expiresIn })
    // set SECURE cookie below and add SameSite policy, probably to Lax!!!
    const refreshTokenCookieString = `refreshToken=${refreshToken}; HttpOnly; Max-Age=${cookieExpiry}; Path=/`
    return { refreshToken, refreshTokenCookieString }
}

const authroizeRequest = (req, res, next) => {
    const { accessToken } = req.cookies

    if (!accessToken) return res.status(401).json({ message: 'Unauthorized: missing access token' })

    jwt.verify(accessToken, process.env.JWT_SECRET, err => {
        if (err) return res.status(401).json({ message: 'Unauthorized: invalid access token' })

        return next()
    })
}

module.exports.router = router
module.exports.authroizeRequest = authroizeRequest