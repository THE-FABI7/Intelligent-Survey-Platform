# Intelligent Survey Platform - Architecture Documentation

## Overview

This is an MVP (Minimum Viable Product) of an **Intelligent Survey Platform** built with NestJS, TypeScript, PostgreSQL, and TypeORM. The architecture follows Domain-Driven Design (DDD) principles with a clean, modular structure that separates concerns and enables future extensibility.

## Architecture Principles

### 1. Modular Design
The application is organized into distinct, self-contained modules, each responsible for a specific domain:

- **auth**: Authentication and authorization
- **users**: User management
- **surveys**: Survey creation and versioning
- **campaigns**: Campaign lifecycle management
- **responses**: Response collection and storage
- **analytics**: Data analysis and metrics

### 2. Separation of Concerns
Each module follows a layered architecture:

```
module/
├── entities/          # Database entities (TypeORM)
├── dto/              # Data Transfer Objects (validation)
├── controllers/      # HTTP endpoints (routing)
├── services/         # Business logic
└── module.ts         # Module configuration
```

### 3. Shared Infrastructure
Common functionality is centralized in the `src/common/` directory:

- **enums**: Shared enumerations (UserRole, QuestionType, CampaignStatus)
- **decorators**: Custom decorators (Roles, CurrentUser)
- **guards**: Authentication and authorization guards
- **filters**: Global exception handling

---

## Module Documentation

### Auth Module
**Purpose**: Handles user authentication and authorization using JWT tokens.

**Key Features**:
- User registration with password hashing (bcrypt)
- Login with JWT token generation
- JWT strategy for protected routes
- Role-based access control (ADMIN, RESPONDENT)

**Endpoints**:
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token

**Why This Module?**
Security is fundamental. Separating auth logic allows us to:
- Easily extend authentication methods (OAuth, SSO, 2FA)
- Maintain consistent security policies
- Reuse auth guards across all protected endpoints

---

### Users Module
**Purpose**: User management and CRUD operations.

**Key Features**:
- Admin-only user management
- User role assignment
- Password security (no plain-text storage)

**Endpoints**:
- `POST /users` - Create user (Admin only)
- `GET /users` - List all users (Admin only)
- `GET /users/:id` - Get user details (Admin only)
- `PATCH /users/:id` - Update user (Admin only)
- `DELETE /users/:id` - Delete user (Admin only)

**Why This Module?**
Separating user management from auth allows:
- Different admin tools for user administration
- User profile extensions (demographics, preferences)
- Integration with external user directories

---

### Surveys Module
**Purpose**: Survey creation, question management, and versioning.

**Key Entities**:
- **Survey**: Top-level container (title, description)
- **SurveyVersion**: Versioned snapshot of a survey
- **Question**: Individual questions with type and validation rules
- **QuestionOption**: Options for multiple-choice/checkbox questions

**Question Types**:
- TEXT - Free text input
- NUMBER - Numeric input with min/max validation
- MULTIPLE_CHOICE - Single selection from options
- CHECKBOX - Multiple selections
- SCALE - Rating scale (1-10, etc.)
- FILE_UPLOAD - File attachment metadata (storage integration next)

**Visibility Rules**:
- Optional per-question `visibility` config with operator/value/target question to support skip logic on the backend DTO.

**Endpoints**:
- `POST /surveys` - Create survey (Admin)
- `GET /surveys` - List all surveys
- `GET /surveys/:id` - Get survey with versions
- `PATCH /surveys/:id` - Update survey (Admin)
- `DELETE /surveys/:id` - Delete survey (Admin)
- `POST /surveys/:id/versions` - Create new version (Admin)
- `GET /surveys/:id/versions` - List versions
- `GET /surveys/:id/versions/:versionId` - Get specific version
- `GET /surveys/templates` - List templates
- `GET /surveys/templates/:id` - Get template by id
- `POST /surveys/templates` - Create template from an existing survey version (Admin)
- `POST /surveys/:id/apply-template` - Clone a template into a survey (Admin)

**Why Versioning?**
Survey versioning is critical for:
- **Historical accuracy**: Responses are tied to specific versions
- **Iterative improvement**: Modify surveys without breaking active campaigns
- **A/B testing**: Run different versions simultaneously
- **Compliance**: Maintain audit trails of changes

---

### Campaigns Module
**Purpose**: Manage survey distribution and lifecycle.

**Key Features**:
- Link campaigns to specific survey versions
- Schedule with start/end dates
- Status management (CREATED → PUBLISHED → CLOSED)
- Only published campaigns accept responses

