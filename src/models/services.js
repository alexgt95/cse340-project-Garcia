import db from './db.js';

// Active services with their category and a { short, mid, long } price object.
// categorySlug is optional: without it, every category is included.
const getAllServices = async (categorySlug) => {
    const sql = `
        SELECT s.id, s.name, s.slug, s.description, s.duration_minutes, s.image_url,
               c.name AS category_name, c.slug AS category_slug,
               json_object_agg(p.hair_length, p.price) AS prices
        FROM services s
        JOIN categories c ON c.id = s.category_id
        JOIN service_prices p ON p.service_id = s.id
        WHERE s.is_active
          AND ($1::text IS NULL OR c.slug = $1)
        GROUP BY s.id, c.id
        ORDER BY c.name, s.name`;
    const result = await db.query(sql, [categorySlug ?? null]);
    return result.rows;
};

// Every category, A-Z
const getCategories = async () => {
    const result = await db.query('SELECT name, slug FROM categories ORDER BY name');
    return result.rows;
};

export { getAllServices, getCategories };