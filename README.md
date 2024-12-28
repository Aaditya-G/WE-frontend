# White Elephant Online Game - Frontend

This repository contains the frontend for the White Elephant Online Demo Game, built using Vite, Tailwind CSS, and React with TypeScript.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
  - [Development Setup](#development-setup)
  - [Production Setup](#production-setup)
- [Environment Variables](#environment-variables)
- [Project Scripts](#project-scripts)
- [Tech Stack](#tech-stack)

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 16.x or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Setup Instructions

### Development Setup

To run the app in development mode:

1. Clone the repository:
   ```bash
   git clone <frontend-repo-url>
   cd <frontend-repo-folder>
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Configure environment variables:
   - Copy the `.env.sample` file to `.env`:
     ```bash
     cp .env.sample .env
     ```
   - Edit the `.env` file with the required values (refer to `.env.sample` for details).

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open the app in your browser at [http://localhost:3000](http://localhost:3000).

### Production Setup

To build and serve the app for production:

1. Clone the repository and navigate to the folder:
   ```bash
   git clone <frontend-repo-url>
   cd <frontend-repo-folder>
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Configure environment variables:
   - Copy the `.env.sample` file to `.env`:
     ```bash
     cp .env.sample .env
     ```
   - Edit the `.env` file with the required values.

4. Build the project:
   ```bash
   npm run build
   # or
   yarn build
   ```

5. Serve the built files using a static file server, such as `vite preview` or any web server:
   ```bash
   npm run preview
   # or
   yarn preview
   ```

   The app will be available at [http://localhost:4173](http://localhost:4173).

## Environment Variables

The app uses environment variables defined in the `.env` file. Refer to the `.env.sample` file for the required variables and their descriptions.

## Project Scripts

Here are the commonly used scripts:

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the app for production.
- `npm run preview`: Serves the production build locally for testing.

## Tech Stack

- **Framework**: [Vite](https://vitejs.dev/)
- **CSS**: [Tailwind CSS](https://tailwindcss.com/)
- **JavaScript Library**: [React](https://reactjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