**Endpoints**:
- `POST /campaigns` - Create campaign (Admin)
- `GET /campaigns` - List all campaigns
- `GET /campaigns/:id` - Get campaign details
- `PATCH /campaigns/:id` - Update campaign (Admin)
- `DELETE /campaigns/:id` - Delete campaign (Admin)
- `POST /campaigns/:id/publish` - Publish campaign (Admin)
- `POST /campaigns/:id/close` - Close campaign (Admin)

**Why Campaigns?**
Campaigns separate survey design from distribution:
- Run the same survey version multiple times
- Target different audiences (future: demographic filtering)
- Control timing and availability
- Isolate analytics per campaign

---

### Responses Module
**Purpose**: Collect and store survey responses.

**Key Features**:
- Support for authenticated and anonymous responses
- Automatic completion time tracking
- Validation against campaign status and dates
- Flexible value storage (JSONB)

**Endpoints**:
- `POST /responses/submit` - Submit response (public or authenticated)
- `GET /responses` - List all responses (Admin only)
- `GET /responses/:id` - Get response details (Admin only)
- `GET /responses/campaign/:campaignId` - Get campaign responses (Admin only)

**Why This Module?**
Separating responses enables:
- Privacy controls (anonymous vs authenticated)
- Response validation without affecting survey design
- Future features: partial responses, draft saving, response editing

---

### Analytics Module
**Purpose**: Provide insights and metrics on campaign performance.

**Current Metrics**:
- **Total responses** and **completion rate**
- **Average completion time**
- **Authenticated vs anonymous** breakdown
- **Question analytics**: type-aware (options distribution, numeric stats + histogram, text top-words + basic sentiment)
- **CSV export** per campaign
- **Survey summary**: active/closed campaigns, alerts for campañas que cierran en <24h, respuestas recientes

**Endpoints**:
- `GET /analytics/campaigns/:campaignId` - Campaign metrics (Admin)
- `GET /analytics/campaigns/:campaignId/questions/:questionId` - Question analytics (Admin)
- `GET /analytics/surveys/:surveyId/summary` - Survey summary (Admin)
- `GET /analytics/campaigns/:campaignId/export` - CSV export (Admin)

**Why This Module?**
Analytics as a separate module allows:
- Performance optimization (caching, aggregation)
- Advanced analytics without cluttering other modules
- Future features: demographic filters, trend analysis, real-time dashboards

---

## Database Design

### Entity Relationships

```
User
├── 1:N → Survey (createdBy)
├── 1:N → Campaign (createdBy)
└── 1:N → Response (optional)

Survey
└── 1:N → SurveyVersion

SurveyVersion
├── 1:N → Question
└── 1:N → Campaign

Question
└── 1:N → QuestionOption

Campaign
└── 1:N → Response

Response
└── 1:N → ResponseItem

ResponseItem
└── N:1 → Question
```

**Templates**
- `SurveyTemplate` stores a reusable survey version snapshot that can be cloned into new surveys without altering the source version.

### Key Design Decisions

1. **Survey Versioning**: Each campaign links to a specific `SurveyVersion`, not the parent `Survey`. This ensures response integrity even if surveys are modified.

2. **JSONB for Response Values**: `ResponseItem.value` uses JSONB to store different data types (text, numbers, arrays, files) without rigid schema constraints.

3. **Soft Relationships**: Responses can be anonymous (user is nullable), enabling public surveys.

4. **Cascade Deletes**: Deleting surveys cascades to versions, questions, and options, maintaining referential integrity.

5. **Template-first Workflow**: A `SurveyTemplate` captures a reusable version snapshot and can be applied to any survey to bootstrap questions and options.

6. **Auto Initial Version**: Creating a survey seeds an initial version to keep analytics/version history consistent from the start.

---

## Security Model

### Role-Based Access Control (RBAC)

**Roles**:
- **ADMIN**: Full access to all modules
- **RESPONDENT**: Can only submit responses

**Guards**:
- `JwtAuthGuard`: Validates JWT tokens
- `RolesGuard`: Checks user roles against required roles

