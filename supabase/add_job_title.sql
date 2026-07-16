-- Add job_title column to contacts table
ALTER TABLE contacts ADD COLUMN job_title text;

-- Create index for faster lookups
CREATE INDEX ON contacts (company);
