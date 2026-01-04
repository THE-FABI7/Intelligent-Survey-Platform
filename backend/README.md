# Intelligent Survey Platform - Backend

A modular, scalable NestJS backend for an intelligent survey platform MVP.

## Features

- 🔐 **JWT Authentication** with role-based access control (ADMIN, RESPONDENT)
- 👥 **User Management** with secure password hashing
- 📋 **Survey Creation** with multiple question types (TEXT, NUMBER, MULTIPLE_CHOICE, CHECKBOX, SCALE, FILE_UPLOAD)
- 🧩 **Survey Templates** to clone reusable structures and bootstrap new surveys
- 📦 **Survey Versioning** for historical accuracy and iterative improvements (initial version auto-created)
- 🔀 **Conditional Visibility** rules for questions (show/hide based on previous answers)
- 🚀 **Campaign Management** with lifecycle control (CREATED → PUBLISHED → CLOSED)
- 📝 **Response Collection** supporting both authenticated and anonymous submissions
- 📊 **Analytics Dashboard** with completion rates, average times, answer distributions, numeric stats, text keywords, and basic sentiment
- 📈 **CSV Export** for campaign responses
- 📚 **Swagger Documentation** for all API endpoints

## Tech Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT (Passport)
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI

## Quick Start

You can run this application either with Docker (recommended) or locally.

### Option 1: Running with Docker (Recommended)

#### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

#### Steps

1. **Clone the repository**:
   ```bash
   cd backend
   ```

2. **Start the application with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

   This will:
   - Build the NestJS application image
   - Start PostgreSQL 15 container
   - Start the API container with hot reload enabled
   - Create a Docker network for inter-container communication
   - Persist database data in a named volume

3. **Access the API**:
   - API: http://localhost:3000
   - Swagger Docs: http://localhost:3000/api/docs

4. **View logs**:
   ```bash
   # All services
   docker-compose logs -f
   
   # API only
   docker-compose logs -f api
   
   # Database only
   docker-compose logs -f db
   ```

5. **Stop the application**:
   ```bash
   docker-compose down
   
   # To also remove volumes (database data)
   docker-compose down -v
   ```

#### Docker Development Features

- **Hot Reload**: Source code is mounted as a volume, changes are reflected immediately
- **Database Persistence**: PostgreSQL data persists between restarts
- **Health Checks**: API waits for database to be ready before starting
- **Isolated Network**: Containers communicate via a dedicated bridge network

### Option 2: Running Locally

#### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

#### Steps

1. **Clone and install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_DATABASE=survey_platform
   
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRATION=24h
   ```

3. **Create database**:
   ```bash
   # Using psql
   createdb survey_platform
   ```

4. **Start the application**:
   ```bash
   # Development mode with hot reload
   npm run start:dev
   
   # Production mode
   npm run build
   npm run start:prod
   ```

5. **Access the API**:
   - API: http://localhost:3000
   - Swagger Docs: http://localhost:3000/api/docs

## Project Structure

```
backend/
├── src/
│   ├── common/                 # Shared utilities
│   │   ├── decorators/        # Custom decorators (Roles, CurrentUser)
│   │   ├── enums/            # Enumerations (UserRole, QuestionType, etc.)
│   │   ├── filters/          # Exception filters
│   │   └── guards/           # Auth guards (JWT, Roles)
│   ├── config/               # Configuration files
│   ├── modules/
│   │   ├── auth/            # Authentication & JWT
│   │   ├── users/           # User management
│   │   ├── surveys/         # Surveys & questions
│   │   ├── campaigns/       # Campaign lifecycle
│   │   ├── responses/       # Response collection
│   │   └── analytics/       # Metrics & analytics
│   ├── app.module.ts        # Root module
│   └── main.ts              # Application entry point
├── .env.example
├── package.json
├── tsconfig.json
└── ARCHITECTURE.md          # Detailed architecture documentation
```

## API Overview

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and receive JWT token

### Users (Admin only)
- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Surveys
- `GET /surveys` - List all surveys
- `GET /surveys/:id` - Get survey details
- `POST /surveys` - Create survey (Admin)
- `PATCH /surveys/:id` - Update survey (Admin)
- `DELETE /surveys/:id` - Delete survey (Admin)
- `POST /surveys/:id/versions` - Create new version (Admin)
- `GET /surveys/:id/versions` - List survey versions
- `GET /surveys/:id/versions/:versionId` - Get specific version
- `GET /surveys/templates` - List survey templates
- `GET /surveys/templates/:id` - Get template details
- `POST /surveys/templates` - Create survey template (Admin)
- `POST /surveys/:id/apply-template` - Clone a template into an existing survey (Admin)

### Campaigns
- `GET /campaigns` - List all campaigns
- `GET /campaigns/:id` - Get campaign details
- `POST /campaigns` - Create campaign (Admin)
- `PATCH /campaigns/:id` - Update campaign (Admin)
- `DELETE /campaigns/:id` - Delete campaign (Admin)
- `POST /campaigns/:id/publish` - Publish campaign (Admin)
- `POST /campaigns/:id/close` - Close campaign (Admin)

### Responses
- `POST /responses/submit` - Submit response (public or authenticated)
- `GET /responses` - List all responses (Admin)
- `GET /responses/:id` - Get response details (Admin)
- `GET /responses/campaign/:campaignId` - Get campaign responses (Admin)

### Analytics (Admin only)
- `GET /analytics/campaigns/:campaignId` - Get campaign metrics
- `GET /analytics/campaigns/:campaignId/questions/:questionId` - Get question analytics
- `GET /analytics/surveys/:surveyId/summary` - Admin summary (campaign counts, alerts, recent responses)
- `GET /analytics/campaigns/:campaignId/export` - Export campaign responses as CSV

## Example Usage

### 1. Register an Admin

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "role": "ADMIN",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Save the returned `accessToken` for authenticated requests.

### 3. Create a Survey

```bash
curl -X POST http://localhost:3000/surveys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Customer Satisfaction Survey",
    "description": "Help us improve our services"
  }'