**Usage**:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
```

### Password Security
- Passwords hashed with bcrypt (10 rounds)
- Never returned in API responses
- Validation: minimum 6 characters

---

## Future Extensibility

This MVP architecture is designed for easy extension:

### 1. Advanced Survey Logic
**Richer Visibility/Branching**: Extend current visibility rules to support compound conditions and dynamic ordering.
- Add grouped conditions (AND/OR) and nested expressions
- Add `nextQuestionId`/routing to enable true branching paths
- Enforce conditional requiredness in validation layer

**Dynamic Scoring/Computed Fields**
- Allow derived values from answers for scoring or eligibility
- Expose computed results in analytics

### 2. Enhanced Analytics & Reporting
**Demographic Filtering**: "Show responses from users aged 18-25" / por ciudad
- Extender `User` con género/edad/ubicación y permitir filtros en analytics

**Real-time Dashboards**: Live campaign monitoring
- WebSockets para métricas en vivo

**Reportes en PDF**
- Generar reporte final al cerrar encuesta (PDF profesional listo para reunión)

**Export**: CSV/Excel completos
- Endpoint actual de CSV y agregar Excel

### 3. Multi-channel Distribution
**Email Campaigns**: Send surveys via email
- Integrate with email service (SendGrid, Mailgun)
- Generate unique response links

**QR Codes**: Physical survey distribution
- Generate QR codes per campaign
- Track responses by source

### 4. Collaboration Features
**Team Management**: Multiple admins per survey
- Add `SurveyCollaborator` entity
- Permission levels (owner, editor, viewer)

**Comments**: Internal notes on surveys/responses
- Add `Comment` entity linked to surveys or responses

### 5. Advanced Question Types
**Matrix Questions**: Multiple questions with same options
- Add `MatrixQuestion` entity grouping questions
- Store responses in structured format

**Geolocation**: Capture user location
- Add geolocation field to `Response`
- Display on maps in analytics

### 6. Performance Optimizations
**Caching**: Redis for frequently accessed data
- Cache campaign details, survey versions
- Invalidate on updates

**Search**: Elasticsearch for response filtering
- Index responses for full-text search
- Advanced filtering and aggregation

---

## Running the Application

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Run database migrations** (after implementing migrations):
   ```bash
   npm run migration:run
   ```

4. **Start the application**:
   ```bash
   # Development
   npm run start:dev

   # Production
   npm run build
   npm run start:prod
   ```

5. **Access Swagger documentation**:
   Open http://localhost:3000/api/docs

### Testing the API

1. **Register an admin**:
   ```bash
   POST /auth/register
   {
     "email": "admin@example.com",
     "password": "admin123",
     "role": "ADMIN"
   }
   ```

2. **Login**:
   ```bash
   POST /auth/login
   {
     "email": "admin@example.com",
     "password": "admin123"
   }
   ```

3. **Use the JWT token** in subsequent requests:
   ```
   Authorization: Bearer <your-token>
   ```

## Technology Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 14+ (15 in Docker)
- **ORM**: TypeORM 0.3.x
- **Authentication**: JWT (Passport)
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Security**: bcrypt for password hashing
- **Containerization**: Docker & Docker Compose

---

## API Documentation

Once running, comprehensive API documentation is available at:
**http://localhost:3000/api/docs**

The Swagger UI provides:
- Interactive endpoint testing
- Request/response schemas
- Authentication flow
- Example payloads

---

## Project Structure

```
backend/
├── src/
│   ├── common/
│   │   ├── decorators/     # Custom decorators
│   │   ├── enums/          # Shared enumerations
│   │   ├── filters/        # Exception filters
│   │   └── guards/         # Auth guards
│   ├── config/
│   │   └── database.config.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── surveys/
│   │   ├── campaigns/
│   │   ├── responses/
│   │   └── analytics/
│   ├── app.module.ts
│   └── main.ts
├── .env.example
├── package.json
├── tsconfig.json
└── ARCHITECTURE.md (this file)
```

---

## MVP Scope Summary

**What's Included**:
✅ User authentication with JWT
✅ Role-based access control (Admin/Respondent)
✅ Survey creation with multiple question types
✅ Survey versioning
✅ Campaign lifecycle management
✅ Response submission (authenticated & anonymous)
✅ Basic analytics (completion rate, average time, totals)
✅ Question analytics por tipo (distribuciones, histogramas, top palabras, sentimiento básico)
✅ Export de respuestas a CSV
✅ Swagger API documentation
✅ Survey templates and cloning
✅ Question visibility rules (skip logic support)

**What's Next** (Post-MVP):
🔲 Advanced analytics (demographics, exports)
🔲 Multi-channel distribution (email, QR)
🔲 Real-time dashboards
🔲 File upload handling
🔲 Response editing
🔲 Team collaboration
🔲 Dedicated storage for uploaded files

---

## Conclusion

This architecture provides a solid foundation for an intelligent survey platform. The modular design ensures that each domain is independent and can be extended without affecting others. The separation of surveys from campaigns, and the versioning system, prepare the platform for complex future requirements like conditional logic, A/B testing, and advanced analytics.

The MVP focuses on core functionality while maintaining flexibility for growth. Every module can scale independently, and new features can be added without major refactoring.

**Key Takeaway**: Clean architecture today enables rapid innovation tomorrow.
