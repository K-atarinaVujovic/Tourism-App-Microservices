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
(
  1,
  'Discovering the Streets of Lisbon',
  '<article>
    <intro>Lisbon is one of Europe''s most underrated capitals, draped in golden light and faded grandeur.</intro>
    <section>
      <heading>Alfama District</heading>
      <body>Wander through narrow cobblestone alleys lined with azulejo-tiled facades. The scent of grilled sardines and the distant sound of fado fill the air as you climb toward the castle.</body>
    </section>
    <section>
      <heading>Belém Tower</heading>
      <body>Standing at the mouth of the Tagus river, this UNESCO-listed fortress is a symbol of Portugal''s age of exploration. Visit at sunrise before the crowds arrive.</body>
    </section>
    <tip>Take tram 28 for a scenic ride through the historic hills — hold on tight on the steep descents!</tip>
  </article>',
  '2024-03-10 09:15:00'
),
(
  2,
  'A Weekend in the Dolomites',
  '<article>
    <intro>Few mountain ranges on earth match the dramatic silhouette of the Dolomites in northern Italy.</intro>
    <section>
      <heading>Tre Cime di Lavaredo</heading>
      <body>The three iconic rocky pinnacles are best approached via the Rifugio Auronzo road. The circular hike around them takes about three hours and rewards you with panoramic views at every turn.</body>
    </section>
    <section>
      <heading>Val Gardena</heading>
      <body>This valley is a haven for hikers and skiers alike. The local Ladin culture adds a unique character — look out for traditional carved wooden crafts in the village shops.</body>
    </section>
    <tip>Book mountain huts (rifugi) well in advance during summer months. They fill up fast.</tip>
  </article>',
  '2024-04-22 14:30:00'
),
(
  3,
  'Tokyo on a Budget: Street Food Guide',
  '<article>
    <intro>Tokyo has a reputation for being expensive, but its street food scene tells a different story entirely.</intro>
    <section>
      <heading>Asakusa Market Stalls</heading>
      <body>Nakamise-dori leading to Senso-ji temple is lined with vendors selling ningyo-yaki (small cakes filled with red bean paste) and freshly grilled senbei rice crackers. A filling snack costs under ¥200.</body>
    </section>
    <section>
      <heading>Shibuya and Shinjuku Convenience Stores</heading>
      <body>Don''t overlook 7-Eleven and Lawson. Their onigiri, hot oden, and steamed buns are freshly restocked throughout the day and make for a surprisingly satisfying meal.</body>
    </section>
    <tip>Eat standing at a ramen counter (tachigui) for the most authentic and affordable bowl in the city.</tip>
  </article>',
  '2024-05-05 11:00:00'
),
(
  4,
  'Sailing the Croatian Coast',
  '<article>
    <intro>Croatia''s Dalmatian coast stretches over 1700 kilometres of crystalline Adriatic sea, dotted with over a thousand islands.</intro>
    <section>
      <heading>Hvar Island</heading>
      <body>Hvar town buzzes with life from June to September. Beyond the nightlife, the lavender fields of the island interior and the Pakleni archipelago just offshore are serene escapes worth every minute.</body>
    </section>
    <section>
      <heading>Dubrovnik Old City</heading>
      <body>Walk the medieval city walls for sweeping views over terracotta rooftops and the deep blue sea below. Visit in May or October to avoid peak summer crowds.</body>
    </section>
    <tip>Rent a small motorboat to reach secluded coves that larger vessels can''t access.</tip>
  </article>',
  '2024-06-18 08:45:00'
),
(
  5,
  'Trekking the Inca Trail to Machu Picchu',
  '<article>
    <intro>The classic Inca Trail is one of the world''s most iconic multi-day hikes, culminating at the Sun Gate above Machu Picchu.</intro>
    <section>
      <heading>Day Two: Dead Woman''s Pass</heading>
      <body>At 4215 metres, this is the highest point of the trail. The ascent is relentless but the views of the surrounding Andes are extraordinary. Altitude sickness is real — acclimatise in Cusco for at least two days beforehand.</body>
    </section>
    <section>
      <heading>Machu Picchu at Dawn</heading>
      <body>Arriving through the Inti Punku gate at sunrise is the reward for everything that came before. The citadel emerging from morning mist below is a sight that stays with you forever.</body>
    </section>
    <tip>Permits sell out months in advance. Book your licensed guide and trail permit as early as possible.</tip>
  </article>',
  '2024-07-30 07:00:00'
),
(
  6,
  'Hidden Villages of Tuscany',
  '<article>
    <intro>Beyond Florence and Siena lies a Tuscany that most tourists never see — medieval hill towns, cypress-lined roads, and cellars full of local Chianti.</intro>
    <section>
      <heading>Monteriggioni</heading>
      <body>This perfectly preserved circular medieval village sits on a hilltop south of Siena. Walking the intact ring of walls takes about twenty minutes and offers sweeping views of the surrounding vineyards.</body>
    </section>
    <section>
      <heading>San Quirico d''Orcia</heading>
      <body>Tucked in the Val d''Orcia valley, this quiet town is surrounded by the rolling golden hills you''ve seen on every Tuscany postcard. The Horti Leonini Renaissance gardens are free to enter and rarely crowded.</body>
    </section>
    <tip>Rent a car — public transport barely reaches these villages and having your own wheels transforms the entire experience.</tip>
  </article>',
  '2024-09-12 16:20:00'
);

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
(5, 1, 'admin', 'Dead Woman''s Pass nearly broke me. Worth every step.', '2024-07-31 11:00:00', '2024-07-31 11:00:00'),
(5, 2, 'user',  'Booked my permits for next April after reading this. Can''t wait!', '2024-08-01 15:30:00', '2024-08-01 15:30:00'),

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

