/**
 * Authentication and Authorization Types
 */

/**
 * User roles in the system
 */
export type UserRole = "FINANCE" | "STAFF" | "ADMIN";

/**
 * User profile data structure
 */
export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole | null;
};

/**
 * Role hierarchy levels for permission checks
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  STAFF: 1,
  FINANCE: 2,
  ADMIN: 3,
} as const;

/**
 * Route-based role permissions
 */
export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  "/home": ["FINANCE", "STAFF", "ADMIN"],
  "/settings": ["FINANCE", "STAFF", "ADMIN"],
  "/users": ["ADMIN"],
} as const;
