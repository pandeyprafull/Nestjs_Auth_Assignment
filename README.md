# NestJS User & Document Management Backend

A comprehensive NestJS backend application for user authentication and document management with ingestion capabilities.

## Features

### Authentication & Authorization
- User registration and login
- JWT-based authentication
- Role-based access control (Admin, Editor, Viewer)
- Secure password hashing with bcrypt

### User Management
- User CRUD operations (Admin only)
- User role management
- Profile management

### Document Management
- Document upload with file validation
- Document CRUD operations
- Document status tracking
- Role-based document access

### Ingestion System
- Document ingestion job management
- Real-time ingestion status tracking
- Progress monitoring
- Error handling and recovery

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT + Passport
- **File Upload**: Multer
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Language**: TypeScript

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd nestjs-user-document-management
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your database configuration
```

4. **Set up PostgreSQL database**
```bash
# Create database
createdb user_document_db

# Or using psql
psql -U postgres
CREATE DATABASE user_document_db;
```

5. **Run the application**
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, visit:
- **Swagger UI**: http://localhost:3000/api
- **API Base URL**: http://localhost:3000

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user

### User Management (Admin only)
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Document Management
- `POST /documents/upload` - Upload document (Admin/Editor)
- `GET /documents` - Get documents
- `GET /documents/:id` - Get document by ID
- `PATCH /documents/:id` - Update document (Admin/Editor)
- `DELETE /documents/:id` - Delete document (Admin/Editor)

### Ingestion Management
- `POST /ingestion/trigger` - Trigger document ingestion (Admin/Editor)
- `GET /ingestion` - Get all ingestion jobs (Admin/Editor)
- `GET /ingestion/:id` - Get ingestion job by ID (Admin/Editor)
- `GET /ingestion/document/:documentId` - Get jobs by document (Admin/Editor)
- `PATCH /ingestion/:id/cancel` - Cancel ingestion job (Admin/Editor)

## User Roles

### Admin
- Full access to all endpoints
- User management capabilities
- Can view and manage all documents
- Can trigger and manage ingestion jobs

### Editor
- Can upload, update, and delete documents
- Can trigger and manage ingestion jobs
- Can view own documents

### Viewer
- Read-only access to own documents
- Cannot upload or modify documents
- Cannot trigger ingestion jobs

## File Upload

- **Maximum file size**: 10MB
- **Supported formats**: JPG, JPEG, PNG, GIF, PDF, DOC, DOCX, TXT
- **Storage**: Local filesystem (./uploads directory)

## Database Schema

### Users Table
- ID (UUID, Primary Key)
- Email (Unique)
- First Name
- Last Name
- Password (Hashed)
- Role (Admin/Editor/Viewer)
- Active Status
- Timestamps

### Documents Table
- ID (UUID, Primary Key)
- Filename
- Original Name
- MIME Type
- File Size
- File Path
- Status (Pending/Processing/Completed/Failed)
- Description
- Uploaded By (User ID)
- Timestamps

### Ingestion Jobs Table
- ID (UUID, Primary Key)
- Document ID
- Status (Pending/Running/Completed/Failed)
- Progress (0-100)
- Error Message
- Metadata (JSON)
- Timestamps

## Development

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Code Quality
```bash
# Linting
npm run lint

# Formatting
npm run format
```

## Deployment

### Docker Support
Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main"]
```

### Environment Variables for Production
```env
NODE_ENV=production
DB_HOST=your-production-db-host
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
JWT_SECRET=your-production-jwt-secret
```

## Security Considerations

1. **Password Security**: Passwords are hashed using bcrypt
2. **JWT Security**: Use strong JWT secrets in production
3. **File Upload Security**: File type and size validation implemented
4. **SQL Injection**: Protected by TypeORM parameterized queries
5. **Role-based Access**: Strict role checking on all endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.