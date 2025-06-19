-- Add enhanced profile fields to users table
ALTER TABLE users 
ADD COLUMN tagline TEXT,
ADD COLUMN years_experience TEXT,
ADD COLUMN linkedin_url TEXT,
ADD COLUMN website_url TEXT,
ADD COLUMN portfolio_url TEXT,
ADD COLUMN skills JSONB DEFAULT '[]'::jsonb,
ADD COLUMN achievements JSONB DEFAULT '[]'::jsonb,
ADD COLUMN privacy_settings JSONB DEFAULT '{
  "profileVisibility": "public",
  "showContact": true,
  "showExperience": true,
  "allowMessages": true,
  "showOnlinePresence": true
}'::jsonb,
ADD COLUMN profile_completion INTEGER DEFAULT 0,
ADD COLUMN avatar_url TEXT;