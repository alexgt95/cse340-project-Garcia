import { validationResult, matchedData } from 'express-validator';
import { getAllUsers } from '../models/users.js';
import {
    getCategories, getServicesForAdmin, getServiceById, listServiceImages,
    createService, updateService, deleteService,
    getCategoriesForAdmin, createCategory, updateCategory, deleteCategory
} from '../models/services.js';

// PostgreSQL error codes we expect and turn into friendly messages
const UNIQUE_VIOLATION = '23505';     // the name (its slug) is already used
const RESTRICT_VIOLATION = '23001';   // ON DELETE RESTRICT: other rows still use this one

// Every route in this file sits behind requireRole('admin') (see routes.js)

// GET /admin
const showDashboard = async (req, res) => {
    const users = await getAllUsers();
    res.render('admin/dashboard', { title: 'Admin Dashboard', users });
};

// ── Services ───────────────────────────────────────────────────

// GET /admin/services
const showAdminServices = async (req, res) => {
    const services = await getServicesForAdmin();
    res.render('admin/services', { title: 'Manage Services', services });
};

// The same form creates and edits; only the title and the address it posts to change
const renderServiceForm = async (res, { status = 200, title, action, values, errors = {} }) => {
    const categories = await getCategories();
    const images = await listServiceImages();
    res.status(status).render('admin/service-form', { title, action, values, errors, categories, images });
};

// GET /admin/services/new
const showNewService = (req, res) =>
    renderServiceForm(res, { title: 'Add a Service', action: '/admin/services', values: { is_active: true } });

// POST /admin/services
const processNewService = async (req, res) => {
    const form = { title: 'Add a Service', action: '/admin/services', values: req.body };

    const result = validationResult(req);
    if (!result.isEmpty()) {
        return renderServiceForm(res, { ...form, status: 400, errors: result.mapped() });
    }

    try {
        await createService(matchedData(req));
    } catch (err) {
        if (err.code !== UNIQUE_VIOLATION) throw err;
        return renderServiceForm(res, { ...form, status: 400, errors: { name: { msg: 'Another service already has this name.' } } });
    }

    req.flash('success', `"${req.body.name}" was added.`);
    res.redirect('/admin/services');
};

// GET /admin/services/:id/edit
const showEditService = async (req, res, next) => {
    const service = await getServiceById(req.params.id);
    if (!service) return next();   // no route left → 404 page

    // The form fields are named like the columns; only the prices need unpacking
    const values = {
        ...service,
        price_short: service.prices.short,
        price_mid: service.prices.mid,
        price_long: service.prices.long
    };
    renderServiceForm(res, { title: `Edit ${service.name}`, action: `/admin/services/${service.id}`, values });
};

// POST /admin/services/:id
const processEditService = async (req, res, next) => {
    const service = await getServiceById(req.params.id);
    if (!service) return next();

    const form = { title: `Edit ${service.name}`, action: `/admin/services/${service.id}`, values: req.body };

    const result = validationResult(req);
    if (!result.isEmpty()) {
        return renderServiceForm(res, { ...form, status: 400, errors: result.mapped() });
    }

    try {
        await updateService(service.id, matchedData(req));
    } catch (err) {
        if (err.code !== UNIQUE_VIOLATION) throw err;
        return renderServiceForm(res, { ...form, status: 400, errors: { name: { msg: 'Another service already has this name.' } } });
    }

    req.flash('success', `"${req.body.name}" was updated.`);
    res.redirect('/admin/services');
};

// POST /admin/services/:id/delete
const processDeleteService = async (req, res) => {
    await deleteService(req.params.id);
    req.flash('success', 'The service was deleted.');
    res.redirect('/admin/services');
};

// ── Categories ─────────────────────────────────────────────────
// Several small forms share one page, so errors travel as flash messages

// GET /admin/categories
const showAdminCategories = async (req, res) => {
    const categories = await getCategoriesForAdmin();
    res.render('admin/categories', { title: 'Manage Categories', categories });
};

// Runs a create/rename after checking the rules; shared by both routes below
const saveCategory = async (req, res, save, doneMessage) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        req.flash('error', result.array()[0].msg);
        return res.redirect('/admin/categories');
    }

    try {
        await save(matchedData(req).name);
        req.flash('success', doneMessage);
    } catch (err) {
        if (err.code !== UNIQUE_VIOLATION) throw err;
        req.flash('error', 'A category with that name already exists.');
    }
    res.redirect('/admin/categories');
};

// POST /admin/categories
const processNewCategory = (req, res) =>
    saveCategory(req, res, createCategory, 'Category added.');

// POST /admin/categories/:id
const processEditCategory = (req, res) =>
    saveCategory(req, res, (name) => updateCategory(req.params.id, name), 'Category renamed.');

// POST /admin/categories/:id/delete
const processDeleteCategory = async (req, res) => {
    try {
        await deleteCategory(req.params.id);
        req.flash('success', 'Category deleted.');
    } catch (err) {
        if (err.code !== RESTRICT_VIOLATION) throw err;
        req.flash('error', 'That category still has services. Move them to another category first.');
    }
    res.redirect('/admin/categories');
};

export {
    showDashboard,
    showAdminServices, showNewService, processNewService,
    showEditService, processEditService, processDeleteService,
    showAdminCategories, processNewCategory, processEditCategory, processDeleteCategory
};