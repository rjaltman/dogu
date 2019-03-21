ALTER TABLE account ADD UNIQUE (username);
ALTER TABLE account DROP COLUMN contact;
CREATE TYPE positionEnum AS ENUM ('Instructor', 'Student', 'Organizer');
ALTER TABLE account DROP COLUMN position;
ALTER TABLE account ADD COLUMN position positionEnum;
