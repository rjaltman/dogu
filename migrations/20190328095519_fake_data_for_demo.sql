DELETE FROM project_tags WHERE project_id = (SELECT id FROM project WHERE name = 'Fake project 1');
DELETE FROM project_tags WHERE project_id = (SELECT id FROM project WHERE name = 'Fake project 2');
DELETE FROM project WHERE organization_id = (SELECT id FROM organization WHERE name = 'A FAKE ORGANIZATION');

INSERT INTO university (name, location, created, site) VALUES ('University of Illinois (Urbana-Champaign)', 'Urbana-Champaign, Illinois', '2019-03-28', 'https://illinois.edu/');

INSERT INTO project (name, description, status, university_id)
VALUES
('Fake project 1', 'This is a complicated project involving deep learning, NoSQL, and other buzzwords that will certainly attract developers who call themselves "ninjas."', 'New', (SELECT id FROM university WHERE name = 'University of Illinois (Urbana-Champaign)')),
('Fake project 2', 'This is a regular project involving, NoSQL, and technologies that will probably just work properly.', 'New', (SELECT id FROM university WHERE name = 'University of Illinois (Urbana-Champaign)')),
('Woof n Meow', 'A project that exposes all sorts of sounds that pets make.', 'New', (SELECT id FROM university WHERE name = 'University of Illinois (Urbana-Champaign)')),
('Vet Tracker', 'Track your pets health.', 'New', (SELECT id FROM university WHERE name = 'University of Illinois (Urbana-Champaign)'));

INSERT INTO project_tags (project_id, tag) VALUES
((SELECT id FROM project WHERE name = 'Fake project 1'), 'AI'),
((SELECT id FROM project WHERE name = 'Fake project 1'), 'NoSQL'),
((SELECT id FROM project WHERE name = 'Fake project 1'), 'Web scale'),
((SELECT id FROM project WHERE name = 'Fake project 2'), 'Java'),
((SELECT id FROM project WHERE name = 'Fake project 2'), 'MySQL'),
((SELECT id FROM project WHERE name = 'Fake project 2'), 'Apache'),
((SELECT id FROM project WHERE name = 'Woof n Meow'), 'Dogs'),
((SELECT id FROM project WHERE name = 'Woof n Meow'), 'Cats'),
((SELECT id FROM project WHERE name = 'Woof n Meow'), 'Animals'),
((SELECT id FROM project WHERE name = 'Vet Tracker'), 'Animals');

INSERT INTO account (username, password, name, position, university_id) VALUES ('john', '1234', 'John Doe', 'Student', (SELECT id FROM university WHERE name = 'University of Illinois (Urbana-Champaign)'));
INSERT INTO preference (ranking, account_id, project_id)
VALUES
(1, (SELECT id FROM account WHERE username = 'john'), (SELECT id FROM project WHERE name = 'Fake project 1')),
(2, (SELECT id FROM account WHERE username = 'john'), (SELECT id FROM project WHERE name = 'Fake project 2')),
(3, (SELECT id FROM account WHERE username = 'john'), (SELECT id FROM project WHERE name = 'Woof n Meow'));
