# Mini Social Post Application

A full-featured social media application built using the MERN stack (MongoDB, Express, React, Node.js). This project allows users to share posts, interact with others through likes and comments, manage their profiles, and follow other users.
- Live Link - https://mini-social-post-application-five.vercel.app/
## Features

-   **User Authentication**: Secure Sign Up and Login with JWT authentication.
-   **Create Posts**: dynamic post creation with support for text and image uploads (powered by Cloudinary).
-   **Interactive Feed**: Real-time-like feed updates with options to like and comment on posts.
-   **Social Connections**: Follow and unfollow users to customize your feed.
-    **Followers & Post Likes Lists**: View lists of followers, following, and users who liked a post.
-   **Profile Management**: Comprehensive profile pages showing user posts, stats (followers/following), and bio editing.
-   **Responsive UI**: Modern, responsive design using Material-UI (MUI) and Lucide React icons.
-   **Emoji Support**: Integrated emoji picker for comments and posts.

## Tech Stack

### Frontend
-   **React (v19)**: Component-based UI library.
-   **Vite**: Fast build tool and development server.
-   **Material-UI (@mui/material)**: React UI framework for faster and easier web development.
-   **Lucide React**: Beautiful & consistent icons.
-   **Emoji Picker React**: Emoji picker solution.
-   **Axios**: Promise based HTTP client for the browser.
-   **React Router DOM**: Client-side routing.

### Backend
-   **Node.js**: JavaScript runtime environment.
-   **Express.js (v5)**: Fast, unopinionated, minimalist web framework for Node.js.
-   **MongoDB & Mongoose**: NoSQL database and object modeling.
-   **JWT (JSON Web Token)**: For securely transmitting information between parties as a JSON object.
-   **Cloudinary**: Cloud-based image and video management services.
-   **Multer**: Middleware for handling `multipart/form-data` (file uploads).
-   **BcryptJS**: Library to help hash passwords.

## Getting Started

### Prerequisites
-   Node.js (v14 or higher recommended)
-   MongoDB (Local or Atlas)
-   Cloudinary Account (for image uploads)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/sonukumarsaw12/Mini-Social-Post-Application.git
    cd Mini-Social-Post-Application
    ```

2.  **Backend Setup**
    Navigate to the `backend` directory and install dependencies:
    ```bash
    cd backend
    npm install
    ```

    Create a `.env` file in the `backend` directory with the following variables:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_secret_jwt_key
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    ```

    Start the backend server:
    ```bash
    npm run dev
    ```

3.  **Frontend Setup**
    Navigate to the `frontend` directory and install dependencies:
    ```bash
    cd ../frontend
    npm install
    ```

    Start the frontend development server:
    ```bash
    npm run dev
    ```

## Usage

-   Open your browser and navigate to the frontend URL (usually `http://localhost:5173`).
-   Sign up for a new account or log in.
-   Start posting, following users, and interacting with the community!

## Contributing

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
