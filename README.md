# cs304-jobtracker

JOBREACKER

OVERVIEW
This project aims to streamline the job search process through collecting user input on job application information and organizing them in a way that is efficient, clear, and easily manageable. We will provide a centralized, structured, and intuitive solution for job seekers to efficiently track their applications, stay organized with deadlines, and gain insights from shared experiences. Additionally, we want to create a community for job seekers and improve the transparency in the job application process. 
There are four main pages for our site: 1. Sign-up/Login Page; 2. User Profile Page; 3.Job Tracker Page; 4. Company Review Page.

AUTHORS
Sabrina Lu, Isabella Zhu, Emily He

STATUS
Beta

DIRECTIONS OF USE
Sign-up/Login Page
1. Login 
    - Checks for username and password credentials. If matches, login to profile page; otherwise, flash the user for specific errors (e.g. username and password mismatch, incorrect password format, username does not exist).
2. Signup
    - Helps the user create an account. The user needs to enter different fields, with some required and some optional as hinted on the page. The user also needs to choose a username that is not taken as well as a password that satisfies the password rules on the page (otherwise, the page will flash the user for specific errors). If the user enters these fields, the site creates an account for the user and takes the user to the profile page.

User Profile Page
1. Display User Profile
    - The page displays user profile that the user has entered. The optional fields that the user didn't fill out are left empty.
2. Update Profile
    - By clicking the update profile button, the site takes the user to a update profile page, where the user could edit every field on his profile except username and password. 
    - By clicking the update button, the site updates the user's profile and takes the user to the main profile page with the udpated information.
    - By clicking the cancel button, the site does not update the user's profile and takes the user back to the main profile page.
3. Logout
    - Below every page, there is a logout button that logs the user out and takes the user back to the login page.

Job Tracker Page
1. Display All Application
    - Display a list of applications added by the current logged-in user only.
    - Each application card shows job title, company, status, location, date applied, deadline, and an automatic generated unique ID.
    - Each application provides Edit and Delete buttons for user action. The Edit button would bring user to the edit page that loads that detail of that selected application. The user can edit all fields and make update to the application. The application ID is only displayed in the form and cannot be changed. All fields are required to be filled before submission. On successful update, the user is redirected to the tracker page with a confirmation message. The delete button simply delete the application from the list.
2. Search and Sort
    - A search bar allows users to filter applications by job title or company.
    - A dropdown menu allows users to sort results by date applied: "Oldest First" or "Newest First".
    - The default display order is oldest date applied first. 
    - A “Show All” button resets the filter and displays the full list of that user’s applications. The sorting order remains when clicking the "Show All" button. However would return back to default order if add,edit or delete action has been made. 
3. Deadline Reminder
    - At the top of the page, a reminder box lists upcoming deadlines within the next 3 days (inclusive of today so total four days). Past deadline and dealine after three days will not show in the reminder.
    - Only the user’s own applications are shown in the reminder list.
4. Button and Message
    - A "+ Add New Application" button redirect to the Add New Application page. The Add New Application page requires user to fill all fields including the status dropdown menu to submit the form. A message showed up and does not allow submission if a required field is empty. On success, a confirmation flash message is shown, and the user is redirected to the tracker page.
    - Messages are displayed after user actions for example "Application updated successfully! " displayed after successfully updating the application. Similar message displayed after adding,updating and deleting applications. 

Company Review Page
1. User Reviews
   - Users can submit reviews of their experiences with companies and specific roles
   - Specifically, users can enter their company, job title, salary as information
   - Users can rate their company from 1 to 5 on overall view, culture, work life balance, compensation, and career growth.
   - Users can also type in a review paragraph/text to express their opinion about the company.
   - Users can submit their after they completed all the fields.
2. Search Reviews
   - Users can search reviews by company name to view reviews for the specific company they searched for.
