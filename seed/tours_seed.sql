-- ============================================================
-- TOURS SERVICE SEED
-- Postgres — tours, tour_tags, tour_reviews, tour_review_images
-- authorId strictly from author profiles: user IDs 4, 5, 6
-- status always DRAFT, price always 0
-- tourists (user IDs 1, 2, 3) write reviews
-- 2-3 kps per tour
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
 'EASY', 'PUBLISHED', 200),

(4, 'user4',
 'Lisbon to Sintra Day Tour',
 'A full-day journey from the heart of Lisbon to the fairy-tale palaces and forested hills of Sintra. Includes a guided walk through the historic centre and a visit to Pena Palace.',
 'EASY', 'PUBLISHED', 300),

-- user5
(5, 'user5',
 'High Alpine Trek: Mont Blanc Circuit',
 'A challenging multi-day circuit around the Mont Blanc massif crossing through France, Italy and Switzerland. Stunning glaciers, high passes and remote mountain refuges.',
 'HARD', 'PUBLISHED', 50),

(5, 'user5',
 'Dolomites Valley Hiking Tour',
 'A moderate hiking tour through the Val Gardena and Alpe di Siusi plateau. Suitable for those who want alpine scenery without extreme elevation. Cable cars available for assisted ascents.',
 'MEDIUM', 'PUBLISHED', 1000),

-- user6
(6, 'user6',
 'Tuscany Wine and Villages Tour',
 'A leisurely tour through the Chianti wine region and the medieval hill towns of Tuscany. Includes guided tastings at two local wineries and a sunset walk through Monteriggioni.',
 'EASY', 'PUBLISHED', 350),

(6, 'user6',
 'Inca Trail Express: Machu Picchu in 4 Days',
 'The classic 4-day Inca Trail trek from the Sacred Valley to Machu Picchu. Your guide will share the history of the Inca civilisation at each archaeological site along the route.',
 'HARD', 'PUBLISHED', 200),

(6, 'user6',
 'Croatian Island Hopping',
 'A week-long sailing tour along the Dalmatian coast visiting Hvar, Korčula and the Pakleni islands. Swim in hidden coves, dine at waterfront konobas and watch the sun set over the Adriatic.',
 'EASY', 'PUBLISHED', 500);

-- -----------------------------------------------
-- KEY POINTS
-- 2–3 key points per tour, coordinates verified
-- -----------------------------------------------
INSERT INTO key_points (tour_id, name, description, type, image_url, latitude, longitude) VALUES

-- tour 1: Coastal Cliffs of the Algarve
(1, 'Ponta da Piedade', 'Stunning sea-stack rock formations and turquoise grottos at the tip of the Lagos peninsula. The most photographed spot on the Algarve coast.', 'MONUMENT', 'https://example.com/images/ponta_da_piedade.jpg', 37.0731, -8.6695),
(1, 'Praia Dona Ana', 'Sheltered golden-sand beach framed by ochre cliffs. A natural rest point midway along the coastal path.', 'PARK', 'https://example.com/images/praia_dona_ana.jpg', 37.0773, -8.6672),
(1, 'Forte da Ponta da Bandeira', 'A 17th-century sea fort guarding the entrance to Lagos harbour. Small but well-preserved with Atlantic views from the ramparts.', 'MONUMENT', 'https://example.com/images/forte_bandeira.jpg', 37.1015, -8.6742),

-- tour 2: Lisbon to Sintra Day Tour
(2, 'Pena Palace', 'Romanticist palace perched on the hills of Sintra, painted in vivid yellow and red. One of the finest examples of 19th-century Romantic architecture in the world.', 'MONUMENT', 'https://example.com/images/pena_palace.jpg', 38.7877, -9.3906),
(2, 'Moorish Castle', 'Medieval hilltop fortress with panoramic views over Sintra and the Atlantic coastline. Origins date to the 8th–9th century Moorish occupation.', 'MONUMENT', 'https://example.com/images/moorish_castle.jpg', 38.7918, -9.3877),
(2, 'Sintra National Palace', 'Gothic and Manueline royal palace dominating the centre of Sintra village. Famous for its twin conical chimneys visible from miles around.', 'MUSEUM', 'https://example.com/images/sintra_palace.jpg', 38.7978, -9.3906),

