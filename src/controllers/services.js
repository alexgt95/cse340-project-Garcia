import { getAllServices, getCategories } from '../models/services.js';

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

export { showServices };