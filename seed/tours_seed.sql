-- ============================================================
-- TOURS SERVICE SEED
-- Postgres — tours, tour_tags, tour_reviews, tour_review_images
-- authorId strictly from author profiles: user IDs 4, 5, 6
-- status always DRAFT, price always 0
-- tourists (user IDs 1, 2, 3) write reviews
-- no key_points inserted
-- ============================================================

-- -----------------------------------------------
-- TOURS
-- user4 → 2 tours | user5 → 2 tours | user6 → 3 tours
-- -----------------------------------------------
INSERT INTO tours (author_id, author_username, name, description, difficulty, status, price) VALUES
-- user4
(4, 'user4',
 'Coastal Cliffs of the Algarve',
 'Explore the dramatic limestone cliffs and golden sea caves of southern Portugal. This tour follows the Rota Vicentina coastal path through some of the most scenic stretches of the Atlantic coast.',
 'EASY', 'DRAFT', 0),

(4, 'user4',
 'Lisbon to Sintra Day Tour',
 'A full-day journey from the heart of Lisbon to the fairy-tale palaces and forested hills of Sintra. Includes a guided walk through the historic centre and a visit to Pena Palace.',
 'EASY', 'DRAFT', 0),

-- user5
(5, 'user5',
 'High Alpine Trek: Mont Blanc Circuit',
 'A challenging multi-day circuit around the Mont Blanc massif crossing through France, Italy and Switzerland. Stunning glaciers, high passes and remote mountain refuges.',
 'HARD', 'DRAFT', 0),

(5, 'user5',
 'Dolomites Valley Hiking Tour',
 'A moderate hiking tour through the Val Gardena and Alpe di Siusi plateau. Suitable for those who want alpine scenery without extreme elevation. Cable cars available for assisted ascents.',
 'MEDIUM', 'DRAFT', 0),

-- user6
(6, 'user6',
 'Tuscany Wine and Villages Tour',
 'A leisurely tour through the Chianti wine region and the medieval hill towns of Tuscany. Includes guided tastings at two local wineries and a sunset walk through Monteriggioni.',
 'EASY', 'DRAFT', 0),

(6, 'user6',
 'Inca Trail Express: Machu Picchu in 4 Days',
 'The classic 4-day Inca Trail trek from the Sacred Valley to Machu Picchu. Your guide will share the history of the Inca civilisation at each archaeological site along the route.',
 'HARD', 'DRAFT', 0),

(6, 'user6',
 'Croatian Island Hopping',
 'A week-long sailing tour along the Dalmatian coast visiting Hvar, Korčula and the Pakleni islands. Swim in hidden coves, dine at waterfront konobas and watch the sun set over the Adriatic.',
 'EASY', 'DRAFT', 0);

-- -----------------------------------------------
-- TOUR TAGS
-- tour IDs assumed: 1–7 in insertion order
-- -----------------------------------------------
INSERT INTO tour_tags (tour_id, tags) VALUES
-- tour 1: Algarve Cliffs
(1, 'coastal'),
(1, 'hiking'),
(1, 'nature'),

-- tour 2: Lisbon to Sintra
(2, 'cultural'),
(2, 'city'),
(2, 'history'),

-- tour 3: Mont Blanc Circuit
(3, 'alpine'),
(3, 'trekking'),
(3, 'multi-day'),

-- tour 4: Dolomites Valley
(4, 'alpine'),
(4, 'hiking'),
(4, 'scenic'),

-- tour 5: Tuscany Wine and Villages
(5, 'food-and-wine'),
(5, 'cultural'),
(5, 'leisurely'),

-- tour 6: Inca Trail
(6, 'trekking'),
(6, 'history'),
(6, 'multi-day'),

-- tour 7: Croatian Island Hopping
(7, 'sailing'),
(7, 'coastal'),
(7, 'island');

-- -----------------------------------------------
-- TOUR REVIEWS
-- Only tourists: user IDs 1, 2, 3
-- tour 1: 2 reviews | tour 2: 0 | tour 3: 3
-- tour 4: 1 review  | tour 5: 2 | tour 6: 0 | tour 7: 1
-- no images
-- -----------------------------------------------
INSERT INTO tour_reviews (tour_id, tourist_id, tourist_username, rating, comment, visited_at, commented_at) VALUES
-- tour 1: Algarve Cliffs
(1, 1, 'admin',
 5,
 'Absolutely breathtaking. The sea caves near Ponta da Piedade were the highlight — the colour of the water is unlike anything I have seen. The pace was perfect for all fitness levels.',
 '2024-05-10', '2024-05-14 10:00:00'),

(1, 2, 'user',
 4,
 'Great tour overall. The guide was knowledgeable and the route well-planned. Knocked one star off only because the midday sun was brutal — bring plenty of water.',
 '2024-06-02', '2024-06-05 16:30:00'),

-- tour 2: Lisbon to Sintra — 0 reviews

-- tour 3: Mont Blanc Circuit
(3, 1, 'admin',
 5,
 'The hardest thing I have ever done and the most rewarding. Crossing the Grand Col Ferret into Italy on day three is a memory I will carry forever.',
 '2024-07-20', '2024-07-25 09:15:00'),

(3, 2, 'user',
 4,
 'Outstanding scenery throughout. The refuges were cosy and the food surprisingly good at altitude. Make sure your boots are properly broken in before you go.',
 '2024-07-22', '2024-07-28 11:00:00'),

(3, 3, 'user3',
 5,
 'Did this tour with two friends who had never hiked before — they are already planning to come back. The support from the guide on the steeper sections made all the difference.',
 '2024-08-05', '2024-08-09 14:45:00'),

-- tour 4: Dolomites Valley
(4, 3, 'user3',
 4,
 'Lovely introduction to alpine hiking. The Alpe di Siusi plateau at golden hour looks like a screensaver — in the best way. Cable car access is a real bonus.',
 '2024-08-15', '2024-08-18 20:00:00'),

-- tour 5: Tuscany Wine and Villages
(5, 1, 'admin',
 5,
 'The winery stop in Greve in Chianti alone was worth the price of the tour. Monteriggioni at sunset with a glass of local Sangiovese — perfection.',
 '2024-09-08', '2024-09-10 18:30:00'),

(5, 2, 'user',
 5,
 'Effortlessly relaxed pace. The guide knew every producer personally and that access made the tastings feel genuinely special rather than touristy.',
 '2024-09-15', '2024-09-17 12:00:00'),

-- tour 6: Inca Trail — 0 reviews

-- tour 7: Croatian Island Hopping
(7, 3, 'user3',
 5,
 'A perfect week. Waking up anchored in a quiet cove off Hvar with no one else around is the kind of thing that makes you question why you ever stay on land.',
 '2024-08-28', '2024-09-01 10:00:00');
