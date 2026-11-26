-- Sample data for an empty database. setup.js runs this file only once.
-- BEGIN/COMMIT: either every row is inserted or none is.
BEGIN;

INSERT INTO categories (name, slug) VALUES
    ('Haircut',    'cut'),
    ('Curly Hair', 'curly'),
    ('Coloring',   'color'),
    ('Treatments', 'treatment');

-- category_id is looked up by the category's slug, so no ids are hard-coded
INSERT INTO services (category_id, name, slug, description, duration_minutes, image_url)
SELECT c.id, v.name, v.slug, v.description, v.duration_minutes, v.image_url
FROM (VALUES
    ('cut',       'Women''s Haircut',   'womens-haircut',    'Women''s haircut tailored to your style.',                          45, '/images/womens-layered-haircut-style.jpg'),
    ('curly',     'Women''s Curly Hair','womens-curly-hair', 'Designed for curly and natural curly hair.',                        120, '/images/womens-natural-curly-hair-styling.jpg'),
    ('cut',       'Men''s Haircut',     'mens-haircut',      'Clean and modern men''s haircut.',                                  30, '/images/mens-modern-professional-haircut.jpg'),
    ('curly',     'Men''s Curly Hair',  'mens-curly-hair',   'Men''s curly haircut tailored to your style and curl type.',        45, '/images/mens-curly-hair-taper-fade.jpg'),
    ('color',     'Hair Colour',        'hair-colour',       'Full hair coloring with professional products.',                    90, '/images/full-hair-coloring-dye-service.jpg'),
    ('color',     'Balayage',           'balayage',          'Natural-looking highlights with the balayage technique.',          120, '/images/blonde-balayage-highlights-service.jpg'),
    ('treatment', 'Keratin Treatment',  'keratin-treatment', 'Smooth and frizz-free hair with professional keratin treatment.',  210, '/images/hair-salon-ashburn-hero-welcome.jpg')
) AS v(category_slug, name, slug, description, duration_minutes, image_url)
JOIN categories c ON c.slug = v.category_slug;

-- service_id is looked up by the service's slug
INSERT INTO service_prices (service_id, hair_length, price)
SELECT s.id, v.hair_length, v.price
FROM (VALUES
    ('womens-haircut',    'short',  45), ('womens-haircut',    'mid',  60), ('womens-haircut',    'long',  75),
    ('womens-curly-hair', 'short',  65), ('womens-curly-hair', 'mid',  95), ('womens-curly-hair', 'long', 125),
    ('mens-haircut',      'short',  25), ('mens-haircut',      'mid',  40), ('mens-haircut',      'long',  55),
    ('mens-curly-hair',   'short',  65), ('mens-curly-hair',   'mid',  85), ('mens-curly-hair',   'long', 105),
    ('hair-colour',       'short',  80), ('hair-colour',       'mid',  95), ('hair-colour',       'long', 110),
    ('balayage',          'short', 150), ('balayage',          'mid', 225), ('balayage',          'long', 350),
    ('keratin-treatment', 'short', 150), ('keratin-treatment', 'mid', 170), ('keratin-treatment', 'long', 190)
) AS v(service_slug, hair_length, price)
JOIN services s ON s.slug = v.service_slug;

COMMIT;