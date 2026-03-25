exports.getLogin = (req, res, next) => {
    const cookieHeader = req.get('Cookie') || '';
    const loggedInCookie = cookieHeader
        .split(';')
        .find(c => c.trim().startsWith('loggedIn='));
    const isLoggedIn = loggedInCookie?.split('=')[1] === 'true';

    res.render('auth/login', { 
        pageTitle: 'Login', 
        path: '/login', 
        isAuthenticated: isLoggedIn 
    });
};

exports.postLogin = (req, res, next) => {
    res.setHeader('Set-Cookie', 'loggedIn=true')
    res.redirect('/');

};