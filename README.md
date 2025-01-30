# Pracument - AI-Powered Legal Practice Management Platform

An open-source, modern legal document and case management system built with Next.js 15, featuring AI-powered document analysis, secure client management, and collaborative case tracking.

## Features

- 📄 **Intelligent Document Management**
  - AI-powered document analysis and text extraction
  - Secure document storage with Cloudflare R2
  - Advanced search across document contents
  - Hierarchical folder organization

- 👥 **Client & Case Management**
  - Comprehensive client profiles
  - Case tracking with status updates
  - Document-to-case associations
  - Task management and deadlines

- 🤖 **AI Integration**
  - Document content analysis with Deepseek R1
  - Context-aware legal research assistant
  - Automated text extraction from PDFs and DOCX
  - Real-time AI chat interface

- 🔒 **Enterprise-Grade Security**
  - Role-based access control
  - Secure document storage
  - Audit trails and activity logging
  - Auth.js authentication

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) with App Router
- **Database**: [PostgreSQL](https://www.postgresql.org) with [Prisma ORM](https://www.prisma.io)
- **Authentication**: [NextAuth.js](https://next-auth.js.org)
- **Storage**: [Cloudflare R2](https://www.cloudflare.com/products/r2)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://www.radix-ui.com)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **AI Integration**: 
  - Vercel AI SDK
  - Deepseek R1 model
  - LangChain for document processing
- **Document Processing**: PDF.js, Mammoth

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- PostgreSQL 12 or later
- Cloudflare R2 account (for document storage)
- Deepseek API key (for AI features)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pracument.git
   cd pracument
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Configure the following in your `.env`:
   ```env
   DATABASE_URL="postgresql://..."
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   
   # Cloudflare R2
   R2_ACCESS_KEY="your-access-key"
   R2_SECRET_KEY="your-secret-key"
   CLOUDFLARE_ACCOUNT_ID="your-account-id"
   
   # AI Configuration
   DEEPSEEK_API_KEY="your-api-key"
   ```

4. Initialize the database:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to see your application.

## Project Structure

src/
├── app/ # Next.js App Router pages
│ ├── admin/ # Admin dashboard routes
│ ├── api/ # API routes
│ └── auth/ # Authentication pages
├── components/ # Reusable components
│ ├── cases/ # Case management components
│ ├── clients/ # Client management components
│ └── ui/ # shadcn/ui components
├── lib/ # Utility functions and configs
└── styles/ # Global styles and Tailwind

## Development

### Scripts

| Command           | Description                   |
|-------------------|-------------------------------|
| `npm run dev`     | Start development server      |
| `npm run build`   | Build for production          |
| `npm run start`   | Start production server       |
| `npm run lint`    | Run ESLint                    |
| `npm run test`    | Run tests                     |

### Key Features Implementation

- **Document Processing**: Uses LangChain for document parsing and text extraction
- **AI Integration**: Implements Deepseek R1 for context-aware document analysis
- **Storage**: Cloudflare R2 integration for secure document storage
- **Authentication**: NextAuth.js with database adapter
- **API Routes**: RESTful endpoints for all CRUD operations
- **UI Components**: Customized shadcn/ui components for consistent design

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Code of Conduct
- Development process
- How to submit pull requests
- Coding standards

## Roadmap

See our detailed [Roadmap](docs/roadmap.md) for planned features and enhancements, including:

- Enhanced AI document analysis
- Advanced search capabilities
- Multi-tenant support
- E-signature integration
- Mobile application

## License

This project is licensed under the [MIT License](LICENSE).

