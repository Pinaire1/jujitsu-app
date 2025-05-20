-- Add belt_level column to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS belt_level TEXT DEFAULT 'WHITE';

-- Create curriculum table
CREATE TABLE IF NOT EXISTS curriculum (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  belt_level TEXT NOT NULL,
  technique_name TEXT NOT NULL,
  description TEXT,
  position TEXT,
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample curriculum data
INSERT INTO curriculum (belt_level, technique_name, description, position, difficulty, position) VALUES
-- White Belt Techniques
('WHITE', 'Forward Roll', 'Basic forward rolling technique for safe falling', 'Standing', 1, 1),
('WHITE', 'Backward Roll', 'Basic backward rolling technique for safe falling', 'Standing', 1, 2),
('WHITE', 'Shrimping', 'Hip escape movement to create space', 'Ground', 1, 3),
('WHITE', 'Bridge and Roll', 'Basic escaping technique from bottom mount', 'Mount', 2, 4),
('WHITE', 'Arm Bar from Guard', 'Basic submission from guard position', 'Guard', 3, 5),

-- Blue Belt Techniques
('BLUE', 'Scissor Sweep', 'Sweep opponent from closed guard using leg leverage', 'Guard', 2, 1),
('BLUE', 'Triangle Choke', 'Submission using legs to create a triangle around opponent's neck', 'Guard', 3, 2),
('BLUE', 'Kimura', 'Shoulder lock submission', 'Side Control', 2, 3),
('BLUE', 'Double Leg Takedown', 'Fundamental wrestling takedown', 'Standing', 2, 4),
('BLUE', 'Half Guard Recovery', 'Technique to recover full guard from half guard', 'Half Guard', 3, 5),

-- Purple Belt Techniques
('PURPLE', 'De La Riva Guard', 'Open guard variation using foot on hip and leg wrap', 'Guard', 3, 1),
('PURPLE', 'Berimbolo', 'Complex rolling movement to take back from De La Riva guard', 'Guard', 4, 2),
('PURPLE', 'X-Guard Sweep', 'Advanced sweep from X-Guard position', 'X-Guard', 3, 3),
('PURPLE', 'Omoplata', 'Shoulder lock from guard using leg pressure', 'Guard', 3, 4),
('PURPLE', 'North-South Choke', 'Submission from north-south position', 'North-South', 4, 5),

-- Brown Belt Techniques
('BROWN', 'Deep Half Guard', 'Advanced half guard variation coming underneath opponent', 'Half Guard', 4, 1),
('BROWN', 'Inverted Guard', 'Upside down guard position for complex attacks', 'Guard', 4, 2),
('BROWN', 'Rubber Guard', 'Advanced guard control using high flexibility', 'Guard', 4, 3),
('BROWN', 'Kiss of the Dragon', 'Advanced sweeping technique from reverse De La Riva', 'Guard', 5, 4),
('BROWN', 'Helicopter Armbar', 'Flying armbar with rotational entry', 'Standing', 5, 5),

-- Black Belt Techniques
('BLACK', 'Lapel Guard', 'Using the gi lapel for complex control', 'Guard', 5, 1),
('BLACK', 'Worm Guard', 'Advanced lapel guard variation', 'Guard', 5, 2),
('BLACK', 'Gogoplata', 'Submission using shin across throat', 'Guard', 5, 3),
('BLACK', 'Flying Triangle', 'Aerial entry to triangle submission', 'Standing', 5, 4),
('BLACK', 'Advanced Back Control System', 'Complete system for maintaining and finishing from back control', 'Back Control', 5, 5);

-- Create view for belt distribution (for analytics)
CREATE OR REPLACE VIEW belt_distribution AS
SELECT belt_level, COUNT(*) as count
FROM students
WHERE belt_level IS NOT NULL
GROUP BY belt_level
ORDER BY CASE
  WHEN belt_level = 'WHITE' THEN 1
  WHEN belt_level = 'BLUE' THEN 2
  WHEN belt_level = 'PURPLE' THEN 3
  WHEN belt_level = 'BROWN' THEN 4
  WHEN belt_level = 'BLACK' THEN 5
  ELSE 6
END;

-- Create training_videos table
CREATE TABLE IF NOT EXISTS training_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  analysis_prompt TEXT NOT NULL,
  video_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create video_analysis table for storing AI analysis results
CREATE TABLE IF NOT EXISTS video_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES training_videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TEXT NOT NULL,
  tip TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster video queries
CREATE INDEX IF NOT EXISTS idx_training_videos_user_id ON training_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_video_analysis_video_id ON video_analysis(video_id);
CREATE INDEX IF NOT EXISTS idx_video_analysis_user_id ON video_analysis(user_id);

-- Create todays_signed_in_belts table for tracking active users by belt level
CREATE TABLE IF NOT EXISTS todays_signed_in_belts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  belt_level TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(belt_level, date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_todays_signed_in_belts_date ON todays_signed_in_belts(date);
CREATE INDEX IF NOT EXISTS idx_todays_signed_in_belts_belt_level ON todays_signed_in_belts(belt_level);

-- Create a function to clean up old records
CREATE OR REPLACE FUNCTION cleanup_old_signed_in_belts()
RETURNS void AS $$
BEGIN
  DELETE FROM todays_signed_in_belts WHERE date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to run cleanup at midnight
CREATE OR REPLACE FUNCTION trigger_cleanup_old_signed_in_belts()
RETURNS trigger AS $$
BEGIN
  PERFORM cleanup_old_signed_in_belts();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_signed_in_belts_trigger
  AFTER INSERT ON todays_signed_in_belts
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_cleanup_old_signed_in_belts(); 