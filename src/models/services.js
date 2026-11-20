import { readFile } from 'fs/promises';

// TEMPORARY data source: Phase 6 replaces this JSON file with PostgreSQL queries
const DATA_FILE = new URL('../../public/data/services.json', import.meta.url);

const readServices = async () => JSON.parse(await readFile(DATA_FILE, 'utf8'));

// All services, or only those in one category
const getAllServices = async (category) => {
    const services = await readServices();
    return category ? services.filter((s) => s.category.includes(category)) : services;
};

// Unique category names, sorted A-Z
const getCategories = async () => {
    const services = await readServices();
    return [...new Set(services.flatMap((s) => s.category))].sort();
};

export { getAllServices, getCategories };
