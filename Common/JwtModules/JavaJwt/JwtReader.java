package jwtreader;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.regex.Pattern;

public final class JwtReader {
    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_]{3,30}$");
    private static final ObjectMapper MAPPER = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    private JwtReader() {}

    public static String extractBearerToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Authorization header must start with Bearer ");
        }
        String token = authorizationHeader.substring("Bearer ".length()).trim();
        if (token.isEmpty()) {
            throw new IllegalArgumentException("Empty bearer token");
        }
        return token;
    }

    public static JwtToken readAndValidate(String authorizationHeader, String secret) {
        return parseAndValidate(extractBearerToken(authorizationHeader), secret, Instant.now().getEpochSecond());
    }

    public static JwtToken parseAndValidate(String jwt, String secret, long nowUnix) {
        if (secret == null || secret.isEmpty()) {
            throw new IllegalArgumentException("JWT secret is empty");
        }

        String[] parts = jwt.split("\\.");
        if (parts.length != 3) {
            throw new IllegalArgumentException("Invalid JWT format");
        }

        try {
            String headerJson = new String(base64UrlDecode(parts[0]), StandardCharsets.UTF_8);
            String payloadJson = new String(base64UrlDecode(parts[1]), StandardCharsets.UTF_8);

            JwtHeader header = MAPPER.readValue(headerJson, JwtHeader.class);
            if (!"HS256".equals(header.alg)) {
                throw new IllegalArgumentException("Unsupported algorithm; expected HS256");
            }

            if (!verifyHs256(parts[0] + "." + parts[1], parts[2], secret)) {
                throw new SecurityException("Invalid JWT signature");
            }

            JwtClaims claims = MAPPER.readValue(payloadJson, JwtClaims.class);
            validateClaims(claims, nowUnix);

            return new JwtToken(jwt, header, claims);
        } catch (Exception e) {
            if (e instanceof RuntimeException re) throw re;
            throw new RuntimeException("Failed to parse JWT: " + e.getMessage(), e);
        }
    }

    private static boolean verifyHs256(String signingInput, String signatureB64Url, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] expected = mac.doFinal(signingInput.getBytes(StandardCharsets.UTF_8));
        byte[] got = base64UrlDecode(signatureB64Url);
        return java.security.MessageDigest.isEqual(expected, got);
    }

    private static void validateClaims(JwtClaims c, long nowUnix) {
        if (isBlank(c.user_id) || isBlank(c.username) || isBlank(c.email) || isBlank(c.role) || isBlank(c.sub)) {
            throw new IllegalArgumentException("Missing required claim");
        }
        if (c.iat == 0 || c.exp == 0 || c.nbf == 0) {
            throw new IllegalArgumentException("Missing required timestamp claim");
        }
        if (!"user".equals(c.role) && !"admin".equals(c.role)) {
            throw new IllegalArgumentException("Invalid role");
        }
        if (!USERNAME_PATTERN.matcher(c.username).matches()) {
            throw new IllegalArgumentException("Invalid username");
        }
        if (c.exp < nowUnix) {
            throw new IllegalArgumentException("Token expired");
        }
        if (c.nbf > nowUnix) {
            throw new IllegalArgumentException("Token not yet valid");
        }
        try {
            if (Long.parseLong(c.user_id) != Long.parseLong(c.sub)) {
                throw new IllegalArgumentException("user_id must match sub");
            }
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("user_id and sub must be numeric strings");
        }
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private static byte[] base64UrlDecode(String s) {
        return Base64.getUrlDecoder().decode(s);
    }

    public static final class JwtHeader {
        public String alg = "";
        public String typ = "";
    }

    public static final class JwtClaims {
        public String user_id = "";
        public String username = "";
        public String email = "";
        public String role = "";
        public String sub;
        public long iat;
        public long exp;
        public long nbf;
        public String jti;
    }

    public static final class JwtToken {
        public final String raw;
        public final JwtHeader header;
        public final JwtClaims claims;

        public JwtToken(String raw, JwtHeader header, JwtClaims claims) {
            this.raw = raw;
            this.header = header;
            this.claims = claims;
        }
    }
}
