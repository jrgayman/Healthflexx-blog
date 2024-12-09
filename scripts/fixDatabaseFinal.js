import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmmkfrohclzpwpnbtajc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbWtmcm9oY2x6cHdwbmJ0YWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTM4MDYsImV4cCI6MjA0NjM4OTgwNn0.2m8L21ploy11YBpO3Wf0Qv7uZ243oIqA2PP9DuaR0As';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabase() {
  try {
    console.log('Starting database fixes...');

    await supabase.rpc('exec_sql', {
      sql: `
        -- Drop existing triggers and functions
        DROP TRIGGER IF EXISTS trigger_cleanup_post_image ON posts;
        DROP TRIGGER IF EXISTS cleanup_orphaned_images ON posts;
        DROP FUNCTION IF EXISTS cleanup_post_image() CASCADE;
        DROP FUNCTION IF EXISTS delete_orphaned_images() CASCADE;

        -- Drop existing constraints
        ALTER TABLE posts
        DROP CONSTRAINT IF EXISTS check_image_source,
        DROP CONSTRAINT IF EXISTS posts_image_id_fkey,
        DROP CONSTRAINT IF EXISTS check_valid_type;

        -- Remove old columns
        ALTER TABLE posts
        DROP COLUMN IF EXISTS image_id,
        DROP COLUMN IF EXISTS image_url;

        -- Reset storage_path
        ALTER TABLE posts
        DROP COLUMN IF EXISTS storage_path CASCADE;

        ALTER TABLE posts
        ADD COLUMN storage_path TEXT;

        -- Create index for storage_path
        CREATE INDEX IF NOT EXISTS idx_posts_storage_path ON posts(storage_path);

        -- Ensure type column exists and is properly configured
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'posts' AND column_name = 'type'
          ) THEN
            ALTER TABLE posts ADD COLUMN type TEXT DEFAULT 'article';
          END IF;
        END $$;

        -- Set default type for existing posts
        UPDATE posts 
        SET type = 'article' 
        WHERE type IS NULL;

        -- Make type column required
        ALTER TABLE posts 
        ALTER COLUMN type SET NOT NULL;

        -- Add type validation
        ALTER TABLE posts
        ADD CONSTRAINT check_valid_type
        CHECK (type IN ('article', 'video', 'app', 'weblink'));

        -- Clean up storage paths
        UPDATE posts
        SET storage_path = NULL
        WHERE storage_path = '';

        -- Create cleanup function
        CREATE OR REPLACE FUNCTION cleanup_post_image()
        RETURNS TRIGGER AS $$
        BEGIN
          IF (TG_OP = 'UPDATE' AND OLD.storage_path IS DISTINCT FROM NEW.storage_path) OR 
             (TG_OP = 'DELETE' AND OLD.storage_path IS NOT NULL) THEN
            -- Storage cleanup handled by application
            NULL;
          END IF;
          
          IF TG_OP = 'DELETE' THEN
            RETURN OLD;
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Create cleanup trigger
        CREATE TRIGGER trigger_cleanup_post_image
        BEFORE UPDATE OR DELETE ON posts
        FOR EACH ROW
        EXECUTE FUNCTION cleanup_post_image();
      `
    });

    console.log('Database structure updated successfully!');
    return true;
  } catch (error) {
    console.error('Error updating database:', error);
    return false;
  }
}

fixDatabase()
  .then(() => {
    console.log('Database update completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Database update failed:', error);
    process.exit(1);
  });