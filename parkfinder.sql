\echo 'Delete and recreate parkfinder db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE parkfinder;
CREATE DATABASE parkfinder;
\connect parkfinder

\i backend/parkfinder-schema.sql
\i backend/parkfinder-seed.sql

\echo 'Delete and recreate parkfinder_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE parkfinder_test;
CREATE DATABASE parkfinder_test;
\connect parkfinder_test

\i backend/parkfinder-schema.sql