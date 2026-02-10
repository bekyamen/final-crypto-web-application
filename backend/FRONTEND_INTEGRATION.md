# Frontend Integration Guide

## User Registration with Enhanced Fields

### React Hook for Registration

```typescript
// hooks/useRegister.ts
import { useState } from 'react';
import axios from 'axios';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  fundsPassword: string;
}

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/register`,
        data,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const { token, user } = response.data.data;

      // Store token and user data
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      return { success: true, user };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error };
};
```

### Form Validation Schema

```typescript
// lib/validation.ts
import { z } from 'zod';

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[!@#$%^&*]/, 'Must contain special character');

export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  email: z.string().email('Invalid email'),
  phoneNumber: z.string().regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, 'Invalid phone'),
  password: passwordSchema,
  confirmPassword: z.string(),
  fundsPassword: passwordSchema,
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;
```

### React Component Example

```typescript
// components/RegisterForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegister } from '@/hooks/useRegister';
import { registerSchema, type RegisterFormData } from '@/lib/validation';

export const RegisterForm = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });
  const { register: registerUser, loading } = useRegister();

  const onSubmit = async (data: RegisterFormData) => {
    const result = await registerUser(data);
    if (result.success) {
      // Redirect to dashboard
      window.location.href = '/dashboard';
    }
  };

  const password = watch('password');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>First Name</label>
        <input {...register('firstName')} placeholder="John" />
        {errors.firstName && <span>{errors.firstName.message}</span>}
      </div>

      <div>
        <label>Last Name</label>
        <input {...register('lastName')} placeholder="Doe" />
        {errors.lastName && <span>{errors.lastName.message}</span>}
      </div>

      <div>
        <label>Email</label>
        <input {...register('email')} type="email" placeholder="john@example.com" />
        {errors.email && <span>{errors.email.message}</span>}
      </div>

      <div>
        <label>Phone Number</label>
        <input {...register('phoneNumber')} placeholder="+1(555)123-4567" />
        {errors.phoneNumber && <span>{errors.phoneNumber.message}</span>}
      </div>

      <div>
        <label>Login Password</label>
        <input {...register('password')} type="password" />
        {errors.password && <span>{errors.password.message}</span>}
        <small>Min 8 chars, uppercase, number, special char</small>
      </div>

      <div>
        <label>Confirm Password</label>
        <input {...register('confirmPassword')} type="password" />
        {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}
      </div>

      <div>
        <label>Funds Transaction Password</label>
        <input {...register('fundsPassword')} type="password" />
        {errors.fundsPassword && <span>{errors.fundsPassword.message}</span>}
        <small>Separate password for transaction security</small>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};
```

## API Client Class

```typescript
// lib/api.ts
import axios, { AxiosInstance } from 'axios';

class CryptoAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL,
      headers: { 'Content-Type': 'application/json' },
    });

    // Add token to requests
    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Auth endpoints
  register(data: RegisterFormData) {
    return this.client.post('/api/auth/register', data);
  }

  login(email: string, password: string) {
    return this.client.post('/api/auth/login', { email, password });
  }

  getProfile() {
    return this.client.get('/api/auth/profile');
  }

  updateProfile(data: Partial<RegisterFormData>) {
    return this.client.put('/api/auth/profile', data);
  }

  changePassword(currentPassword: string, newPassword: string, confirmNewPassword: string) {
    return this.client.post('/api/auth/change-password', {
      currentPassword,
      newPassword,
      confirmNewPassword,
    });
  }

  changeFundsPassword(currentFundsPassword: string, newFundsPassword: string, confirmFundsPassword: string) {
    return this.client.post('/api/auth/change-funds-password', {
      currentFundsPassword,
      newFundsPassword,
      confirmFundsPassword,
    });
  }

  verifyFundsPassword(fundsPassword: string) {
    return this.client.post('/api/auth/verify-funds-password', { fundsPassword });
  }
}

export const cryptoAPI = new CryptoAPI();
```

## Database Schema Summary

### User Model Fields
```typescript
{
  id: string;              // UUID
  email: string;           // Unique
  password: string;        // Hashed login password
  fundsPassword: string;   // Hashed transaction password
  firstName: string;       // Required
  lastName: string;        // Required
  phoneNumber?: string;    // Optional, unique
  role: UserRole;          // USER or ADMIN
  createdAt: Date;
  updatedAt: Date;
}
```

## Password Security Best Practices

1. **Two-Factor Authentication**
   - Login password: For account access
   - Funds password: For sensitive transactions

2. **Password Requirements**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one number
   - At least one special character

3. **Server-Side Security**
   - Passwords hashed with bcrypt (10 salt rounds)
   - Password verification for every sensitive operation
   - Secure JWT token-based authentication

4. **Frontend Handling**
   - Store JWT token in localStorage (consider httpOnly cookies for production)
   - Clear token on logout
   - Validate form inputs before submission

## Transaction Verification Flow

```typescript
// Before transaction, request funds password confirmation
const handleTransaction = async (transactionData: any) => {
  // 1. Show funds password prompt
  const fundsPassword = await promptForFundsPassword();

  // 2. Verify funds password
  try {
    await cryptoAPI.verifyFundsPassword(fundsPassword);
    
    // 3. Proceed with transaction
    await executeTransaction(transactionData);
  } catch (error) {
    showError('Funds password verification failed');
  }
};
```

## Environment Configuration

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errorCode": "ERROR_CODE",
  "statusCode": 400
}
```

Common error codes:
- `VALIDATION_ERROR` - Invalid input data
- `CONFLICT_ERROR` - Duplicate email or phone number
- `UNAUTHORIZED_ERROR` - Invalid credentials
- `NOT_FOUND_ERROR` - Resource not found
- `INTERNAL_ERROR` - Server error
