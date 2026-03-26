

## Plan: Add Super Admin Role

### Overview
Add a `super_admin` role with elevated privileges above regular admin, specifically the ability to manage other admin users. Regular admins will lose access to user management — only super admins can create/delete users and manage roles.

### Changes

#### 1. Database Migration
- Add `super_admin` to the `app_role` enum: `ALTER TYPE app_role ADD VALUE 'super_admin'`
- Update RLS policies on `user_roles` to allow super_admins full CRUD (currently no INSERT/UPDATE/DELETE for anyone via client)
- Add INSERT, UPDATE, DELETE policies on `user_roles` for super_admins

#### 2. Update `admin@babyworld.com` role
- Use the insert tool to update their role from `admin` to `super_admin` in `user_roles`

#### 3. Update `useUserRoles.ts`
- Add `super_admin` to the `AppRole` type
- Add `isSuperAdmin` boolean derived from roles
- Super admin inherits all admin/manager/staff permissions
- Add `canManageAdmins` permission (super_admin only)

#### 4. Update `useAuth.ts`
- Update `checkAdminRole` to also recognize `super_admin` as admin-level access so the layout gate still works

#### 5. Update `AdminSidebar.tsx`
- Add `super_admin` to `requiredRoles` arrays where `admin` appears
- Make "Users" menu item require `super_admin` only
- Add super_admin to `roleConfig` display

#### 6. Update `AdminUsers.tsx`
- Add `super_admin` role option in the create user form
- Add super_admin badge styling and config
- Only super_admins can access this page (enforced by sidebar + role check)

#### 7. Update `AdminLayout.tsx`
- Change `isAdmin` check to also accept users with any staff-level role (since `useUserRoles` handles granular permissions, the layout should allow any role-holder in)
- Or: update `checkAdminRole` in `useAuth` to return true for any role (`admin`, `manager`, `staff`, `super_admin`)

#### 8. Update `create-admin` edge function
- Add `super_admin` to the valid roles list

### Files to modify
- **New migration** — add `super_admin` enum value + RLS policies
- `src/hooks/useUserRoles.ts` — add super_admin support
- `src/hooks/useAuth.ts` — recognize super_admin as admin
- `src/components/admin/AdminSidebar.tsx` — update menu visibility
- `src/pages/admin/AdminUsers.tsx` — add super_admin role option + restrict access
- `supabase/functions/create-admin/index.ts` — accept super_admin role

