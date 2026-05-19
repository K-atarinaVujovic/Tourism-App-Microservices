-- ============================================================
-- BLOG SERVICE SEED
-- Postgres — blogs, blog_images, comments, likes
-- authorId = Auth user ID (1–6), any user can blog
-- 6 blogs spread across users
-- 0–2 images per blog
-- 0–3 comments per blog
-- 0–3 likes per blog (unique blogId+userId constraint respected)
-- ============================================================

-- -----------------------------------------------
-- BLOGS
-- -----------------------------------------------
INSERT INTO blogs (author_id, title, description, created_at) VALUES
                                                                  (1, 'Discovering the Streets of Lisbon', 'Lisbon is one of Europes most underrated capitals. Wander through Alfama narrow alleys, visit the Belem Tower at sunrise, and ride tram 28 through the historic hills.', '2024-03-10 09:15:00'),
                                                                  (2, 'A Weekend in the Dolomites', 'The Dolomites offer some of the most dramatic mountain scenery in Europe. Hike around Tre Cime di Lavaredo and explore the Ladin culture of Val Gardena.', '2024-04-22 14:30:00'),
                                                                  (3, 'Tokyo on a Budget: Street Food Guide', 'Tokyo street food is cheap and delicious. Grab ningyo-yaki near Senso-ji, stock up at convenience stores, and eat standing at a ramen counter for the full experience.', '2024-05-05 11:00:00'),
                                                                  (4, 'Sailing the Croatian Coast', 'Croatias Dalmatian coast has over a thousand islands to explore. Visit the lavender fields of Hvar and walk the medieval walls of Dubrovnik in May or October.', '2024-06-18 08:45:00'),
                                                                  (5, 'Trekking the Inca Trail to Machu Picchu', 'The Inca Trail is one of the worlds great hikes. Push through Dead Womans Pass at 4215 metres and arrive at Machu Picchu through the Sun Gate at dawn.', '2024-07-30 07:00:00'),
                                                                  (6, 'Hidden Villages of Tuscany', 'Beyond Florence lies a Tuscany most tourists never see. Walk the walls of Monteriggioni and stroll the free Renaissance gardens of San Quirico dOrcia.', '2024-09-12 16:20:00');

-- -----------------------------------------------
-- BLOG IMAGES
-- blog 1: 1 image | blog 2: 2 images | blog 3: 0
-- blog 4: 1 image | blog 5: 2 images | blog 6: 0
-- -----------------------------------------------
INSERT INTO blog_images (blog_id, image_url) VALUES
                                                 (1, 'https://www.wallpaperbetter.com/wallpaper/288/55/811/city-skyline-buildings-skyscrapers-cityscape-2K-wallpaper.jpg'),

                                                 (2, 'https://www.ncl.com/sites/default/files/AMB_44_1920X1080%20XL_0.jpg'),
                                                 (2, 'https://get.pxhere.com/photo/property-estate-human-settlement-house-residential-area-village-lawn-rural-area-real-estate-farm-home-garden-plantation-resort-cottage-yard-1368693.jpg'),

                                                 (4, 'https://www.ncl.com/sites/default/files/AMB_44_1920X1080%20XL_0.jpg'),

                                                 (5, 'https://www.wallpaperbetter.com/wallpaper/288/55/811/city-skyline-buildings-skyscrapers-cityscape-2K-wallpaper.jpg'),
                                                 (5, 'https://get.pxhere.com/photo/property-estate-human-settlement-house-residential-area-village-lawn-rural-area-real-estate-farm-home-garden-plantation-resort-cottage-yard-1368693.jpg');

-- -----------------------------------------------
-- COMMENTS
-- blog 1: 2 comments | blog 2: 1 | blog 3: 3
-- blog 4: 0          | blog 5: 2 | blog 6: 1
-- -----------------------------------------------
INSERT INTO comments (blog_id, author_id, author_username, text, created_at, updated_at) VALUES
-- blog 1
(1, 3, 'user3', 'Lisbon has been on my bucket list for years. The tram tip is gold!', '2024-03-11 10:00:00', '2024-03-11 10:00:00'),
(1, 5, 'user5', 'Beautiful write-up. Alfama at dusk is something else entirely.', '2024-03-12 14:22:00', '2024-03-12 14:22:00'),

-- blog 2
(2, 1, 'admin', 'Hiked Tre Cime last summer — every word of this is accurate.', '2024-04-23 09:10:00', '2024-04-23 09:10:00'),

-- blog 3
(3, 2, 'user',  'The convenience store tip is underrated advice for any Tokyo trip.', '2024-05-06 12:00:00', '2024-05-06 12:00:00'),
(3, 4, 'user4', 'Asakusa stalls are a must. Did you try the melon bread nearby?', '2024-05-07 08:30:00', '2024-05-07 08:30:00'),
(3, 6, 'user6', 'Standing ramen counters changed my life. Cannot recommend enough.', '2024-05-08 19:45:00', '2024-05-08 19:45:00'),

-- blog 5
(5, 1, 'admin', 'Dead Womans Pass nearly broke me. Worth every step.', '2024-07-31 11:00:00', '2024-07-31 11:00:00'),
(5, 2, 'user',  'Booked my permits for next April after reading this. Cant wait!', '2024-08-01 15:30:00', '2024-08-01 15:30:00'),

-- blog 6
(6, 3, 'user3', 'Monteriggioni looks like it came straight out of a painting.', '2024-09-13 10:05:00', '2024-09-13 10:05:00');

-- -----------------------------------------------
-- LIKES
-- blog 1: 3 likes | blog 2: 2 | blog 3: 1
-- blog 4: 2 likes | blog 5: 3 | blog 6: 0
-- -----------------------------------------------
INSERT INTO likes (blog_id, user_id) VALUES
-- blog 1 (3 likes)
(1, 2),
(1, 3),
(1, 5),

-- blog 2 (2 likes)
(2, 1),
(2, 4),

-- blog 3 (1 like)
(3, 6),

-- blog 4 (2 likes)
(4, 2),
(4, 3),

-- blog 5 (3 likes)
(5, 1),
(5, 3),
(5, 6);

-- blog 6 has 0 likes — no rows inserted