<img width="1919" height="908" alt="image" src="https://github.com/user-attachments/assets/e3873e9c-8b0d-4318-a1d2-fea1aebaca37" />


# Telegram API Backend

A scalable RESTful API built with Node.js, Express, and MongoDB for Telegram-related services. The project follows a clean and maintainable architecture with authentication, database integration, and modern backend development practices.

## Features

* RESTful API architecture
* Express.js server
* MongoDB database integration
* JWT Authentication
* Environment variable support with dotenv
* Error handling middleware
* Modular folder structure
* Scalable and maintainable codebase

## Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* dotenv

## Installation

Clone the repository:

```bash
git clone https://github.com/NINJA86/telegram.git
```

Navigate to the project directory:

```bash
cd telegram
```

Install dependencies:

```bash
npm install
```

Create a `.env` file and configure the required environment variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your...
REFRESH_TOKEN_SECRET=your...
```

Start the development server:

```bash
npm run dev
```

## Project Structure

```text
telegram/
│
├── controllers/
├── models/
├── routes/
├── middleware/
├── utils/
├── config/
├── app.js
├── server.js
└── package.json
```

## API Endpoints

Example endpoints:

```http
POST   /api/users/register
POST   /api/users/login
POST   /api/rooms
GET POST   /api/namespaces
```

## Security

* Password hashing
* JWT-based authentication
* Environment variable protection
* Centralized error handling

## Future Improvements

* Role-based authorization
* Refresh tokens
* Email verification
* Rate limiting
* API documentation with Swagger

## License

This project is licensed under the MIT License.

## Author

Mohammad Babaee

GitHub: https://github.com/NINJA86
