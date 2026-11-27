import { readdir } from 'fs/promises';
import db, { transaction } from './db.js';

// Shared start of every public service query: columns + joins.
// It's our own fixed text (never user data), so building SQL with ${} here is safe.
const SERVICE_SELECT = `
    SELECT s.id, s.name, s.slug, s.description, s.duration_minutes, s.image_url,
           c.name AS category_name, c.slug AS category_slug,
           json_object_agg(p.hair_length, p.price) AS prices
    FROM services s
    JOIN categories c ON c.id = s.category_id
    JOIN service_prices p ON p.service_id = s.id`;

// "Women's Haircut" → "womens-haircut"
const slugify = (text) => text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')   // á → a, ñ → n
    .replace(/'/g, '')                                  // women's → womens
    .replace(/[^a-z0-9]+/g, '-')                        // spaces and symbols → -
    .replace(/^-|-$/g, '');                             // no - at the start or end

// ── Public pages ───────────────────────────────────────────────

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
    const result = await db.query('SELECT id, name, slug FROM categories ORDER BY name');
    return result.rows;
};

// ── Admin: services ────────────────────────────────────────────

// Every service, active or not, for the admin list
const getServicesForAdmin = async () => {
    const sql = `
        SELECT s.id, s.name, s.slug, s.duration_minutes, s.is_active, c.name AS category_name
        FROM services s
        JOIN categories c ON c.id = s.category_id
        ORDER BY c.name, s.name`;
    const result = await db.query(sql);
    return result.rows;
};

// One service by id (active or not) with its prices, or undefined
const getServiceById = async (id) => {
    const sql = `
        SELECT s.id, s.name, s.category_id, s.description, s.duration_minutes, s.image_url, s.is_active,
               json_object_agg(p.hair_length, p.price) AS prices
        FROM services s
        JOIN service_prices p ON p.service_id = s.id
        WHERE s.id = $1
        GROUP BY s.id`;
    const result = await db.query(sql, [id]);
    return result.rows[0];
};

// Photos a service can use: the .jpg files in public/images (each one has a .webp twin)
const listServiceImages = async () => {
    const files = await readdir(new URL('../../public/images', import.meta.url));
    return files.filter((file) => file.endsWith('.jpg')).map((file) => `/images/${file}`);
};

// Saves the three prices of a service: adds the missing ones, updates the rest
const savePrices = (client, serviceId, data) => client.query(`
    INSERT INTO service_prices (service_id, hair_length, price)
    VALUES ($1, 'short', $2), ($1, 'mid', $3), ($1, 'long', $4)
    ON CONFLICT (service_id, hair_length) DO UPDATE SET price = EXCLUDED.price`,
    [serviceId, data.price_short, data.price_mid, data.price_long]);

// New service + its prices, all or nothing
const createService = (data) => transaction(async (client) => {
    const result = await client.query(`
        INSERT INTO services (category_id, name, slug, description, duration_minutes, image_url, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id`,
        [data.category_id, data.name, slugify(data.name), data.description,
         data.duration_minutes, data.image_url, data.is_active]);
    await savePrices(client, result.rows[0].id, data);
});

// Changes a service and its prices, all or nothing
const updateService = (id, data) => transaction(async (client) => {
    await client.query(`
        UPDATE services
        SET category_id = $2, name = $3, slug = $4, description = $5,
            duration_minutes = $6, image_url = $7, is_active = $8, updated_at = NOW()
        WHERE id = $1`,
        [id, data.category_id, data.name, slugify(data.name), data.description,
         data.duration_minutes, data.image_url, data.is_active]);
    await savePrices(client, id, data);
});

// Deletes a service; its prices go with it (ON DELETE CASCADE)
const deleteService = (id) => db.query('DELETE FROM services WHERE id = $1', [id]);

// ── Admin: categories ──────────────────────────────────────────

// Every category with how many services use it (LEFT JOIN keeps categories with 0)
const getCategoriesForAdmin = async () => {
    const sql = `
        SELECT c.id, c.name, c.slug, COUNT(s.id)::int AS service_count
        FROM categories c
        LEFT JOIN services s ON s.category_id = c.id
        GROUP BY c.id
        ORDER BY c.name`;
    const result = await db.query(sql);
    return result.rows;
};

const createCategory = (name) =>
    db.query('INSERT INTO categories (name, slug) VALUES ($1, $2)', [name, slugify(name)]);

const updateCategory = (id, name) =>
    db.query('UPDATE categories SET name = $2, slug = $3 WHERE id = $1', [id, name, slugify(name)]);

// Fails with error 23001 while services still use it (ON DELETE RESTRICT)
const deleteCategory = (id) => db.query('DELETE FROM categories WHERE id = $1', [id]);

export {
    getAllServices, getServiceBySlug, getCategories,
    getServicesForAdmin, getServiceById, listServiceImages,
    createService, updateService, deleteService,
    getCategoriesForAdmin, createCategory, updateCategory, deleteCategory
};