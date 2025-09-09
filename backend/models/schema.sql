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

-- LESSON TABLE
CREATE TABLE LMS.lesson (
    lesson_id        INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lesson_title     VARCHAR(50) NOT NULL,
    lesson_desc      VARCHAR(100),
    lesson_obj       VARCHAR(100),
    lesson_reading_list VARCHAR(255),
    lesson_effort_per_week INTEGER,
    lesson_date_created DATE NOT NULL,
    lesson_date_updated DATE NOT NULL,
    lesson_status    lesson_status,
    lesson_credit    NUMERIC(3,0),
    lesson_designer  INTEGER,
    lesson_prereq    VARCHAR(255),
    lesson_assignment VARCHAR(255),
    CONSTRAINT inst_lesson_fkey FOREIGN KEY (lesson_designer)
        REFERENCES LMS.instructor (inst_user_id)
        ON DELETE SET NULL
);

-- COURSE_LESSON TABLE (Bridge table for Many-to-Many)
CREATE TABLE LMS.course_lesson (
    cl_id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cl_course_code CHAR(10) NOT NULL,
    cl_lesson_id   INTEGER NOT NULL,
    CONSTRAINT course_cl_fkey FOREIGN KEY (cl_course_code)
        REFERENCES LMS.course (course_code),
    CONSTRAINT lesson_cl_fkey FOREIGN KEY (cl_lesson_id)
        REFERENCES LMS.lesson (lesson_id),
    CONSTRAINT course_lesson_n_key UNIQUE (cl_course_code, cl_lesson_id)
);
