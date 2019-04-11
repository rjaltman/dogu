ALTER TABLE preference ADD CONSTRAINT project_id_account_id_key UNIQUE (account_id, project_id);
ALTER TABLE preference ADD CONSTRAINT ranking_account_id_key UNIQUE (account_id, ranking) DEFERRABLE INITIALLY DEFERRED;
