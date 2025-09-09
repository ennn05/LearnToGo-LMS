-- USER TABLE
CREATE TABLE LMS.user (
    user_id        INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_fname     VARCHAR(25),
    user_lname     VARCHAR(25),
    user_email     VARCHAR(50) UNIQUE NOT NULL,
    user_password  VARCHAR(100) NOT NULL,
    user_role      user_role NOT NULL
);

-- INSTRUCTOR TABLE
CREATE TABLE LMS.instructor (
    inst_user_id   INTEGER PRIMARY KEY,
    CONSTRAINT user_inst_fkey FOREIGN KEY (inst_user_id)
        REFERENCES LMS.user (user_id)
);

-- STUDENT TABLE
CREATE TABLE LMS.student (
    stu_user_id   INTEGER PRIMARY KEY,
    stu_dob       DATE,
    stu_grade     NUMERIC(5,2),
    CONSTRAINT user_stu_fkey FOREIGN KEY (stu_user_id)
        REFERENCES LMS.user (user_id)
);

-- COURSE TABLE
CREATE TABLE LMS.course (
    course_code        CHAR(10) PRIMARY KEY,
    course_title       VARCHAR(50) NOT NULL,
    course_date_created DATE NOT NULL,
    course_date_updated DATE NOT NULL,
    course_creator     INTEGER NOT NULL,
    course_status      lesson_status NOT NULL,
    course_total_credit NUMERIC(5,0) NOT NULL DEFAULT 0,
    CONSTRAINT inst_course_fkey FOREIGN KEY (course_creator)
        REFERENCES LMS.instructor (inst_user_id)
);