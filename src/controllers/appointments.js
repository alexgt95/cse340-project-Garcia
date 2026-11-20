// GET /book: the booking form (booking.js still saves to localStorage until the appointments phase)
const showBooking = (req, res) => {
    res.render('book', { title: 'Book an Appointment' });
};

export { showBooking };
