// ============================================================
// STAKEHOLDERS SERVICE SEED — MongoDB (Beanie / Motor)
// Collection: profiles
// user_id maps to Auth user IDs (1–6)
// Roles: users 1,2,3 = tourist | users 4,5,6 = author
// Lastnames: Role + userId e.g. "Tourist1", "Author4"
// No imageUrl
// ============================================================

db = db.getSiblingDB('stakeholders');

db.profiles.insertMany([
  {
    name: "Admin",
    lastname: "Tourist1",
    imageUrl: null,
    biography: "Avid traveler exploring hidden gems around the world.",
    quote: "The world is a book, and those who do not travel read only one page.",
    role: "tourist",
    user_id: 1
  },
  {
    name: "Marko",
    lastname: "Tourist2",
    imageUrl: null,
    biography: "Backpacker at heart, always chasing the next adventure.",
    quote: "Travel far enough, you meet yourself.",
    role: "tourist",
    user_id: 2
  },
  {
    name: "Stana",
    lastname: "Tourist3",
    imageUrl: null,
    biography: "Weekend wanderer and food tourist.",
    quote: "Not all those who wander are lost.",
    role: "tourist",
    user_id: 3
  },
  {
    name: "Boban",
    lastname: "Author4",
    imageUrl: null,
    biography: "Travel writer with a passion for coastal destinations and city breaks.",
    quote: "Write what you know — I know the road.",
    role: "author",
    user_id: 4
  },
  {
    name: "Lejla",
    lastname: "Author5",
    imageUrl: null,
    biography: "Crafting immersive travel narratives from mountain trails to bustling bazaars.",
    quote: "Every journey deserves to be told.",
    role: "author",
    user_id: 5
  },
  {
    name: "Petar",
    lastname: "Author6",
    imageUrl: null,
    biography: "Adventure tour curator and storyteller. Turning trips into memories.",
    quote: "Adventure is worthwhile in itself.",
    role: "author",
    user_id: 6
  }
]);

print("Profiles seeded successfully.");
