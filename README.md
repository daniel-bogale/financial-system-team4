# Financial System Team 4

Welcome to the Financial System Team 4 project! This document will help you get started with development, set up your environment, and contribute effectively.

## Table of Contents

- [Getting Started](#getting-started)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Development Workflow](#development-workflow)
- [Code Style & Linting](#code-style--linting)
- [Contributing](#contributing)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

---

## Getting Started

This project is built with [Next.js](https://nextjs.org/) and uses TypeScript. Make sure you have [Node.js](https://nodejs.org/) (v18 or above) and [Yarn](https://yarnpkg.com/) installed.

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd financial-system-team4
   ```
2. **Install dependencies:**
   ```bash
   yarn install
   ```

## Environment Variables

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env.local
   ```
2. **Update `.env.local`** with the correct values for your environment (API keys, database URLs, etc.).

## Running the App

- **Development mode:**
  ```bash
  yarn dev
  ```
- **Production build:**
  ```bash
  yarn build
  yarn start
  ```

## Development Workflow

- **Branching:**
  - Always check out from the `main` branch:
    ```bash
    git checkout main
    git pull
    git checkout -b feature/your-feature
    ```
- **Commits:**
  - Write clear, concise commit messages.
- **Pushing Changes:**
  - Push your branch to the remote repository:
    ```bash
    git push origin feature/your-feature
    ```
- **Pull Requests:**
  - Open a PR to `main` when your work is ready for review.
  - Ensure your code passes linting and tests before submitting.

## Code Style & Linting

- Run lint checks before pushing:
  ```bash
  yarn lint
  ```
- Format code with:
  ```bash
  yarn format
  ```
- Follow the existing code style and folder structure.

## Contributing

1. Check out a new branch from `main` for your feature or bugfix (no need to fork).
2. Make your changes and commit them.
3. Push your branch to the remote repository.
4. Open a Pull Request to `main`.
5. Add a clear description of your changes.
6. Request a review from a team member.

## Project Structure

- `app/` - Main Next.js app directory (pages, layouts, routes)
- `components/` - Reusable UI and layout components
- `hooks/` - Custom React hooks
- `lib/` - Utility functions and libraries
- `public/` - Static assets
- `messages/` - Localization files

## Troubleshooting

- If you encounter issues:
  - Check your Node.js and Yarn versions.
  - Ensure your `.env.local` is set up correctly.
  - Run `yarn install` to update dependencies.
  - Check the [Next.js documentation](https://nextjs.org/docs) for more help.

---

Happy coding! If you have questions, reach out to the team via the project communication channels.
