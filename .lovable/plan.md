

## Plan: Reset password for admin@babyworld.com

The auth logs show repeated "Invalid login credentials" errors. The user wants the password set to `admin@babyworld.com`.

Since we can't call `auth.admin.updateUserById` from psql, the best approach is to update the `create-admin` edge function to also support password reset, then call it.

### Approach

1. **Create a new edge function `reset-password`** that uses the Supabase admin client to:
   - Look up the user by email via `supabase.auth.admin.listUsers()`
   - Call `supabase.auth.admin.updateUserById(userId, { password })` to reset the password

2. **Call the edge function** to reset the password for `admin@babyworld.com` to `admin@babyworld.com`

3. **Optionally add a "Reset Password" button** in AdminUsers page for future use

### Files to create/edit
- **Create**: `supabase/functions/reset-password/index.ts` — edge function that accepts `{ email, password }` and resets via admin API
- **Edit**: `src/pages/admin/AdminUsers.tsx` — add a reset password action button (optional, can skip for now)

### Edge function logic
```typescript
// Look up user by email
const { data: { users } } = await supabase.auth.admin.listUsers();
const user = users.find(u => u.email === email);
// Update password
await supabase.auth.admin.updateUserById(user.id, { password });
```

After deploying the function, I'll invoke it to set the password immediately.

