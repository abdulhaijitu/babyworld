
-- Allow super_admins to INSERT roles
CREATE POLICY "Super admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Allow super_admins to UPDATE roles
CREATE POLICY "Super admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Allow super_admins to DELETE roles
CREATE POLICY "Super admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Also allow super_admins to view all roles (in addition to existing admin policy)
CREATE POLICY "Super admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role));
