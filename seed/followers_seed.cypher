// ============================================================
// FOLLOWERS SERVICE SEED — Neo4j
// Node label: User, property: userId (Long, matches Auth IDs)
// Relationship: (User)-[:FOLLOWS]->(User)
// Every user follows 1–3 others, no self-follows
// ============================================================

// Create all 6 user nodes
MERGE (:User {userId: 1});
MERGE (:User {userId: 2});
MERGE (:User {userId: 3});
MERGE (:User {userId: 4});
MERGE (:User {userId: 5});
MERGE (:User {userId: 6});

// -----------------------------------------------
// FOLLOWS relationships
// user1 follows: 2, 4
// user2 follows: 1, 5, 6
// user3 follows: 4, 6
// user4 follows: 5
// user5 follows: 1, 3, 6
// user6 follows: 2, 4
// -----------------------------------------------
MATCH (a:User {userId: 1}), (b:User {userId: 2}) MERGE (a)-[:FOLLOWS]->(b);
MATCH (a:User {userId: 1}), (b:User {userId: 4}) MERGE (a)-[:FOLLOWS]->(b);

MATCH (a:User {userId: 2}), (b:User {userId: 1}) MERGE (a)-[:FOLLOWS]->(b);
MATCH (a:User {userId: 2}), (b:User {userId: 5}) MERGE (a)-[:FOLLOWS]->(b);
MATCH (a:User {userId: 2}), (b:User {userId: 6}) MERGE (a)-[:FOLLOWS]->(b);

MATCH (a:User {userId: 3}), (b:User {userId: 4}) MERGE (a)-[:FOLLOWS]->(b);
MATCH (a:User {userId: 3}), (b:User {userId: 6}) MERGE (a)-[:FOLLOWS]->(b);

MATCH (a:User {userId: 4}), (b:User {userId: 5}) MERGE (a)-[:FOLLOWS]->(b);

MATCH (a:User {userId: 5}), (b:User {userId: 1}) MERGE (a)-[:FOLLOWS]->(b);
MATCH (a:User {userId: 5}), (b:User {userId: 3}) MERGE (a)-[:FOLLOWS]->(b);
MATCH (a:User {userId: 5}), (b:User {userId: 6}) MERGE (a)-[:FOLLOWS]->(b);

MATCH (a:User {userId: 6}), (b:User {userId: 2}) MERGE (a)-[:FOLLOWS]->(b);
MATCH (a:User {userId: 6}), (b:User {userId: 4}) MERGE (a)-[:FOLLOWS]->(b);
