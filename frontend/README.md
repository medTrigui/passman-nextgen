# PassMan NextGen Frontend

A modern, secure password manager frontend built with React, TypeScript, and Material-UI.

##  Tech Stack

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **State Management**: Zustand
- **API Client**: Axios
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router
- **Development Mode**: Mock API support

##  Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/           # Route-level components
│   ├── services/        # API and mock data services
│   ├── store/           # Zustand state management
│   ├── types/           # TypeScript interfaces
│   └── theme.ts         # MUI theme configuration
```

##  Key Features

- **Authentication**: Login/Register with JWT token management
- **Password Management**: CRUD operations for password entries
- **Responsive Design**: Mobile-first layout with drawer navigation
- **Search**: Real-time password filtering
- **Development Mode**: Mock API for development without backend
- **Security**: Password visibility toggle, secure token storage

## 🏃‍♂️ Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

##  Development Mode

The app includes a mock API for development. Use these credentials:
- Username: testuser
- Password: password

##  TODO List

1. **Features to Implement**:
   - [ ] Add Password Creation/Edit Modal
   - [ ] Implement Password Generator
   - [ ] Add Profile Page
   - [ ] Add Settings Page
   - [ ] Implement Password Categories/Tags
   - [ ] Add Password Strength Indicator
   - [ ] Implement Password Export/Import

2. **Security Enhancements**:
   - [ ] Add Password Encryption/Decryption
   - [ ] Implement Session Timeout
   - [ ] Add 2FA Support
   - [ ] Add Password History
   - [ ] Implement Secure Password Sharing

3. **UI/UX Improvements**:
   - [ ] Add Loading States
   - [ ] Improve Error Handling
   - [ ] Add Success/Error Notifications
   - [ ] Implement Dark Mode Toggle
   - [ ] Add Keyboard Shortcuts
   - [ ] Improve Mobile Experience

4. **Testing**:
   - [ ] Add Unit Tests
   - [ ] Add Integration Tests
   - [ ] Add E2E Tests
   - [ ] Add Performance Tests

5. **Documentation**:
   - [ ] Add JSDoc Comments
   - [ ] Create Component Documentation
   - [ ] Add API Documentation
   - [ ] Create User Guide

##  Security Considerations

- JWT tokens are stored in localStorage (consider more secure alternatives)
- Passwords are currently displayed in plain text when revealed
- No encryption implemented yet for stored passwords
- Mock data should never be used in production

##  Dependencies

Core dependencies are managed through `package.json`. Key packages:
- React 18+
- Material-UI 5+
- TanStack Query 5+
- Zustand 4+
- Axios
