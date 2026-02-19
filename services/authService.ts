// Simple authentication service (mock implementation for now)
// TODO: Replace with real backend authentication in production

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'operator' | 'admin' | 'viewer';
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const STORAGE_KEY = 'rescuebot_auth_user';

// Mock user database (for demo purposes)
const MOCK_USERS = [
  {
    email: 'demo@rescuebot.ai',
    password: 'demo123',
    user: {
      id: '1',
      email: 'demo@rescuebot.ai',
      name: 'Demo Operator',
      role: 'operator' as const,
      createdAt: new Date()
    }
  }
];

export const authService = {
  // Sign in with email and password
  signIn: async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check mock users
    const mockUser = MOCK_USERS.find(u => u.email === email && u.password === password);

    if (mockUser) {
      // Store user in localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser.user));
      return { success: true, user: mockUser.user };
    }

    // Check if email exists
    const emailExists = MOCK_USERS.some(u => u.email === email);
    if (emailExists) {
      return { success: false, error: 'Invalid password' };
    }

    return { success: false, error: 'User not found' };
  },

  // Sign up new user
  signUp: async (email: string, password: string, name: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if user already exists
    if (MOCK_USERS.some(u => u.email === email)) {
      return { success: false, error: 'Email already registered' };
    }

    // Basic validation
    if (!email.includes('@')) {
      return { success: false, error: 'Invalid email format' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role: 'operator',
      createdAt: new Date()
    };

    // Store user (in real app, this would be sent to backend)
    MOCK_USERS.push({ email, password, user: newUser });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));

    return { success: true, user: newUser };
  },

  // Sign out
  signOut: async (): Promise<void> => {
    localStorage.removeItem(STORAGE_KEY);
  },

  // Get current user from localStorage
  getCurrentUser: (): User | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const user = JSON.parse(stored);
        // Convert createdAt string back to Date
        user.createdAt = new Date(user.createdAt);
        return user;
      }
    } catch (error) {
      console.error('Failed to parse stored user:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return authService.getCurrentUser() !== null;
  }
};
