ALTER TABLE account DROP COLUMN university_id;
ALTER TABLE account ADD COLUMN university_id INT REFERENCES university(id) ON DELETE RESTRICT;

ALTER TABLE project DROP COLUMN organization_id;
ALTER TABLE project ADD COLUMN organization_id INT REFERENCES organization(id) ON DELETE RESTRICT;

ALTER TABLE project DROP COLUMN university_id;
ALTER TABLE project ADD COLUMN university_id INT REFERENCES university(id) ON DELETE RESTRICT;

CREATE TYPE statusEnum AS ENUM ('New', 'Paused', 'Inprogress', 'Completed');
ALTER TABLE project DROP COLUMN status;
ALTER TABLE project ADD COLUMN status statusEnum;

ALTER TABLE preference ADD COLUMN ranking INT NOT NULL;
