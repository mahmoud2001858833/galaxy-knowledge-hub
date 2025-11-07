-- Create art_projects table for student uploads
CREATE TABLE IF NOT EXISTS public.art_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_name TEXT NOT NULL,
  project_title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  user_id UUID NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.art_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for art_projects
CREATE POLICY "Anyone can view art projects"
  ON public.art_projects FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create art projects"
  ON public.art_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own art projects"
  ON public.art_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own art projects"
  ON public.art_projects FOR DELETE
  USING (auth.uid() = user_id);

-- Create art_project_likes table
CREATE TABLE IF NOT EXISTS public.art_project_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.art_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE public.art_project_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view art project likes"
  ON public.art_project_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like art projects"
  ON public.art_project_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike art projects"
  ON public.art_project_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Create art_project_comments table
CREATE TABLE IF NOT EXISTS public.art_project_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.art_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.art_project_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view art project comments"
  ON public.art_project_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can comment on art projects"
  ON public.art_project_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.art_project_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Create artists table
CREATE TABLE IF NOT EXISTS public.artists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  birth_year TEXT,
  death_year TEXT,
  nationality TEXT,
  biography TEXT NOT NULL,
  famous_works TEXT[],
  art_style TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view artists"
  ON public.artists FOR SELECT
  USING (true);

