-- USER TABLE
CREATE TABLE LMS.user (
    user_id        INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_fname     VARCHAR(25),
    user_lname     VARCHAR(25),
    user_email     VARCHAR(50) UNIQUE NOT NULL,
    user_password  VARCHAR(100) NOT NULL,
    user_role      user_role NOT NULL
);

