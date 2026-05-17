# Follower Microservice - Spring Boot & Neo4j

Kompletan mikroservis za upravljanje praćenjem korisnika sa Neo4j grafovskom bazom podataka.

## 📋 Zadaci implementirani

### ✅ 2.1 Korisnici mogu da zaprate druge korisnike
- Kreiranje FOLLOWS relacija između korisnika
- Zaustavljanje praćenja
- Izlistavanje pratilaca i osoba koje korisnik prati

### ✅ 2.2 Čitanje blogova isključivo od pratenih korisnika
- Feed-ovi koji pokazuju samo blogove od pratenih korisnika
- Paginacija sa limitacijom
- Sigurnost - samo dostupni blogovi od pratenih

### ✅ 2.3 Preporuke profila (Friends of Friends)
- Pronalaženje preporučenih korisnika na osnovu "friends of friends" pattern-a
- Ako A prati B, i B prati C, tada se C preporučuje A-u
- Isključuje korisnike koje A već prati

### ✅ 2.4 Neo4j - Graf baza podataka
- Čitava implementacija koristi Neo4j
- Kompleksni Cypher query-ji za pronalaženje relacija
- Optimizovane relacije sa @Relationship anotacijama

---

## 🏗️ Struktura projekta

```
follower-microservice/
├── pom.xml
├── docker-compose.yml
├── neo4j-init.cypher
├── README.md
└── src/main/
    ├── java/com/follower/
    │   ├── FollowerMicroserviceApplication.java
    │   ├── config/
    │   │   └── Neo4jConfig.java
    │   ├── controller/
    │   │   ├── FollowerController.java
    │   │   └── BlogController.java
    │   ├── service/
    │   │   ├── FollowerService.java
    │   │   └── BlogService.java
    │   ├── domain/
    │   │   ├── User.java
    │   │   └── Blog.java
    │   ├── dto/
    │   │   ├── UserDTO.java
    │   │   └── BlogDTO.java
    │   └── repository/
    │       ├── UserRepository.java
    │       └── BlogRepository.java
    └── resources/
        └── application.yml
```

---

## 🚀 Pokretanje

### Korak 1: Pokrenite Neo4j bazu

```bash
docker-compose up -d
```

Čekajte da baza bude dostupna (obično ~30 sekundi):
```bash
docker logs follower-neo4j
```

Otvorite Neo4j Browser: http://localhost:7474
- Korisničko ime: `neo4j`
- Lozinka: `password`

### Korak 2: Inicijalizujte podatke

U Neo4j Browser-u izvršite skripte iz `neo4j-init.cypher`:
1. Kopira celu skriptu
2. Lepite u Neo4j Browser
3. Izvršite svaki blok odvojeno

Ili putem komandne linije:
```bash
cat neo4j-init.cypher | docker exec -i follower-neo4j cypher-shell -u neo4j -p password
```

### Korak 3: Pokrenite Spring Boot aplikaciju

```bash
mvn clean install
mvn spring-boot:run
```

Aplikacija će biti dostupna na: http://localhost:8082

---

## 📚 API Endpoints

### Follower Operacije

#### 1. **Zaprači korisnika**
```http
POST /api/v1/followers/{followerId}/follow/{followingId}
```
Primer:
```bash
curl -X POST http://localhost:8082/api/v1/followers/1/follow/2
```

#### 2. **Otprati korisnika**
```http
DELETE /api/v1/followers/{followerId}/unfollow/{followingId}
```

#### 3. **Pronađi sve blogove od pratenih korisnika (Feed)**
```http
GET /api/v1/followers/{userId}/feed?limit=20
```
Primer:
```bash
curl http://localhost:8082/api/v1/followers/1/feed?limit=20
```

#### 4. **Pronađi sve blogove od pratenih (bez limitacije)**
```http
GET /api/v1/followers/{userId}/all-blogs
```

#### 5. **Pronađi preporučene korisnike (GLAVNI ZADATAK 2.3)**
```http
GET /api/v1/followers/{userId}/recommendations?limit=10
```
Primer:
```bash
curl http://localhost:8082/api/v1/followers/1/recommendations?limit=10
```

#### 6. **Pronađi ljude koje korisnik prati**
```http
GET /api/v1/followers/{userId}/following
```