-- Insert 20 famous artists
INSERT INTO public.artists (name, birth_year, death_year, nationality, biography, famous_works, art_style, image_url) VALUES
('Leonardo da Vinci', '1452', '1519', 'Italian', 'Leonardo da Vinci was a Renaissance polymath who excelled in art, science, engineering, and anatomy. His works represent the pinnacle of Renaissance achievement.', ARRAY['Mona Lisa', 'The Last Supper', 'Vitruvian Man'], 'Renaissance', 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400'),
('Vincent van Gogh', '1853', '1890', 'Dutch', 'Vincent van Gogh was a post-impressionist painter known for his bold colors, emotional honesty, and dramatic brushwork. Despite selling only one painting during his lifetime, he is now one of the most famous artists in history.', ARRAY['The Starry Night', 'Sunflowers', 'The Bedroom'], 'Post-Impressionism', 'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=400'),
('Pablo Picasso', '1881', '1973', 'Spanish', 'Pablo Picasso was a Spanish painter, sculptor, and co-founder of Cubism. His revolutionary artistic styles and prolific output made him one of the most influential artists of the 20th century.', ARRAY['Guernica', 'Les Demoiselles d''Avignon', 'The Weeping Woman'], 'Cubism', 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=400'),
('Claude Monet', '1840', '1926', 'French', 'Claude Monet was a founder of French Impressionism. He sought to capture the changing effects of light and color in nature through his innovative painting techniques.', ARRAY['Water Lilies', 'Impression Sunrise', 'Rouen Cathedral series'], 'Impressionism', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400'),
('Michelangelo', '1475', '1564', 'Italian', 'Michelangelo was a Renaissance sculptor, painter, and architect. His works demonstrate unparalleled skill in depicting the human form and expressing spiritual intensity.', ARRAY['David', 'Sistine Chapel Ceiling', 'Pietà'], 'Renaissance', 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=400'),
('Salvador Dalí', '1904', '1989', 'Spanish', 'Salvador Dalí was a surrealist artist known for his technical skill, precise draftsmanship, and the striking and bizarre images in his work. His eccentric personality was as famous as his art.', ARRAY['The Persistence of Memory', 'The Elephants', 'Swans Reflecting Elephants'], 'Surrealism', 'https://images.unsplash.com/photo-1578926078451-60a4a43781e4?w=400'),
('Raphael', '1483', '1520', 'Italian', 'Raphael was an Italian Renaissance master known for the perfection and grace of his paintings and architecture. He represents the High Renaissance ideal of harmony and balance.', ARRAY['The School of Athens', 'The Sistine Madonna', 'The Transfiguration'], 'Renaissance', 'https://images.unsplash.com/photo-1579541814924-49fef17c5be5?w=400'),
('Caravaggio', '1571', '1610', 'Italian', 'Caravaggio was a revolutionary Baroque painter known for his dramatic use of lighting (chiaroscuro) and realistic depiction of human figures. His work had a lasting influence on Western art.', ARRAY['The Calling of St Matthew', 'Judith Beheading Holofernes', 'The Conversion of Saint Paul'], 'Baroque', 'https://images.unsplash.com/photo-1577083552695-f4d8b05d5699?w=400'),
('Gustav Klimt', '1862', '1918', 'Austrian', 'Gustav Klimt was an Austrian symbolist painter known for his decorative style, use of gold leaf, and exploration of themes of love, death, and regeneration.', ARRAY['The Kiss', 'Portrait of Adele Bloch-Bauer I', 'The Tree of Life'], 'Art Nouveau', 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400'),
('Paul Cézanne', '1839', '1906', 'French', 'Paul Cézanne was a French Post-Impressionist painter whose work laid the foundations for the transition from 19th-century Impressionism to 20th-century Cubism.', ARRAY['The Card Players', 'Mont Sainte-Victoire', 'The Bathers'], 'Post-Impressionism', 'https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?w=400'),
('Rembrandt', '1606', '1669', 'Dutch', 'Rembrandt was a Dutch Golden Age painter and printmaker, widely considered one of the greatest visual artists in history. He mastered the use of light and shadow to create emotional depth.', ARRAY['The Night Watch', 'Self-Portraits', 'The Anatomy Lesson'], 'Baroque', 'https://images.unsplash.com/photo-1577083552871-223ebb8d34de?w=400'),
('Edvard Munch', '1863', '1944', 'Norwegian', 'Edvard Munch was a Norwegian Expressionist painter known for his evocative treatment of psychological themes. His work bridged Impressionism and Expressionism.', ARRAY['The Scream', 'Madonna', 'The Dance of Life'], 'Expressionism', 'https://images.unsplash.com/photo-1577083553702-dc8b9d0f2f3e?w=400'),
('Jackson Pollock', '1912', '1956', 'American', 'Jackson Pollock was a major figure in the abstract expressionist movement, known for his unique style of drip painting. His energetic method revolutionized modern art.', ARRAY['No. 5, 1948', 'Autumn Rhythm', 'Blue Poles'], 'Abstract Expressionism', 'https://images.unsplash.com/photo-1577083288073-40892c0860eb?w=400'),
('Andy Warhol', '1928', '1987', 'American', 'Andy Warhol was a leading figure in the Pop Art movement. His works explore the relationship between artistic expression, celebrity culture, and advertising.', ARRAY['Campbell''s Soup Cans', 'Marilyn Diptych', 'Eight Elvises'], 'Pop Art', 'https://images.unsplash.com/photo-1577083552160-48ac14d934df?w=400'),
('Henri Matisse', '1869', '1954', 'French', 'Henri Matisse was a French artist known for his use of color and fluid, original draughtsmanship. He was a leader of the Fauvism movement.', ARRAY['The Dance', 'Blue Nude', 'The Joy of Life'], 'Fauvism', 'https://images.unsplash.com/photo-1577083288676-c8e37ed0d1e4?w=400'),
('Diego Velázquez', '1599', '1660', 'Spanish', 'Diego Velázquez was a Spanish Baroque painter who served as court painter to King Philip IV. He is regarded as one of the most important painters of the Spanish Golden Age.', ARRAY['Las Meninas', 'Portrait of Pope Innocent X', 'The Surrender of Breda'], 'Baroque', 'https://images.unsplash.com/photo-1577083553134-8d5b6a8b4fba?w=400'),
('Frida Kahlo', '1907', '1954', 'Mexican', 'Frida Kahlo was a Mexican painter known for her powerful self-portraits that explored themes of identity, postcolonialism, gender, class, and race in Mexican society.', ARRAY['The Two Fridas', 'Self-Portrait with Thorn Necklace', 'The Broken Column'], 'Surrealism', 'https://images.unsplash.com/photo-1577083553831-e8f6b6f4c19d?w=400'),
('Georgia O''Keeffe', '1887', '1986', 'American', 'Georgia O''Keeffe was an American modernist artist known for her paintings of enlarged flowers, New York skyscrapers, and New Mexico landscapes.', ARRAY['Black Iris', 'Sky Above Clouds', 'Jimson Weed'], 'Modernism', 'https://images.unsplash.com/photo-1577083553492-2e4c0e6e1a4d?w=400'),
('Marc Chagall', '1887', '1985', 'Belarusian-French', 'Marc Chagall was a Russian-French artist associated with several major artistic styles. His work is characterized by dreamlike imagery and symbolic use of color.', ARRAY['I and the Village', 'The Birthday', 'White Crucifixion'], 'Surrealism', 'https://images.unsplash.com/photo-1577083553358-3b6a56b7e6e2?w=400'),
('Auguste Rodin', '1840', '1917', 'French', 'Auguste Rodin was a French sculptor often regarded as the father of modern sculpture. His work departed from traditional themes of mythology and allegory.', ARRAY['The Thinker', 'The Kiss', 'The Gates of Hell'], 'Sculpture', 'https://images.unsplash.com/photo-1577083553626-fbe7a8a7b09b?w=400');

-- Create drawing_challenges table
CREATE TABLE IF NOT EXISTS public.drawing_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_prompt TEXT NOT NULL,
  time_limit INTEGER NOT NULL DEFAULT 1800, -- 30 minutes in seconds
  player1_id UUID NOT NULL,
  player2_id UUID NOT NULL,
  player1_submission TEXT,
  player2_submission TEXT,
  winner_id UUID,
  ai_evaluation TEXT,
  status TEXT NOT NULL DEFAULT 'waiting', -- waiting, in_progress, completed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.drawing_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view drawing challenges"
  ON public.drawing_challenges FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create drawing challenges"
  ON public.drawing_challenges FOR INSERT
  WITH CHECK (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Players can update their own challenges"
  ON public.drawing_challenges FOR UPDATE
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Create trigger for updating art_projects updated_at
CREATE OR REPLACE FUNCTION update_art_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER art_projects_updated_at
  BEFORE UPDATE ON public.art_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_art_projects_updated_at();