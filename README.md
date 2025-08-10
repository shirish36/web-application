# Web Application with OAuth

This is a sample web application with OAuth-based authentication for the DevOps infrastructure.

## Features

- OAuth 2.0 / OpenID Connect authentication
- Responsive web interface
- Integration with .NET API backend
- Session management
- Role-based access control
- Docker containerization

## Technology Stack

- **Frontend**: React with TypeScript / ASP.NET Core MVC
- **Authentication**: OAuth 2.0 (Google, Microsoft, etc.)
- **State Management**: Redux Toolkit (for React) / ViewModels (for MVC)
- **Styling**: Tailwind CSS / Bootstrap
- **Build Tool**: Vite (for React) / MSBuild (for MVC)

## Project Structure

### Option 1: React Frontend
```
web-application/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   └── utils/
├── public/
├── package.json
├── Dockerfile
├── nginx.conf
└── README.md
```

### Option 2: ASP.NET Core MVC
```
web-application/
├── Controllers/
├── Views/
├── Models/
├── Services/
├── wwwroot/
├── Program.cs
├── Dockerfile
└── WebApp.csproj
```

## Authentication Setup

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - `https://your-domain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (for development)

### Microsoft Azure AD Setup

1. Go to [Azure Portal](https://portal.azure.com/)
2. Register new application in Azure AD
3. Configure redirect URIs and permissions

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `OAUTH_CLIENT_ID` | OAuth Client ID | `123456789-abc.googleusercontent.com` |
| `OAUTH_CLIENT_SECRET` | OAuth Client Secret | `your-secret-key` |
| `API_BASE_URL` | Backend API URL | `https://api.example.com` |
| `OAUTH_REDIRECT_URI` | OAuth redirect URI | `https://your-domain.com/auth/callback` |

## Local Development

### React Version

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### ASP.NET Core Version

```bash
# Restore dependencies
dotnet restore

# Run application
dotnet run

# Build for production
dotnet build -c Release
```

## Docker Deployment

### React Version

```bash
# Build image
docker build -t web-app .

# Run container
docker run -p 8080:80 web-app
```

### ASP.NET Core Version

```bash
# Build image
docker build -t web-app .

# Run container
docker run -p 8080:8080 web-app
```

## Features Implementation

### Authentication Flow

1. User clicks "Login"
2. Redirect to OAuth provider
3. User authenticates with provider
4. Provider redirects back with authorization code
5. Exchange code for access token
6. Store user session
7. Access protected resources

### Protected Routes

- Dashboard
- Profile management
- Admin panel (role-based)
- Settings

### API Integration

- Authenticated API calls
- Token refresh handling
- Error handling and retry logic

## Security Features

- HTTPS enforcement
- CSRF protection
- XSS prevention
- Secure session management
- Input validation
- Content Security Policy

## Testing

```bash
# Unit tests
npm test          # React
dotnet test       # ASP.NET Core

# E2E tests
npm run test:e2e  # React with Playwright
```

## CI/CD

The application includes GitHub Actions workflows for:
- Build and test
- Security scanning
- Docker image building
- Deployment to Cloud Run

## Performance

- Code splitting (React)
- Lazy loading
- Caching strategies
- CDN integration
- Image optimization

## Monitoring

- Application performance monitoring
- User analytics
- Error tracking
- Health checks endpoint
