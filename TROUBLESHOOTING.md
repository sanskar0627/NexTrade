# Troubleshooting Guide

## Common Issues & Solutions

### Docker Issues
**Problem**: "Docker not running" error
**Solution**: 
1. Install Docker Desktop from: https://www.docker.com/products/docker-desktop
2. Make sure Docker Desktop is running (check system tray)
3. Run `docker --version` to verify installation

### Port Conflicts  
**Problem**: "Port already in use" errors
**Solution**:
```cmd
# Kill processes on ports 3000 and 3001
netstat -ano | findstr :3000
netstat -ano | findstr :3001
# Kill the PID shown: taskkill /PID [number] /F
```

### Database Connection Issues
**Problem**: Database connection failed
**Solutions**:
1. **For PostgreSQL**: Ensure PostgreSQL service is running
2. **For Quick Start**: Use SQLite mode with `quick-start.bat`
3. **Check credentials**: Verify DATABASE_URL in `.env` file

### NPM Install Issues
**Problem**: Dependency installation fails
**Solution**:
```cmd
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Frontend Build Issues
**Problem**: TypeScript or build errors
**Solution**:
```cmd
# Force clean install
cd frontend
rm -rf node_modules .next
npm install
npm run build
```

## Quick Diagnosis Commands
```cmd
# Check if services are running
netstat -an | findstr "3000 3001 5432 6379"

# Check Node.js version
node --version  # Should be v18+

# Check if database is accessible
cd db
npx prisma studio  # Opens database browser
```

## Alternative: Minimal Setup
If all else fails, use the minimal SQLite version:
```cmd
.\quick-start.bat
```

This bypasses Docker and PostgreSQL entirely, using a local SQLite file for testing.