-- Create entry_type enum for gate logs
CREATE TYPE public.gate_entry_type AS ENUM ('entry', 'exit');

-- Create gate_logs table for tracking entry/exit events
CREATE TABLE public.gate_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  entry_type gate_entry_type NOT NULL,
  gate_id text NOT NULL DEFAULT 'main_gate',
  camera_ref text,
  scanned_by uuid REFERENCES auth.users(id),
  scanned_by_name text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_gate_logs_ticket_id ON public.gate_logs(ticket_id);
CREATE INDEX idx_gate_logs_created_at ON public.gate_logs(created_at DESC);
CREATE INDEX idx_gate_logs_entry_type ON public.gate_logs(entry_type);
CREATE INDEX idx_gate_logs_gate_id ON public.gate_logs(gate_id);

-- Enable RLS
ALTER TABLE public.gate_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Logs are immutable (no update/delete allowed)
CREATE POLICY "Admins and managers can view gate logs"
ON public.gate_logs
FOR SELECT
TO authenticated
USING (
  has_any_role(auth.uid(), ARRAY['admin', 'manager']::app_role[])
);

CREATE POLICY "Staff can create gate logs"
ON public.gate_logs
FOR INSERT
TO authenticated
WITH CHECK (
  has_any_role(auth.uid(), ARRAY['admin', 'manager', 'staff']::app_role[])
);

-- No UPDATE or DELETE policies - logs are immutable

-- Add inside_venue column to tickets to track current location
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS inside_venue boolean NOT NULL DEFAULT false;

-- Create gate_cameras configuration table for camera mapping
CREATE TABLE public.gate_cameras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gate_id text NOT NULL UNIQUE,
  gate_name text NOT NULL,
  camera_ref text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on gate_cameras
ALTER TABLE public.gate_cameras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view gate cameras"
ON public.gate_cameras
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage gate cameras"
ON public.gate_cameras
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default gate
INSERT INTO public.gate_cameras (gate_id, gate_name, camera_ref) 
VALUES ('main_gate', 'Main Gate', 'CAM-01');

-- Enable realtime for gate_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.gate_logs;