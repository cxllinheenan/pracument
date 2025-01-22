# Next.js Boilerplate 

## Table of Contents

- [Next.js Boilerplate](#nextjs-boilerplate)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Technologies](#technologies)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Environment Variables](#environment-variables)
    - [Database Setup](#database-setup)
  - [Scripts](#scripts)
  - [Project Structure](#project-structure)
  - [Roadmap](#roadmap)
  - [Contributing](#contributing)
  - [License](#license)

## Features
Key features of this Next.js Boilerplate include:
- Server-side rendering with dynamic routing
- Authentication using NextAuth.js and Prisma
- Database management powered by PostgreSQL
- Fully integrated Tailwind CSS for styling
- Radix UI components for accessible, high-quality UI
- Lucide customizable icons
- Prisma ORM for query generation and migrations

## Technologies

- **[Next.js](https://nextjs.org)**: React framework for building server-rendered applications.
- **[Prisma](https://www.prisma.io)**: Next-generation ORM for Node.js and TypeScript.
- **[NextAuth.js](https://next-auth.js.org)**: Authentication solution for Next.js applications.
- **[Tailwind CSS](https://tailwindcss.com)**: Utility-first CSS framework for styling.
- **[Radix UI](https://www.radix-ui.com)**: Primitives for building high-quality, accessible UI components.
- **[Lucide](https://lucide.dev)**: Beautiful, customizable open-source icons.
- **[PostgreSQL](https://www.postgresql.org)**: Powerful, open-source object-relational database system.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **[Node.js](https://nodejs.org/en/download/)** (v14 or later)
- **[npm](https://www.npmjs.com/get-npm)** or **[Yarn](https://yarnpkg.com/getting-started/install)**
- **[PostgreSQL](https://www.postgresql.org/download/)**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/pracument.git
   cd pracument
   ```

2. **Install dependencies**

   Using npm:

   ```bash
   npm install
   ```

   Or using Yarn:

   ```bash
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory and add the following:

   ```env
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secret_key
   ```

   Replace `USER`, `PASSWORD`, `HOST`, `PORT`, and `DATABASE` with your PostgreSQL credentials. Generate a secure `NEXTAUTH_SECRET` using the following command:

   ```bash
   openssl rand -base64 32
   ```

4. **Run Prisma migrations**

   ```bash
   npx prisma migrate dev --name init
   ```

5. **Start the development server**

   Using npm:

   ```bash
   npm run dev
   ```

   Or using Yarn:

   ```bash
   yarn dev
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable        | Description                                                        |
| --------------- | ------------------------------------------------------------------ |
| `DATABASE_URL`  | Connection string for your PostgreSQL database.                    |
| `NEXTAUTH_URL`  | URL of your Next.js application (e.g., `http://localhost:3000`).   |
| `NEXTAUTH_SECRET` | A secret key for encrypting NextAuth.js tokens.                   |

### Database Setup

Pracument uses Prisma as the ORM with PostgreSQL as the database. Ensure your PostgreSQL server is running and accessible with the credentials provided in the `.env` file.

To reset the database and apply migrations:

```bash
npx prisma migrate reset
```

## Scripts

| Command       | Description                                |
| ------------- | ------------------------------------------ |
| `npm run dev` | Starts the development server.            |
| `npm run build` | Builds the application for production.     |
| `npm run start` | Starts the production server.              |
| `npm run lint` | Runs ESLint for code linting.              |

## Project Structure

```plaintext
├── src
│   ├── app
│   │   ├── admin
│   │   │   └── page.tsx
│   │   ├── api
│   │   │   └── auth
│   │   │       ├── [...nextauth]
│   │   │       │   └── route.ts
│   │   │       └── signup
│   │   │           └── route.ts
│   │   ├── auth
│   │   │   ├── signin
│   │   │   │   └── page.tsx
│   │   │   └── signup
│   │   │       └── page.tsx
│   │   ├── components
│   │   │   ├── auth
│   │   │   │   ├── signin-button.tsx
│   │   │   │   └── signout-button.tsx
│   │   │   └── ui
│   │   │       ├── button.tsx
│   │   │       ├── drawer.tsx
│   │   │       ├── input.tsx
│   │   │       ├── sheet.tsx
│   │   │       └── tooltip.tsx
│   │   ├── lib
│   │   │   ├── actions.ts
│   │   │   ├── prisma.ts
│   │   │   └── utils.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components
│   ├── hooks
│   ├── styles
│   └── ...
├── prisma
│   └── schema.prisma
├── public
│   └── dashboard-preview.png
├── .gitignore
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Roadmap

For a detailed roadmap outlining new features, enhancements, and production deployment considerations, see [docs/roadmap.md](docs/roadmap.md).

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**

2. **Create a new branch**

   ```bash
   git checkout -b feature/YourFeature
   ```

3. **Commit your changes**

   ```bash
   git commit -m "Add some feature"
   ```

4. **Push to the branch**

   ```bash
   git push origin feature/YourFeature
   ```

5. **Open a Pull Request**

Please ensure your code follows the project's code style and passes all linting checks.

## License

[MIT](LICENSE)

-
