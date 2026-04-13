import base64
import hashlib
import hmac
import json
import os
import re
import time
from dataclasses import dataclass
from typing import Any, Dict, Optional


USERNAME_RE = re.compile(r"^[a-zA-Z0-9_]{3,30}$")


class JwtError(Exception):
    pass


class InvalidTokenFormat(JwtError):
    pass


class InvalidAlgorithm(JwtError):
    pass


class InvalidSignature(JwtError):
    pass


class TokenExpired(JwtError):
    pass


class TokenNotYetValid(JwtError):
    pass


class MissingClaim(JwtError):
    pass


class InvalidRole(JwtError):
    pass


class InvalidUsername(JwtError):
    pass


def extract_bearer_token(authorization_header: str) -> str:
    if not authorization_header or not authorization_header.startswith("Bearer "):
        raise ValueError("Authorization header must start with Bearer ")
    token = authorization_header[len("Bearer "):].strip()
    if not token:
        raise ValueError("Empty bearer token")
    return token


def read_from_authorization_header(authorization_header: str, secret: Optional[str] = None) -> Dict[str, Any]:
    token = extract_bearer_token(authorization_header)
    return parse_and_validate(token, secret or os.getenv("JWT_SECRET", ""), int(time.time()))


def parse_and_validate(jwt: str, secret: str, now_unix: int) -> Dict[str, Any]:
    if not secret:
        raise ValueError("JWT secret is empty")

    parts = jwt.split(".")
    if len(parts) != 3:
        raise InvalidTokenFormat("Invalid JWT format")

    header = json.loads(_b64url_decode(parts[0]))
    payload = json.loads(_b64url_decode(parts[1]))

    if header.get("alg") != "HS256":
        raise InvalidAlgorithm("Unsupported algorithm; expected HS256")

    signing_input = f"{parts[0]}.{parts[1]}".encode("utf-8")
    if not _verify_hs256(signing_input, parts[2], secret):
        raise InvalidSignature("Invalid JWT signature")

    _validate_claims(payload, now_unix)
    return payload


def _verify_hs256(signing_input: bytes, signature_b64url: str, secret: str) -> bool:
    expected = hmac.new(secret.encode("utf-8"), signing_input, hashlib.sha256).digest()
    try:
        got = _b64url_decode_bytes(signature_b64url)
    except Exception:
        return False
    return hmac.compare_digest(expected, got)


def _validate_claims(c: Dict[str, Any], now_unix: int) -> None:
    required = ["user_id", "username", "email", "role", "sub", "iat", "exp", "nbf"]
    for key in required:
        if key not in c or c[key] in (None, ""):
            raise MissingClaim(f"Missing required claim: {key}")

    if c["role"] not in ("user", "admin"):
        raise InvalidRole("Invalid role")

    if not isinstance(c["username"], str) or not USERNAME_RE.fullmatch(c["username"]):
        raise InvalidUsername("Invalid username")

    if not isinstance(c["user_id"], int) or not isinstance(c["sub"], str):
        raise JwtError("user_id must be integer, sub must be string")

    try:
        if c["user_id"] != int(c["sub"]):
            raise JwtError("user_id must match sub")
    except ValueError:
        raise JwtError("sub must be a numeric string")

    if not isinstance(c["iat"], int) or not isinstance(c["exp"], int) or not isinstance(c["nbf"], int):
        raise JwtError("Timestamp claims must be integers")

    if c["exp"] < now_unix:
        raise TokenExpired("Token expired")
    if c["nbf"] > now_unix:
        raise TokenNotYetValid("Token not yet valid")
    if c["user_id"] != c["sub"]:
        raise JwtError("user_id must match sub")


def _b64url_decode(text: str) -> str:
    return _b64url_decode_bytes(text).decode("utf-8")


def _b64url_decode_bytes(text: str) -> bytes:
    padding = "=" * (-len(text) % 4)
    return base64.urlsafe_b64decode(text + padding)
