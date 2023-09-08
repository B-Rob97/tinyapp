# TinyApp Project

TinyApp is a web application built with Express.js and EJS templating, designed for shortening long URLs. It offers a user-friendly interface for creating short links from lengthy URLs. This README provides a brief overview of the key features and how to get started.

## Final Product

!["Home Page"](https://github.com/B-Rob97/tinyapp/blob/5575e410cb6de23f21d06bfa878bee116a83deb9/docs/home-page.png?raw=true)
!["Register Page"](https://github.com/B-Rob97/tinyapp/blob/5575e410cb6de23f21d06bfa878bee116a83deb9/docs/register-page.png?raw=true)
!["Login Page"](https://github.com/B-Rob97/tinyapp/blob/5575e410cb6de23f21d06bfa878bee116a83deb9/docs/login-page.png?raw=true)
!["Edit Page"](https://github.com/B-Rob97/tinyapp/blob/5575e410cb6de23f21d06bfa878bee116a83deb9/docs/edit-page.png?raw=true)

## Key Features

- **URL Shortening**: Quickly convert long URLs into concise 6-character alphanumeric IDs.
- **User Accounts**: Users can register and create their accounts, ensuring their shortened URLs are kept private.
- **Password Security**: User account passwords are hashed for added security.
- **Encrypted Cookies**: All cookies used within the application are encrypted to enhance privacy.

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## To use TinyApp:

1. Clone this repository to your local machine.


2. Install the necessary dependencies.
  * Install all dependencies using the `npm install` command from within the tinyapp root directory.


3. Start the application locally from your terminal by using `npm start` from within the tinyapp root directory.


4. Open `http://localhost:8080/` in your browser.
  * You can change the specific port you want to use in the express_server.js file.


5. Register and log in to create and manage your shortened URLs.