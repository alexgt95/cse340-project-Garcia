import db from './db.js';

// Shared start of every service query: columns + joins.
// It's our own fixed text (never user data), so building SQL with ${} here is safe.
const SERVICE_SELECT = `
    SELECT s.id, s.name, s.slug, s.description, s.duration_minutes, s.image_url,
           c.name AS category_name, c.slug AS category_slug,
           json_object_agg(p.hair_length, p.price) AS prices
    FROM services s
    JOIN categories c ON c.id = s.category_id
    JOIN service_prices p ON p.service_id = s.id`;

// Active services, optionally only one category
const getAllServices = async (categorySlug) => {
    const sql = `${SERVICE_SELECT}
        WHERE s.is_active
          AND ($1::text IS NULL OR c.slug = $1)
        GROUP BY s.id, c.id
        ORDER BY c.name, s.name`;
    const result = await db.query(sql, [categorySlug ?? null]);
    return result.rows;
};

// One active service by its slug, or undefined if it doesn't exist
const getServiceBySlug = async (slug) => {
    const sql = `${SERVICE_SELECT}
        WHERE s.is_active
          AND s.slug = $1
        GROUP BY s.id, c.id`;
    const result = await db.query(sql, [slug]);
    return result.rows[0];
};

// Every category, A-Z
const getCategories = async () => {
    const result = await db.query('SELECT name, slug FROM categories ORDER BY name');
    return result.rows;
};

export { getAllServices, getServiceBySlug, getCategories };