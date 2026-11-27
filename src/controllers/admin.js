import { getAllUsers } from '../models/users.js';

// GET /admin   (only admins get here: requireRole('admin') runs first)
const showDashboard = async (req, res) => {
    const users = await getAllUsers();
    res.render('admin/dashboard', { title: 'Admin Dashboard', users });
};

export { showDashboard };