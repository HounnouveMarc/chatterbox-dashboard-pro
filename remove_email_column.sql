-- Suppression de la colonne email de la table login
ALTER TABLE public.login DROP COLUMN IF EXISTS email; 