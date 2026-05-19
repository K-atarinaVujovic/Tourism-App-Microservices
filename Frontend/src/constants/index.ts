export const ROUTES = {
  LOGIN: '/login',
  HOME: '/home',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You are not authorized to access this resource',
  SESSION_EXPIRED: 'Your session has expired. Please log in again',
  NETWORK_ERROR: 'Network error. Please check your connection',
} as const;
