# Interview Preparation Platform

MERN app for student interview practice, instructor-authored question sets, and instructor feedback.

## Project structure

Interview Preparation Platform:

1. Admin setup

-Admin account created via seed script (npm run seed).

-Admin logs in and approves pending instructor accounts.

2. Instructor workflow

-Instructor registers and awaits admin approval.

-Once approved, instructor creates a question set (MCQs or descriptive).

-Instructor submits the set for admin approval.

-Approved sets become visible to students.

3. Student workflow

-Student registers and logs in immediately.

-Student browses available approved question sets.

-Student attempts questions and submits answers.

4. Instructor feedback

-Instructor reviews student submissions.

-Instructor provides written feedback and marks answers.

-Students can view feedback in their dashboard.

5. Admin management

-Admin can approve/reject new question sets.

-Admin manages user access (approve/reject instructors, deactivate accounts).