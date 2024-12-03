# Role-Based Course Management System

## Overview

The Role-Based Course Management System is a dynamic web application that facilitates course management and operations for students, faculty, and registrars. The system allows users to interact with a role-specific interface to perform tasks such as enrolling in courses, managing grades, and scheduling course offerings.

---

## Features and Behaviors

### Initial Role Selection
Upon visiting the homepage, users are required to:
1. Enter their **ID number**.
2. Select a role from:
   - **Student**
   - **Faculty**
   - **Registrar**
   
The system redirects the user to a role-specific page based on the chosen role.

---

### **Student Role**
When a user selects the **Student** role:
1. They are redirected to a page displaying:
   - Courses in which they are **already enrolled** (from all terms).
   - Courses offered in the **upcoming term (Winter 2025)**.
2. Actions:
   - **Enroll** in available courses for Winter 2025.
   - **Drop** courses from their current schedule.
3. For enrolled courses, the page displays:
   - **Course Number**
   - **Term**
   - **Year**
   - **Instructor's Full Name**
   - **Grade** (if any)
4. For Winter 2025 offerings, the page shows:
   - **Course Number**
   - **Instructor's Full Name** (if assigned)
   - **Location**
   - **Time**
   - **Days**
   - Whether the course is **already in the student's schedule**.

#### Validations:
- Ensure the course being enrolled in is offered in Winter 2025.
- Prevent duplicate enrollments in the same course offering.

#### After Actions:
- Redisplay the page to reflect updates in the student's schedule.

---

### **Faculty Role**
When a user selects the **Faculty** role:
1. They are redirected to a page listing:
   - **Courses** they are teaching.
   - For each course:
     - **Course Number**
     - **Term**
     - **Year**
2. Actions:
   - **Select a course** to edit grades.
   - Display a list of students in the selected course.
3. For each student in the course, the page shows:
   - **Student Full Name**
   - **Student ID**
   - **Grade** (may be blank)
   - Input to **specify a new grade**.
4. After grade updates, the page reflects the changes.

---

### **Registrar Role**
When a user selects the **Registrar** role:
1. They are redirected to a page that allows them to:
   - **View offerings** for the upcoming term (Winter 2025).
   - **Add new offerings**.
   - **Edit or cancel existing offerings**.
2. For offerings, the page displays:
   - **Offering Number**
   - **Course Number**
   - **Instructor**
   - **Location**
   - **Time**
   - **Days**
3. Actions for existing offerings:
   - Edit:
     - **Instructor**
     - **Location**
     - **Time**
     - **Days**
     - Cancel the offering.
4. Adding new offerings:
   - Choose a course from a list showing:
     - **Course Number**
     - **Course Title**
     - **Credit Hours**
   - Specify details for the new offering:
     - **Offering Number**
     - **Instructor**
     - **Location**
     - **Time**
     - **Days**

#### After Actions:
- Updates to offerings (add, edit, cancel) are immediately reflected in the displayed list of Winter 2025 offerings.

---

## Completion Requirements
By the project's deadline, the following functionality must be implemented:
- Faculty must be able to **edit grades**.
- The registrar must be able to **add, edit, and cancel offerings**.

---

## Technical Details
- **Backend**: Node.js with Express
- **Frontend**: Pug templates for dynamic rendering
- **Database**: SQLite for storing and querying data
- **Routing**: Role-based routing ensures users are directed to the appropriate functionality.

---

## Installation and Setup
1. Clone the repository:
   ```bash
   git clone [repository_url]
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the server:
   ```bash
   npm start
   ```
4. Access the application at:
   ```
   http://localhost:3000
   ```

---

## Testing and Validation
- Test the following functionalities:
  - Enroll and drop courses (Student role).
  - Edit grades (Faculty role).
  - Add, edit, and cancel offerings (Registrar role).
- Ensure data integrity and proper validation for all user actions.

---

## Contributions
Feel free to contribute by submitting pull requests or reporting issues. For queries, contact the project maintainer.
