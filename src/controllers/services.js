import { getAllServices, getServiceBySlug, getCategories } from '../models/services.js';

// GET /services  and  /services?category=color
const showServices = async (req, res) => {
    const categories = await getCategories();

    // The query string is user input: only accept a category that really exists
    const selected = categories.find((category) => category.slug === req.query.category);

    const services = await getAllServices(selected?.slug);
    res.render('services', {
        title: 'Services',
        services,
        categories,
        selectedCategory: selected?.slug ?? ''
    });
};

// GET /services/:slug  (e.g. /services/balayage)
const showServiceDetail = async (req, res, next) => {
    const service = await getServiceBySlug(req.params.slug);

    // No service with that slug: hand a 404 to the global error handler
    if (!service) {
        const err = new Error('Service Not Found');
        err.status = 404;
        return next(err);
    }

    res.render('service-detail', { title: service.name, service });
};

export { showServices, showServiceDetail };