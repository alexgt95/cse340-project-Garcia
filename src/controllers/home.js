const showHome = (req, res) => {
    res.render('home', { title: 'Home' });
};

export { showHome };