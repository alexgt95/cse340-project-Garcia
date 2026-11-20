import { getAllServices, getCategories } from '../models/services.js';

// GET /services  and  /services?category=Color
const showServices = async (req, res) => {
    const categories = await getCategories();

    // The query string is user input: only accept a category that really exists
    const selectedCategory = categories.includes(req.query.category) ? req.query.category : '';

    const services = await getAllServices(selectedCategory);
    res.render('services', { title: 'Services', services, categories, selectedCategory });
};

export { showServices };
