To run the project locally:

1. Run the Docker image for the backend API (make sure it is accessible at http://localhost:8000).

2. In the root folder of this project, install dependencies:
npm install

3.Create a .env file in the root directory (next to package.json) with the following content:
REACT_APP_API_USERS=http://localhost:8000/api/v1/users
REACT_APP_API_MOVIES=http://localhost:8000/api/v1/movies

4. Start the application at the root directory:
npm start

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Changes & Improvements:

-Registration page moved to a separate route and displayed in Header for better structure.

-Movie Details Button: Clicking "Show Details" now displays information closer to the movie item instead of scrolling to the bottom of the page.

-.txt File Upload: Users can now upload a .txt file containing movie data using DnD.

-Pagination: Replaced lazy load with pagination.

-Required 'Title' Field: The "Add Movie" form now validates that the title is not empty or only spaces.

-Year Validation: Added a message to the "Year" field if the input is outside the acceptable range (e.g., 1900–2025).

-Form Validation Feedback: If the user enters invalid data, validation messages appear and movie creation is blocked until corrected.

Empty Search Feedback: If no search results are found, a message like "Oops, no movies found with that title" is shown.

-Duplicate Title Check: If a movie with the same title already exists, the user is notified.

-Search by Actor: Fixed the search functionality to correctly return results by actor name

-Actor Field Validation: Limited input to letters and allowed special characters like - and . (e.g., Anna-Lee Jr.).

-Delete Confirmation Modal: Added user confirmation before deleting a movie.

-Success Messages: Now displaying confirmation after a movie is successfully added or imported