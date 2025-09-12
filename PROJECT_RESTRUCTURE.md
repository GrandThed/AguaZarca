# Project Restructure Plan

## Recommended Folder Structure

```
aguazarca-project/
├── docs/                           # Move all .md files here
│   ├── MIGRATION_ARCHITECTURE.md
│   ├── MIGRATION_IMPLEMENTATION_PLAN.md
│   ├── CUSTOM_DOMAIN_SETUP.md
│   └── README.md
├── aguazarca-frontend/             # Rename current folder
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── next.config.js
│   └── .env.local
├── aguazarca-backend/              # New backend folder
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   ├── railway.json
│   └── .env
└── .gitignore                      # Root gitignore
```

## Steps to Restructure

### 1. Create Parent Directory
```bash
# Navigate to parent of current project
cd ../
mkdir aguazarca-project
cd aguazarca-project
```

### 2. Move Current Project
```bash
# Move current frontend project
mv ../AguaZarca ./aguazarca-frontend
```

### 3. Create Backend Directory
```bash
# Create backend folder
mkdir aguazarca-backend
cd aguazarca-backend

# Initialize backend
npm init -y
git init
```

### 4. Create Docs Directory
```bash
# Back to root
cd ..
mkdir docs

# Move documentation files
mv aguazarca-frontend/*.md docs/
mv aguazarca-frontend/CLAUDE.md docs/
```

### 5. Update Git Configuration

#### Root .gitignore
```gitignore
# Dependencies
node_modules/
npm-debug.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/
out/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime
.next/
.cache/

# Database
*.db
*.sqlite

# Temporary
tmp/
temp/
```

### 6. Separate Git Repositories

#### Option A: Monorepo (Single Git)
```bash
# Initialize root git
git init
git add .
git commit -m "Initial monorepo setup"
```

#### Option B: Separate Repositories (Recommended)
```bash
# Frontend repository
cd aguazarca-frontend
git remote set-url origin https://github.com/yourusername/aguazarca-frontend.git

# Backend repository  
cd ../aguazarca-backend
git init
git remote add origin https://github.com/yourusername/aguazarca-backend.git

# Docs can stay with frontend or be separate
```

## GitHub Actions Updates

### Frontend Workflow Path
```yaml
# .github/workflows/deploy-frontend.yml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'aguazarca-frontend/**'  # Only trigger on frontend changes
```

### Backend Deployment
```bash
# Backend connects to separate Railway project
# Railway watches the backend repository only
```

## Environment Variables

### Frontend (.env.local)
```env
# Points to backend API
NEXT_PUBLIC_API_URL=https://api.aguazarca.com.ar
NEXT_PUBLIC_MAPBOX_TOKEN=your_token
```

### Backend (.env)
```env
# Backend configuration
DATABASE_URL=postgresql://...
ML_CLIENT_ID=1906241279481736
ML_CLIENT_SECRET=your_secret
FRONTEND_URL=https://aguazarca.com.ar
```

## Documentation References Update

### Update CLAUDE.md in Frontend
```markdown
# CLAUDE.md

## Project Structure
This is the frontend part of AguaZarca. 

**Related repositories:**
- Backend: ../aguazarca-backend
- Documentation: ../docs

## Architecture
See ../docs/MIGRATION_ARCHITECTURE.md for complete system overview.
```

### Update Documentation Paths
Update any file references in documentation:
- Change relative paths from `./` to `../aguazarca-frontend/` or `../aguazarca-backend/`
- Update workflow file paths
- Update deployment references

## Package.json Scripts

### Frontend Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "export": "next build && next export",
    "start": "next start",
    "lint": "next lint",
    "docs": "cd ../docs && echo 'Documentation available'"
  }
}
```

### Backend Scripts
```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:deploy": "prisma migrate deploy",
    "docs": "cd ../docs && echo 'Documentation available'"
  }
}
```

## Railway Configuration Updates

### Connect Separate Repository
1. Create new Railway project for backend
2. Connect to `aguazarca-backend` repository
3. Set up PostgreSQL database
4. Configure environment variables

### Update railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run prisma:deploy && npm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

## Benefits of This Structure

### 1. **Separation of Concerns**
- Frontend and backend can be developed independently
- Different teams can work on different parts
- Clear boundaries between systems

### 2. **Deployment Independence**
- Frontend deploys to Hostinger
- Backend deploys to Railway
- Each has its own CI/CD pipeline

### 3. **Documentation Centralization**
- All project docs in one place
- Easier to maintain and find
- Shared between frontend and backend teams

### 4. **Scalability**
- Easy to add new services (admin panel, mobile app)
- Clear project organization
- Follows industry best practices

## Migration Checklist

- [ ] Create parent directory `aguazarca-project`
- [ ] Move current project to `aguazarca-frontend`
- [ ] Create `aguazarca-backend` directory
- [ ] Create `docs` directory
- [ ] Move all .md files to docs
- [ ] Update .gitignore files
- [ ] Set up separate Git repositories
- [ ] Update GitHub repository settings
- [ ] Update Railway to point to backend repo
- [ ] Update documentation file paths
- [ ] Update environment variables
- [ ] Test build processes
- [ ] Update team access permissions

## Working Directory Commands

After restructure, your workflow becomes:

```bash
# Work on frontend
cd aguazarca-project/aguazarca-frontend
npm run dev

# Work on backend
cd aguazarca-project/aguazarca-backend
npm run dev

# View documentation
cd aguazarca-project/docs
ls *.md

# Deploy frontend
cd aguazarca-frontend
git push origin main  # Triggers GitHub Actions

# Deploy backend
cd aguazarca-backend
git push origin main  # Triggers Railway deployment
```

This structure will make your project much more organized and professional!