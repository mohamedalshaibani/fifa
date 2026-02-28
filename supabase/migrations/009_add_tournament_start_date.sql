-- Add start_date to tournaments table
ALTER TABLE public.tournaments
ADD COLUMN start_date timestamptz;

-- Add comment
COMMENT ON COLUMN public.tournaments.start_date IS 'Tournament start date and time for countdown display';
