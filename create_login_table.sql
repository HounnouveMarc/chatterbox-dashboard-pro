-- Création de la table login
CREATE TABLE IF NOT EXISTS public.login
(
    id serial NOT NULL,
    phone character varying(50) NOT NULL,
    password text NOT NULL,
    company_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT login_pkey PRIMARY KEY (id),
    CONSTRAINT login_phone_key UNIQUE (phone),
    CONSTRAINT login_company_id_fkey FOREIGN KEY (company_id)
        REFERENCES public.companies (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
); 