// Runs on every page request, right after the session middleware

// Lets every view know who is logged in (null for visitors)
const addCurrentUser = (req, res, next) => {
    res.locals.currentUser = req.session.user ?? null;
    next();
};

// Flash messages: saved in the session, shown once on the next page, then deleted.
//   Controller:  req.flash('success', 'Account created!');  then res.redirect(...)
//   View:        the header shows every message in the flash array
const flash = (req, res, next) => {
    req.flash = (type, message) => {
        req.session.flash ??= [];
        req.session.flash.push({ type, message });
    };

    // Messages saved by the previous request go to this page, then leave the session
    res.locals.flash = req.session.flash ?? [];
    delete req.session.flash;
    next();
};

export { addCurrentUser, flash };