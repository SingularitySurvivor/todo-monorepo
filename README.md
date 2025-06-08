# TodoFlow

TodoFlow is a collaborative todo list application built with modern web technologies. This monorepo contains all components of the TodoFlow platform:

- `packages/api`: Express.js backend API with MongoDB
- `packages/web`: React frontend with Material UI
- `packages/tests`: Jest-based functional tests

## Prerequisites

- Node.js v18+
- MongoDB
- npm v9+

## Setup

1. Clone the repository:
   ```
   git clone <your-repo-url>
   cd todo-monorepo
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the `packages/api` directory based on `.env.example`
   - Create a `.env` file in the `packages/web` directory based on `.env.example`
   - Create a `.env` file in the `packages/tests` directory based on `.env.example`

## Development

Start the development servers:

```
npm run dev
```

This will start both the API and web frontend in development mode.

## Commands

- `npm run start` - Start both API and web frontend in production mode
- `npm run dev` - Start both API and web frontend in development mode
- `npm run build` - Build all packages
- `npm run test` - Run tests for all packages
- `npm run lint` - Run linting for all packages
- `npm run type-check` - Run TypeScript type checking for API

## Project Structure

```
todo-monorepo/
├── packages/
│   ├── api/             # Express backend with MongoDB
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── web/             # React frontend with Material UI
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── tests/           # Jest functional tests
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
├── .github/
│   └── workflows/       # CI/CD with GitHub Actions
├── package.json
├── tsconfig.json
└── README.md
```

## API Documentation

The API documentation is available via Swagger UI when the server is running:

- **Development**: [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **Todo Lists**: Create and manage multiple todo lists
- **Collaborative Todos**: Share lists with other users
- **Real-time Updates**: Server-sent events for live collaboration
- **RESTful API**: Full CRUD operations for todos and lists
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Testing**: Comprehensive test suite with Jest
- **CI/CD**: GitHub Actions for automated testing