#### 7. **Pronađi pratioce korisnika**
```http
GET /api/v1/followers/{userId}/followers
```

#### 8. **Proveri da li korisnik1 prati korisnika2**
```http
GET /api/v1/followers/{userId1}/is-following/{userId2}
```

#### 9. **Pronađi korisnika po ID-u**
```http
GET /api/v1/followers/user/{userId}
```

### Blog Operacije

#### 1. **Kreiraj blog**
```http
POST /api/v1/blogs
```
Body:
```json
{
  "authorId": 2,
  "title": "Novi blog",
  "content": "Sadržaj bloga",
  "summary": "Sažetak"
}
```

#### 2. **Pronađi blogove autora**
```http
GET /api/v1/blogs/author/{authorId}
```

#### 3. **Pronađi blog po ID-u**
```http
GET /api/v1/blogs/{blogId}
```

#### 4. **Ažuriraj blog**
```http
PUT /api/v1/blogs/{blogId}
```

#### 5. **Obriši blog**
```http
DELETE /api/v1/blogs/{blogId}
```

---

## 🔍 Neo4j Query Primeri

### Pronađi sve korisnike koje prati korisnik sa ID-om 1
```cypher
MATCH (u:User {userId: 1})-[:FOLLOWS]->(following:User)
RETURN following
```

### Pronađi sve blogove od pratenih korisnika
```cypher
MATCH (user:User {userId: 1})-[:FOLLOWS]->(author:User)-[:PUBLISHED_BY]-(blog:Blog)
WHERE blog.isPublished = true
RETURN blog ORDER BY blog.publishedAt DESC
```

### Pronađi preporučene korisnike (Friends of Friends)
```cypher
MATCH (u:User {userId: 1})-[:FOLLOWS]->(friend:User)-[:FOLLOWS]->(recommendation:User)
WHERE NOT (u)-[:FOLLOWS]->(recommendation:User)
AND recommendation.userId <> 1
WITH recommendation, COUNT(DISTINCT friend) AS mutualFollows
RETURN recommendation
ORDER BY mutualFollows DESC
LIMIT 10
```

---

## 🧪 Testiranje sa cURL

### Test scenario: Korisnik 1 se upisuje na blogove korisnika koje prati

```bash
# 1. Zaprači korisnika 2
curl -X POST http://localhost:8082/api/v1/followers/1/follow/2

# 2. Pronađi blogove koje prati korisnik 1
curl http://localhost:8082/api/v1/followers/1/feed

# 3. Pronađi preporučene korisnike
curl http://localhost:8082/api/v1/followers/1/recommendations

# 4. Proveri da li korisnik 1 prati korisnika 2
curl http://localhost:8082/api/v1/followers/1/is-following/2
```

---

## 📊 Swagger/OpenAPI dokumentacija

Dostupna na: http://localhost:8082/swagger-ui.html

---

## ⚙️ Konfiguracija

`src/main/resources/application.yml`:

```yaml
spring:
  neo4j:
    uri: bolt://localhost:7687
    authentication:
      username: neo4j
      password: password
```

Promenite prema vašim Neo4j postavkama.

---

## 🐛 Troubleshooting

### Konekcija na Neo4j ne radi
```bash
# Proverite da li je Neo4j pokrenuta
docker ps

# Proverite logove
docker logs follower-neo4j
```

### Podaci nisu inicijalizovani
```bash
# Izvršite init skriptu ponovo u Neo4j Browser-u
# http://localhost:7474
```

### Port 8082 je zauzet
Promenite port u `application.yml`:
```yaml
server:
  port: 8083  # novi port
```

---

## 📝 Tehnologije

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Data Neo4j**
- **Neo4j 5.13.0**
- **Maven**
- **Lombok**
- **Swagger/OpenAPI**

---

## 📄 Licenca

MIT

---

## 👨‍💻 Autor

Kreirano za školski/akademski projekat.

---

## 🎯 Sledeći koraci

1. Dodati autentifikaciju (JWT)
2. Dodati rate limiting
3. Dodati caching sa Redis-om
4. Dodati validaciju sa Bean Validation
5. Dodati unit i integration testove
6. Dodati Elasticsearch za pretragu blogova
7. Dodati Cloud deployment (Docker, Kubernetes)
