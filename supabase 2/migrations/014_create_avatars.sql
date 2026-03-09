-- Avatar definitions for user profiles
-- This table stores available avatars users can choose from

CREATE TABLE IF NOT EXISTS avatars (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'player', -- player, legend, mascot, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default avatars (20 football stars)
INSERT INTO avatars (id, name, display_name, description, image_url, category) VALUES
('mbappe', 'Mbappé', 'Kylian Mbappé', 'PSG superstar, lightning-fast striker', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mbappe', 'player'),
('messi', 'Messi', 'Lionel Messi', 'Argentine legend, GOAT status', 'https://api.dicebear.com/7.x/avataaars/svg?seed=messi', 'player'),
('ronaldo', 'Ronaldo', 'Cristiano Ronaldo', 'Portuguese icon, elite scorer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ronaldo', 'player'),
('haaland', 'Haaland', 'Erling Haaland', 'Manchester City goal machine', 'https://api.dicebear.com/7.x/avataaars/svg?seed=haaland', 'player'),
('neymar', 'Neymar', 'Neymar Jr', 'Brazilian flair, skill master', 'https://api.dicebear.com/7.x/avataaars/svg?seed=neymar', 'player'),
('vinicius', 'Vinícius', 'Vinícius Júnior', 'Real Madrid speedster', 'https://api.dicebear.com/7.x/avataaars/svg?seed=vinicius', 'player'),
('benzema', 'Benzema', 'Karim Benzema', 'All-time Real Madrid legend', 'https://api.dicebear.com/7.x/avataaars/svg?seed=benzema', 'player'),
('lewandowski', 'Lewandowski', 'Robert Lewandowski', 'Elite striker, consistent scorer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=lewandowski', 'player'),
('salah', 'Salah', 'Mohamed Salah', 'Liverpool Egyptian King', 'https://api.dicebear.com/7.x/avataaars/svg?seed=salah', 'player'),
('kane', 'Kane', 'Harry Kane', 'England captain, predatory finisher', 'https://api.dicebear.com/7.x/avataaars/svg?seed=kane', 'player'),
('de_bruyne', 'De Bruyne', 'Kevin De Bruyne', 'Midfield maestro, playmaker', 'https://api.dicebear.com/7.x/avataaars/svg?seed=debruyne', 'player'),
('modric', 'Modrić', 'Luka Modrić', 'Croatian elegance, Ballon d''Or winner', 'https://api.dicebear.com/7.x/avataaars/svg?seed=modric', 'player'),
('ronaldinho', 'Ronaldinho', 'Ronaldinho', 'Brazilian magician, pure joy of football', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ronaldinho', 'legend'),
('pelé', 'Pelé', 'Pelé', 'The King, football royalty', 'https://api.dicebear.com/7.x/avataaars/svg?seed=pele', 'legend'),
('maradona', 'Maradona', 'Diego Maradona', 'Argentine genius, hand of god', 'https://api.dicebear.com/7.x/avataaars/svg?seed=maradona', 'legend'),
('bale', 'Bale', 'Gareth Bale', 'Welsh winger, powerful athlete', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bale', 'player'),
('griezmann', 'Griezmann', 'Antoine Griezmann', 'French forward, all-rounder', 'https://api.dicebear.com/7.x/avataaars/svg?seed=griezmann', 'player'),
('auba', 'Aubameyang', 'Pierre-Emerick Aubameyang', 'Gabon speedster, explosive finisher', 'https://api.dicebear.com/7.x/avataaars/svg?seed=auba', 'player'),
('foden', 'Foden', 'Phil Foden', 'Manchester City wonderkid', 'https://api.dicebear.com/7.x/avataaars/svg?seed=foden', 'player'),
('vvd', 'Van Dijk', 'Virgil Van Dijk', 'Liverpool colossus, defensive fortress', 'https://api.dicebear.com/7.x/avataaars/svg?seed=vandijk', 'player');

-- Enable RLS
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;

-- RLS Policy: everyone can read avatars
CREATE POLICY "Anyone can view avatars" ON avatars
  FOR SELECT USING (true);
