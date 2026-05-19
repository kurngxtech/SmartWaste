# SavePlate Backend Bootstrap Workflow & OS Synchronization Guide

This document provides a professional, standardized workflow for reconstructing the SavePlate environment across different operating systems (Linux, Windows). It ensures backend stability, authentication consistency, and synchronization through MongoDB Atlas.

## 1. Prerequisites

Before starting, ensure you have the correct Node.js version installed. This project uses `.nvmrc` to standardize the Node.js version across all environments.

### Setting up Node.js

#### Linux (using nvm)
```bash
# Install nvm if not already installed
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Install and use the required Node version
nvm install
nvm use
```

#### Windows (using nvm-windows)
```bash
# Download and install nvm-windows from: https://github.com/coreybutler/nvm-windows/releases
# After installation, run:
nvm install 20.12.0
nvm use 20.12.0
```

## 2. Environment Configuration

For security reasons, sensitive credentials are NOT pushed to GitHub. You must manually recreate your `.env` file based on `.env.example`.

1. Copy the example configuration to a new `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

2. Open the newly created `.env` file and populate the environment variables:
   - `PORT`: (default: 3000)
   - `MONGODB_URI`: Insert your MongoDB Atlas connection string here. Do not use local MongoDB endpoints (like `localhost` or `127.0.0.1`).
   - `JWT_SECRET`: A secure, random string used for signing access tokens.
   - `JWT_REFRESH_SECRET`: A secure, random string used for signing refresh tokens.

## 3. Installation & Bootstrap Flow

To successfully build and run the application, install dependencies for both the frontend and backend.

### Backend Setup
```bash
cd backend
npm install
npm start # or npm run dev depending on your package.json scripts
```
> Note: The backend uses `bcryptjs` for password hashing to ensure cross-OS compatibility and prevent binary compilation issues between Linux and Windows.

### Frontend Setup
Open a new terminal window:
```bash
cd .. # Go back to project root
npm install
ng serve
```

## 4. MongoDB Atlas Architecture

This project is strictly configured to connect to **MongoDB Atlas**.
- **Backend**: Uses Mongoose to connect directly to the Atlas Cluster via the `MONGODB_URI` environment variable.
- **Local MongoDB**: There is no dependency on a local MongoDB installation.
- **MongoDB Compass**: Use Compass only as a GUI viewer/editor. Connect it to the same Atlas URI to view data changes made by the application.

## 5. Cross-OS Authentication Notes

- **Password Hashing**: We migrated from `bcrypt` (which requires native C++ bindings that often fail across OS boundaries) to `bcryptjs` (a pure JavaScript implementation). This guarantees that passwords hashed on Linux can be successfully verified on Windows, and vice-versa.
- **JWT Consistency**: Both the Access Token and Refresh Token logic relies on the `JWT_SECRET` and `JWT_REFRESH_SECRET` from your local `.env`. Ensure these secrets match exactly across environments if you are sharing tokens, though usually, each local environment can have its own development secrets.

## 6. Git Workflow & Best Practices

To maintain a clean and reliable repository, adhere to the following rules:
- **Never commit `.env` or other sensitive files.** They are ignored in `.gitignore`.
- **Never commit `node_modules`.** Always run `npm install` after pulling code on a new machine.
- **Only commit standard files**: Source code (`src/`), package descriptors (`package.json`, `package-lock.json`), and configurations (`.nvmrc`, `.env.example`).
