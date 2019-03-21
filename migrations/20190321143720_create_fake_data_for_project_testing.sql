INSERT INTO organization (name) VALUES ('A FAKE ORGANIZATION');

INSERT INTO project (organization_id, university_id, name, description)
VALUES 
((SELECT id FROM organization WHERE name = 'A FAKE ORGANIZATION'), (SELECT id FROM university WHERE name = 'NOT REAL SCHOOL'), 'Fake project 1', 'This is a complicated project involving deep learning, NoSQL, and other buzzwords that will certainly attract developers who call themselves "ninjas."'), 
((SELECT id FROM ORGANIZATION WHERE name = 'A FAKE ORGANIZATION'), (SELECT id FROM university WHERE name = 'NOT REAL SCHOOL'), 'Fake project 2', 'This is a regular project involving, NoSQL, and technologies that will probably just work properly.');

INSERT INTO project_tags (project_id, tag) VALUES 
((SELECT id FROM project WHERE name = 'Fake project 1'), 'AI'), 
((SELECT id FROM project WHERE name = 'Fake project 1'), 'NoSQL'), 
((SELECT id FROM project WHERE name = 'Fake project 1'), 'Web scale'), 
((SELECT id FROM project WHERE name = 'Fake project 2'), 'Java'), 
((SELECT id FROM project WHERE name = 'Fake project 2'), 'MySQL'), 
((SELECT id FROM project WHERE name = 'Fake project 2'), 'Apache');