-- tour 3: High Alpine Trek: Mont Blanc Circuit
(3, 'Mer de Glace', 'France largest glacier, accessible from Chamonix. An essential stop to understand the scale of the Mont Blanc massif and the visible effects of glacial retreat.', 'PARK', 'https://example.com/images/mer_de_glace.jpg', 45.9031, 6.9217),
(3, 'Grand Col Ferret', 'High mountain pass at 2537 m marking the border between Italy and Switzerland. The most dramatic crossing on the full circuit.', 'MONUMENT', 'https://example.com/images/grand_col_ferret.jpg', 45.9122, 7.0641),
(3, 'Rifugio Bonatti', 'Legendary mountain refuge on the Italian flank of Mont Blanc with direct views of the Grandes Jorasses. A beloved overnight stop on the circuit.', 'RESTAURANT', 'https://example.com/images/rifugio_bonatti.jpg', 45.8960, 7.0433),

-- tour 4: Dolomites Valley Hiking Tour
(4, 'Alpe di Siusi Plateau', 'Europe largest high-altitude Alpine meadow at around 1800 m. Surrounded by the Sassolungo and Sciliar massifs, spectacular at sunrise and golden hour.', 'PARK', 'https://example.com/images/alpe_di_siusi.jpg', 46.5448, 11.6327),
(4, 'Sassolungo Summit View', 'A classic vantage point below the Sassolungo group where the full sweep of the Val Gardena opens up. Reachable by cable car from Selva.', 'PARK', 'https://example.com/images/sassolungo.jpg', 46.5211, 11.7089),
(4, 'Ortisei Village', 'Charming Ladin village at the foot of Val Gardena, known for its wood-carving tradition and lively piazza. A good lunch stop mid-tour.', 'RESTAURANT', 'https://example.com/images/ortisei.jpg', 46.5752, 11.6722),

-- tour 5: Tuscany Wine and Villages Tour
(5, 'Monteriggioni', 'Perfectly preserved 13th-century walled village rising above the Chianti hills. Dante referenced its towers in the Inferno. Magical at sunset.', 'MONUMENT', 'https://example.com/images/monteriggioni.jpg', 43.3895, 11.2198),
(5, 'Greve in Chianti', 'The informal capital of the Chianti wine region. The triangular piazza is lined with wine merchants and the local winery stop here is a tour highlight.', 'RESTAURANT', 'https://example.com/images/greve_in_chianti.jpg', 43.5841, 11.3128),

-- tour 6: Inca Trail Express: Machu Picchu in 4 Days
(6, 'Llactapata', 'An Inca archaeological site on the first day of the trail offering the earliest views of Machu Picchu across the valley. Often overlooked but historically significant.', 'MONUMENT', 'https://example.com/images/llactapata.jpg', -13.2167, -72.5667),
(6, 'Dead Woman''s Pass', 'The highest point of the Inca Trail at 4215 m. The name derives from the silhouette of the surrounding ridgeline. A demanding but unforgettable crossing.', 'MONUMENT', 'https://example.com/images/dead_womans_pass.jpg', -13.3667, -72.5833),
(6, 'Machu Picchu Citadel', 'The 15th-century Inca citadel set high above the Urubamba River valley. One of the most iconic archaeological sites in the world and the culmination of the trail.', 'MUSEUM', 'https://example.com/images/machu_picchu.jpg', -13.1631, -72.5450),

-- tour 7: Croatian Island Hopping
(7, 'Hvar Town Fortress', 'The Spanish Fortress above Hvar Town offers sweeping views over the harbour, the Pakleni islands and the open Adriatic. A short uphill walk from the main square.', 'MONUMENT', 'https://example.com/images/hvar_fortress.jpg', 43.1733, 16.4403),
(7, 'Korčula Old Town', 'A small walled city on a narrow peninsula said to be the birthplace of Marco Polo. Beautifully intact medieval street grid with cathedral and tower.', 'MUSEUM', 'https://example.com/images/korcula.jpg', 42.9600, 17.1369),
(7, 'Pakleni Islands Cove', 'A sheltered anchorage in the Pakleni island chain just off Hvar. Crystal-clear water, pine shade and complete seclusion — the ideal swimming stop.', 'PARK', 'https://example.com/images/pakleni.jpg', 43.1578, 16.3972);

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
