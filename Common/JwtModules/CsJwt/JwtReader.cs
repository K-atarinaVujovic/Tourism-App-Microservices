using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace JwtReader;

public static class JwtHelpers
{
    private static readonly Regex UsernameRegex = new(@"^[a-zA-Z0-9_]{3,30}$", RegexOptions.Compiled);

    public static string ExtractBearerToken(string authorizationHeader)
    {
        if (string.IsNullOrWhiteSpace(authorizationHeader) ||
            !authorizationHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            throw new ArgumentException("Authorization header must start with Bearer ");
        }

        var token = authorizationHeader["Bearer ".Length..].Trim();
        if (string.IsNullOrWhiteSpace(token))
            throw new ArgumentException("Empty bearer token");

        return token;
    }

    public static JwtToken ReadAndValidate(string authorizationHeader, string secret, long? nowUnix = null)
    {
        var token = ExtractBearerToken(authorizationHeader);
        return ParseAndValidate(token, secret, nowUnix ?? DateTimeOffset.UtcNow.ToUnixTimeSeconds());
    }

    public static JwtToken ParseAndValidate(string jwt, string secret, long nowUnix)
    {
        if (string.IsNullOrWhiteSpace(secret))
            throw new ArgumentException("JWT secret is empty");

        var parts = jwt.Split('.');
        if (parts.Length != 3)
            throw new FormatException("Invalid JWT format");

        var headerJson = Encoding.UTF8.GetString(Base64UrlDecode(parts[0]));
        var payloadJson = Encoding.UTF8.GetString(Base64UrlDecode(parts[1]));

        var header = JsonSerializer.Deserialize<JwtHeader>(headerJson)
                     ?? throw new FormatException("Invalid JWT header");
        if (!string.Equals(header.alg, "HS256", StringComparison.Ordinal))
            throw new NotSupportedException("Unsupported algorithm; expected HS256");

        if (!VerifyHs256($"{parts[0]}.{parts[1]}", parts[2], secret))
            throw new CryptographicException("Invalid JWT signature");

        var claims = JsonSerializer.Deserialize<JwtClaims>(payloadJson)
                     ?? throw new FormatException("Invalid JWT payload");

        ValidateClaims(claims, nowUnix);

        return new JwtToken
        {
            Raw = jwt,
            Header = header,
            Claims = claims,
            Subject = claims.sub
        };
    }

    private static bool VerifyHs256(string signingInput, string signatureB64Url, string secret)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var expected = hmac.ComputeHash(Encoding.UTF8.GetBytes(signingInput));
        var got = Base64UrlDecode(signatureB64Url);
        return CryptographicOperations.FixedTimeEquals(expected, got);
    }

    private static void ValidateClaims(JwtClaims c, long nowUnix)
    {
        if (string.IsNullOrWhiteSpace(c.user_id) ||
            string.IsNullOrWhiteSpace(c.username) ||
            string.IsNullOrWhiteSpace(c.email) ||
            string.IsNullOrWhiteSpace(c.role) ||
            string.IsNullOrWhiteSpace(c.sub))
            throw new InvalidOperationException("Missing required claim");

        if (c.iat == 0 || c.exp == 0 || c.nbf == 0)
            throw new InvalidOperationException("Missing required timestamp claim");

        if (c.role != "user" && c.role != "admin")
            throw new InvalidOperationException("Invalid role");

        if (!UsernameRegex.IsMatch(c.username))
            throw new InvalidOperationException("Invalid username");

        if (c.exp < nowUnix)
            throw new InvalidOperationException("Token expired");

        if (c.nbf > nowUnix)
            throw new InvalidOperationException("Token not yet valid");

        if (c.user_id != c.sub)
            throw new InvalidOperationException("user_id must match sub");
    }

    private static byte[] Base64UrlDecode(string input)
    {
        string s = input.Replace('-', '+').Replace('_', '/');
        switch (s.Length % 4)
        {
            case 2: s += "=="; break;
            case 3: s += "="; break;
            case 1: throw new FormatException("Invalid base64url string");
        }
        return Convert.FromBase64String(s);
    }
}

public sealed class JwtHeader
{
    public string alg { get; set; } = "";
    public string typ { get; set; } = "";
}

public sealed class JwtClaims
{
    public string user_id { get; set; } = "";
    public string username { get; set; } = "";
    public string email { get; set; } = "";
    public string role { get; set; } = "";

    public string sub { get; set; } = "";
    public long iat { get; set; }
    public long exp { get; set; }
    public long nbf { get; set; }
    public string? jti { get; set; }
}

public sealed class JwtToken
{
    public string Raw { get; set; } = "";
    public JwtHeader Header { get; set; } = new();
    public JwtClaims Claims { get; set; } = new();
    public string Subject { get; set; } = "";
}