```

### 4. Create a Survey Version with Questions

```bash
curl -X POST http://localhost:3000/surveys/{surveyId}/versions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "changeLog": "Initial version",
    "questions": [
      {
        "text": "How satisfied are you?",
        "type": "SCALE",
        "required": true,
        "orderIndex": 1,
        "validationRules": { "min": 1, "max": 10 }
      },
      {
        "text": "What can we improve?",
        "type": "TEXT",
        "required": false,
        "orderIndex": 2
      }
    ]
  }'
```

### 5. Create a Campaign

### 4b. Save a Survey Version as Template

```bash
curl -X POST http://localhost:3000/surveys/templates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "CSAT Baseline",
    "description": "Reusable CSAT template",
    "surveyVersionId": "VERSION_ID"
  }'
```

### 4c. Create a Survey from a Template

```bash
curl -X POST http://localhost:3000/surveys/{surveyId}/apply-template \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{ "templateId": "TEMPLATE_ID" }'
```

```bash
curl -X POST http://localhost:3000/campaigns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Q1 2026 Survey",
    "description": "Quarterly customer feedback",
    "startDate": "2026-01-15T00:00:00Z",
    "endDate": "2026-01-31T23:59:59Z",
    "surveyVersionId": "VERSION_ID"
  }'
```

### 6. Publish Campaign

```bash
curl -X POST http://localhost:3000/campaigns/{campaignId}/publish \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 7. Submit a Response

```bash
curl -X POST http://localhost:3000/responses/submit \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "CAMPAIGN_ID",
    "anonymousId": "anon-123",
    "items": [
      {
        "questionId": "QUESTION_1_ID",
        "value": 8
      },
      {
        "questionId": "QUESTION_2_ID",
        "value": "Great service overall!"
      }
    ]
  }'
```

### 8. Get Campaign Analytics

```bash
curl -X GET http://localhost:3000/analytics/campaigns/{campaignId} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Database Schema

The application uses TypeORM with automatic synchronization in development mode. Key entities:

- **User** - Authentication and user profiles
- **Survey** - Top-level survey container
- **SurveyVersion** - Versioned survey snapshots (initial version auto-created on survey creation)
- **Question** - Individual survey questions with optional visibility rules
- **QuestionOption** - Options for choice-based questions
- **SurveyTemplate** - Reusable survey structure for cloning
- **Campaign** - Survey distribution and lifecycle
- **Response** - User submissions
- **ResponseItem** - Individual question answers

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed entity relationships and design decisions.

## Docker Commands

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Rebuild and start
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View logs
docker-compose logs -f

# Execute commands in running container
docker-compose exec api npm run migration:run

# Access database
docker-compose exec db psql -U postgres -d survey_platform

# Restart a service
docker-compose restart api
```

## NPM Scripts

```bash
npm run start          # Start application
npm run start:dev      # Start with hot reload
npm run start:prod     # Start production build
npm run build          # Build for production
npm run format         # Format code with Prettier
npm run lint           # Lint code with ESLint
npm run test           # Run unit tests
npm run test:e2e       # Run end-to-end tests
npm run test:cov       # Generate test coverage
```

## Architecture

This MVP follows a clean, modular architecture inspired by Domain-Driven Design (DDD):

- **Modularity**: Each domain (auth, surveys, campaigns, etc.) is a self-contained module
- **Separation of Concerns**: Controllers handle HTTP, services contain business logic, repositories manage data
- **Extensibility**: Easy to add new features without modifying existing code
- **Security**: JWT authentication with role-based access control
- **Documentation**: Comprehensive Swagger/OpenAPI documentation

For detailed architecture documentation, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Future Enhancements

This MVP is designed for easy extension:

- 📧 Email campaign distribution
- 📱 QR code generation for physical surveys
- 👥 Team collaboration features
- 📈 Advanced analytics with demographic filtering and version comparisons
- 📊 Real-time dashboards
- 🗂 File storage integration for uploads + PDF report generation on survey close
- 🔍 Full-text search with Elasticsearch
- 💾 Caching with Redis

## License

MIT

## Support

For questions or issues, please refer to the [ARCHITECTURE.md](ARCHITECTURE.md) documentation or contact the development team.
