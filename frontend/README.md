# Frontend - Survey Platform Admin

Modern admin dashboard for the Intelligent Survey Platform built with Vue 3, TypeScript, Vite, and TailwindCSS.

## 🎨 Features

- **Dark Theme UI**: Minimalistic design with dark-950 background and primary-600 accents
- **Authentication**: JWT-based login with automatic token management
- **Dashboard**: Overview with key metrics and recent campaigns
- **Survey Management**: Create, edit, and version surveys
- **Campaign Management**: Publish campaigns and track their lifecycle
- **Analytics**: View detailed campaign metrics and response analytics
- **Response Viewer**: Examine individual survey responses
- **Responsive Design**: Mobile-friendly interface with collapsible sidebar

## 📦 Tech Stack

- **Vue 3** - Composition API with TypeScript
- **Vite** - Fast development server and build tool
- **TypeScript** - Type-safe code
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client with interceptors
- **Vue Router** - Client-side routing with navigation guards

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Backend API running (see backend README)

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Environment Configuration

Edit `.env` file:

```env
# Backend API URL
VITE_API_URL=http://localhost:3000
```

### Development

```bash
# Start development server
npm run dev

# Server will start at http://localhost:5173
```

### Build for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AppLayout.vue    # Main layout with sidebar
│   │   ├── AppCard.vue      # Card container
│   │   ├── AppButton.vue    # Button with variants
│   │   ├── AppTable.vue     # Data table
│   │   └── AppTag.vue       # Status badges
│   ├── views/               # Page components
│   │   ├── LoginView.vue           # Authentication
│   │   ├── DashboardView.vue       # Dashboard overview
│   │   ├── SurveysView.vue         # Survey list
│   │   ├── SurveyDetailView.vue    # Survey editor
│   │   ├── CampaignsView.vue       # Campaign list
│   │   ├── CampaignDetailView.vue  # Campaign details
│   │   ├── AnalyticsListView.vue   # Analytics overview
│   │   ├── AnalyticsView.vue       # Campaign analytics
│   │   └── ResponsesView.vue       # Response viewer
│   ├── services/            # API services
│   │   └── api/
│   │       ├── http.ts              # Axios client
│   │       ├── auth.service.ts      # Authentication
│   │       ├── survey.service.ts    # Surveys API
│   │       ├── campaign.service.ts  # Campaigns API
│   │       ├── response.service.ts  # Responses API
│   │       ├── analytics.service.ts # Analytics API
│   │       └── index.ts             # Exports
│   ├── router/              # Vue Router config
│   │   └── index.ts         # Routes and guards
│   ├── types/               # TypeScript types
│   │   └── index.ts         # API interfaces
│   ├── App.vue              # Root component
│   ├── main.ts              # App entry point
│   └── style.css            # Global styles
├── public/                  # Static assets
├── .env.example             # Environment template
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript config
├── tailwind.config.js       # Tailwind config
└── package.json             # Dependencies
```

## 🎯 Key Features

### Authentication

Login with credentials:
- Default admin: `admin@example.com` / `admin123`
- JWT tokens stored in localStorage
- Automatic token refresh on API calls
- Auto-redirect to login on 401 responses

### Dashboard

- Total surveys count
- Active campaigns count
- Total responses count
- Average completion rate
- Recent campaigns table with quick actions

### Survey Management

- Create new surveys with title and description
- List all surveys with version counts
- Edit surveys (add questions, options)
- Delete unused surveys

### Campaign Management

- Create campaigns from survey versions
- Set start and end dates
- Publish/close campaigns
- Filter by status (CREATED, PUBLISHED, CLOSED)
- View analytics and responses

### Analytics

- Campaign-level metrics
- Completion rate tracking
- Average completion time
- Question-level performance
- Answer distribution charts
- Response funnel visualization

### Responses

- List all campaign responses
- Filter by completion status
- View detailed responses
- Anonymous respondent support

## 🎨 UI Components

### AppButton

```vue
<AppButton variant="primary" size="lg" :loading="isLoading">
  Submit
</AppButton>
```

Variants: `primary`, `secondary`, `danger`, `ghost`
Sizes: `sm`, `md`, `lg`

### AppCard

```vue
<AppCard>
  <template #header>Card Title</template>
  Content here
  <template #footer>Footer content</template>
</AppCard>
```

### AppTable

```vue
<AppTable
  :columns="[
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' }
  ]"
  :data="items"
>
  <template #cell-name="{ row }">{{ row.name }}</template>
</AppTable>
```

### AppTag

```vue
<AppTag status="PUBLISHED" />
```

Statuses: `CREATED`, `PUBLISHED`, `CLOSED`, `ACTIVE`, `COMPLETED`, `IN_PROGRESS`

## 🔌 API Integration

### Service Architecture

All API calls go through service modules:

```typescript
import { surveyService, campaignService } from '@/services/api'

// Get all surveys
const surveys = await surveyService.getAll()

// Create campaign
const campaign = await campaignService.create({
  name: 'Q1 Survey',
  surveyVersionId: '123',
  startDate: '2024-01-01',
})
```

### HTTP Client

Axios instance with interceptors:
- Adds `Authorization: Bearer <token>` to all requests
- Handles 401 errors with auto-redirect to login
- Base URL from `VITE_API_URL` environment variable

## 🎨 Theme Customization

Edit `tailwind.config.js`:

```javascript
colors: {
  primary: {
    // Change primary color
    600: '#your-color',
  },
  dark: {
    // Change background shades
    950: '#your-dark-color',
  }
}
```

## 🔒 Route Guards

Protected routes require authentication:

```typescript
router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated()
  const requiresAuth = to.meta.requiresAuth !== false
  
  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})
```

## 📝 Adding New Views

1. Create component in `src/views/`
2. Add route in `src/router/index.ts`
3. Add navigation link in `AppLayout.vue` sidebar

Example:

```typescript
// router/index.ts
{
  path: '/settings',
  name: 'Settings',
  component: () => import('@/views/SettingsView.vue'),
  meta: { requiresAuth: true },
}
```

## 🐛 Debugging

### Common Issues

**API Connection Error**
- Check `VITE_API_URL` in `.env`
- Ensure backend is running
- Check browser console for CORS errors

**Authentication Fails**
- Clear localStorage: `localStorage.clear()`
- Check JWT token expiration
- Verify backend `/auth/login` endpoint

**Build Errors**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`

## 📚 Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint code (if configured)
npm run type-check   # Check TypeScript types (if configured)
```

## 🚀 Deployment

### Vite Build

```bash
npm run build
# Output in dist/ folder
```

### Deploy to Vercel/Netlify

1. Connect your Git repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_URL`

### Deploy with Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:

```bash
docker build -t survey-frontend .
docker run -p 80:80 survey-frontend
```

## 🤝 Integration with Backend

This frontend connects to the NestJS backend (see `../backend`).

**Required Backend Endpoints:**
- `POST /auth/login` - Authentication
- `GET /surveys` - List surveys
- `POST /surveys` - Create survey
- `GET /campaigns` - List campaigns
- `POST /campaigns` - Create campaign
- `POST /campaigns/:id/publish` - Publish campaign
- `POST /campaigns/:id/close` - Close campaign
- `GET /analytics/:campaignId/metrics` - Get metrics
- `GET /responses/campaign/:campaignId` - Get responses

## 📖 Further Reading

- [Vue 3 Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Vue Router Documentation](https://router.vuejs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## 📄 License

MIT
