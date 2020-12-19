function logout(history, authContext) {
    fetch('/auth/logout')
    .then(res => {
        if (res.ok) {
            document.cookie = 'accessToken=; max-age=0; path=/;'
            localStorage.removeItem('userId')
            localStorage.removeItem('username')
            authContext.changeUser(null, null)
            history.push('/')
        }
        else console.error('An error occured while logging out')
    })
    .catch(err => console.error(`An error occured while logging out: ${err}`))
}

async function refresh(changeUser) {
    return fetch('/auth/refresh', { method: 'POST' })
    .then(res => {
        if (res.ok) {
            res.json().then(res => {
                localStorage.setItem('userId', res.userId)
                localStorage.setItem('username', res.username)
                changeUser(res.userId, res.username)
            })
        }
        else {
            localStorage.removeItem('userId')
            localStorage.removeItem('username')
            changeUser(null, null)
        }
    })
    .catch(err => console.error(`An error occured on silent refresh: ${err}`))
}

async function authFetch(url, options, history, changeUser, cb) {
    function cookieExists(name) { return document.cookie.includes(name) }

    if (!cookieExists('accessToken')) await refresh(changeUser)

    return fetch(url, options)
    .then(res => {
        if (res.ok) cb(res)
        else if (res.status == 401 || res.status == 403) history.push('/login')
        else console.error(`Cannot fetch at ${url}`)
    })
    .catch(err => console.error(err))
}

export { authFetch }
export { logout }
export { refresh }