# SkillSphere Frontend - Development & Deployment Guide

## 🛠️ Development Setup

### Prerequisites
- **Node.js**: v18 or higher
- **npm**: v10 or higher
- **Angular CLI**: v18
- **Git**: v2 or higher
- **VS Code** (recommended): Latest version

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd platforme

# Install dependencies
npm install

# Verify Angular CLI
ng version

# Start development server
npm start
# or
ng serve
```

The application will be available at `http://localhost:4200`

## 📂 Development Workflow

### Creating New Features

1. **Create Feature Module**
```bash
ng generate module features/new-feature
ng generate component features/new-feature/pages/page-name
```

2. **Add to Routes**
```typescript
// app.routes.ts
{
  path: 'new-feature',
  loadChildren: () => import('./features/new-feature/new-feature.module')
    .then(m => m.NewFeatureModule)
}
```

3. **Create Services**
```bash
ng generate service core/services/new-feature
```

### Component Development

All components are **standalone** for simplicity:

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-component.html',
  styleUrls: ['./my-component.css']
})
export class MyComponent {}
```

### Using Services

```typescript
import { Component, OnInit } from '@angular/core';
import { CourseService, ToastService } from '@core/services';

@Component({...})
export class MyComponent implements OnInit {
  constructor(
    private courseService: CourseService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.courseService.getCourses().subscribe({
      next: (data) => console.log(data),
      error: (err) => this.toastService.error('Error loading courses')
    });
  }
}
```

## 🎨 Styling Guidelines

### Use CSS Variables

```css
/* ❌ Don't */
.button {
  background: #667eea;
  padding: 12px 24px;
  border-radius: 8px;
}

/* ✅ Do */
.button {
  background: var(--color-primary);
  padding: var(--spacing-lg) var(--spacing-xl);
  border-radius: var(--radius-md);
}
```

### Responsive Design

```css
.component {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

@media (max-width: 768px) {
  .component {
    grid-template-columns: 1fr;
  }
}
```

## 🧪 Testing

### Unit Tests
```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --code-coverage

# Watch mode
npm test -- --watch
```

### E2E Tests
```bash
# Run e2e tests
npm run e2e
```

## 🏗️ Build

### Development Build
```bash
npm start
# or
ng serve
```

### Production Build
```bash
npm run build
# or
ng build --configuration production
```

Output directory: `dist/platforme/`

### Build Analysis
```bash
# Analyze bundle size
ng build --stats-json
npx webpack-bundle-analyzer dist/platforme/stats.json
```

## 📦 Deployment

### Docker Deployment

**Dockerfile**
```dockerfile
# Build stage
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve stage
FROM nginx:alpine
COPY --from=build /app/dist/platforme /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build and Run**
```bash
docker build -t skillsphere-frontend .
docker run -p 80:80 skillsphere-frontend
```

### Cloud Deployment

#### AWS S3 + CloudFront
```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/platforme/ s3://skillsphere-frontend/

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id XXXXX --paths "/*"
```

#### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production
vercel --prod
```

#### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist/platforme
```

### Environment Configuration

**Development** (`src/environments/environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

**Production** (`src/environments/environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.skillsphere.com/api'
};
```

Build-time selection:
```bash
# Development (default)
ng build

# Production
ng build --configuration production
```

## 🐛 Debugging

### Console Debugging
```typescript
// Use console for debugging
console.log('Debug:', data);
console.table(arrayData);
console.time('timer'); // ... console.timeEnd('timer');
```

### Angular DevTools
1. Install Chrome Extension: [Angular DevTools](https://chrome.google.com/webstore)
2. Open DevTools → "Angular" tab
3. Inspect components and services

### Network Debugging
1. Open DevTools → Network tab
2. Check HTTP requests to API
3. Verify request headers and response

## 📋 Code Quality

### Linting
```bash
ng lint
```

### Formatting
```bash
# Format code with Prettier
npx prettier --write "src/**/*.ts" "src/**/*.html"
```

### Pre-commit Hooks
```bash
# Install husky
npm install husky --save-dev

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint"
```

## 📊 Performance Optimization

### Bundle Analysis
```bash
ng build --stats-json
npx webpack-bundle-analyzer dist/platforme/stats.json
```

### Image Optimization
- Use optimized images (WebP format)
- Implement lazy loading
- Use CDN for assets

### Code Splitting
Already implemented via lazy-loaded modules:
```typescript
// Each feature loads only when accessed
path: 'learning',
loadChildren: () => import('./features/learning/learning.module')
```

### Change Detection
```typescript
// Use OnPush strategy for better performance
@Component({
  selector: 'app-optimized',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptimizedComponent {}
```

## CI/CD Pipeline

### GitHub Actions Example

**.github/workflows/deploy.yml**
```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Build
        run: npm run build
      
      - name: Deploy to S3
        run: aws s3 sync dist/platforme/ s3://skillsphere-frontend/
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## 🔐 Security Best Practices

1. **Never commit secrets**
   - Use environment variables
   - Use `.env` files (add to `.gitignore`)

2. **Keep dependencies updated**
   ```bash
   npm audit
   npm update
   ```

3. **Use HTTPS**
   - Always in production
   - Use secure headers

4. **CORS Configuration**
   - Whitelist only trusted domains
   - Set appropriate headers

5. **Input Validation**
   - Validate on client & server
   - Sanitize user input

## 📞 Troubleshooting

### Port 4200 Already in Use
```bash
# Use different port
ng serve --port 4201

# Or kill the process
# Windows: netstat -ano | findstr :4200
# Mac/Linux: lsof -i :4200
```

### Node Modules Issues
```bash
# Clear cache
npm cache clean --force

# Reinstall
rm -rf node_modules
npm install
```

### Build Errors
```bash
# Check Angular version
ng version

# Update Angular CLI
npm install -g @angular/cli@latest

# Update project
ng update @angular/cli
```

### CORS Issues
Set appropriate CORS headers on backend:
```
Access-Control-Allow-Origin: http://localhost:4200
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## 📚 Useful Commands

```bash
# Development
npm start                 # Start dev server
npm test                  # Run tests
npm run lint              # Lint code

# Production
npm run build             # Production build
npm run build:ssr         # Build with SSR (if enabled)

# Utilities
ng generate component path/component-name
ng generate service path/service-name
ng generate module path/module-name
```

## 📖 Additional Documentation

- [Angular CLI Documentation](https://angular.io/cli)
- [Angular Security Guide](https://angular.io/guide/security)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [RxJS Documentation](https://rxjs.dev/)

---

**Last Updated**: February 2026
**Version**: 1.0.0
