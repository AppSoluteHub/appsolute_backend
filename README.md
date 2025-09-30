# AppSolute

AppSolute is a comprehensive backend solution for a multi-featured application. It includes services for authentication, content management, software ,gadget sales, and more. This README provides an overview of the project, its features, and instructions for setting it up and running it locally.

## Features

*   **Authentication:** User registration, login, and social authentication with Google.
*   **Content Management:** Create, read, update, and delete blogs, posts, and comments.
*   **E-commerce:** Manage products, carts, and orders.
*   **Payment Processing:** Integration with a payment gateway.
*   **User Engagement:** Leaderboards, likes, and reviews.
*   **Task Management:** Create and manage tasks for users.
*   **File Uploads:** Support for uploading images and other files to Cloudinary.
*   **Real-time Communication:** Real-time features using Socket.io.

## Technologies Used

*   **Backend:** Node.js, Express.js, TypeScript
*   **Database:** PostgreSQL (with Prisma as ORM)
*   **Authentication:** Passport.js (with Google OAuth2)
*   **File Storage:** Cloudinary
*   **Real-time:** Socket.io
*   **Caching:** Redis
*   **Validation:** Joi, Zod
*   **API Documentation:** Swagger

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v18 or higher)
*   npm
*   PostgreSQL
*   Redis

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/ASRandD/AppSolute_api.git
    cd appsolute
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env` file in the root directory and add the following environment variables. You can refer to `.env.example` for a template.

    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/mydatabase"
    REDIS_URL="redis://localhost:6379"
    CLOUDINARY_CLOUD_NAME="your-cloud-name"
    CLOUDINARY_API_KEY="your-api-key"
    CLOUDINARY_API_SECRET="your-api-secret"
    GOOGLE_CLIENT_ID="your-google-client-id"
    GOOGLE_CLIENT_SECRET="your-google-client-secret"
    JWT_SECRET="your-jwt-secret"
    ```

4.  **Run database migrations:**

    ```bash
    npx prisma migrate dev
    ```

### Running the Application

*   **Development mode:**

    ```bash
    npm run dev
    ```

    This will start the server with Nodemon, which will automatically restart the server on file changes.

*   **Production mode:**

    ```bash
    npm run build
    npm start
    ```

## API Documentation

The API is documented using Swagger. Once the server is running, you can access the Swagger UI , you can test on postman  .

## Project Structure

The project is structured into the following directories:

```
.
├── prisma/         # Prisma schema and migrations
├── src/
│   ├── config/     # Configuration files for database, cloudinary, etc.
│   ├── features/   # Feature-based modules
│   ├── interfaces/ # TypeScript interfaces
│   ├── lib/        # Core libraries and utilities
│   ├── middlewares/ # Express middlewares
│   ├── swagger/    # Swagger documentation setup
│   ├── utils/      # Utility functions
│   └── validators/ # Request validation schemas
├── .gitignore
├── package.json
├── README.md
└── tsconfig.json
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

## License

This project is licensed under the ISC License.
