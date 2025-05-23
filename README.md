# MindBowser-Assignment-Front-End

This is the **React-based front-end** of the Blog App developed as part of the MindBowser assignment. The app allows users to read, write, manage, and view blog posts with authentication.

---

## Approach

We designed a user-friendly blogging interface using **React** for modern UI, **React Router** for navigation, and **Axios** for API interactions. The structure is divided into clear components and pages, enhancing readability and maintainability.

Each route is guarded where necessary (e.g., for authenticated areas), and responsive styling ensures a smooth experience across devices.

---

## Features

### UI and Navigation

- **Home Page**
  - Lists all public blog posts
  - Displays title, summary, author, and date

- **Post Detail Page**
  - Shows full blog content of the selected post

- **User Dashboard**
  - View, edit, and delete personal blog posts

- **Navigation Bar**
  - Links to:
    - Home
    - New Post
    - My Posts
    - Login / Logout

---

## AI Usage

- **ChatGPT** was used for:
  - Generating boilerplate code
  - Designing component structure
  - Debugging state and routing logic
  - Writing reusable Axios logic for API integration

- **GitHub Copilot** was used for:
  - Autocompleting form and hook logic
  - Generating UI structure for components

---

## Setup Instructions

### 1. Clone the repository

git clone https://github.com/AdityaAbhayYadav/MindBowser-Assignment-Front-End.git
cd MindBowser-Assignment-Front-End

### 2. Install dependencies
npm install

### 3.Start the App
npm start
( This will launch the app at http://localhost:3000.)

### 4.Configure .env

-> Create a .env file in the root folder and add your backend API URL:
  REACT_APP_API_URL=http://localhost:5000/api

