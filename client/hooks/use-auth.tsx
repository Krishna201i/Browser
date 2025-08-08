import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: "google" | "facebook" | "apple" | "phone" | "email";
  verified: boolean;
  premium: boolean;
  createdAt: Date;
  lastLogin: Date;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
};

export function useAuth() {
  const [state, setState] = useState<AuthState>(initialState);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("kruger-user");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setState((prev) => ({
          ...prev,
          isAuthenticated: true,
          user: {
            ...user,
            createdAt: new Date(user.createdAt),
            lastLogin: new Date(user.lastLogin),
          },
        }));
      } catch (error) {
        console.error("Failed to load user:", error);
        localStorage.removeItem("kruger-user");
      }
    }
  }, []);

  const simulateAuth = async (provider: string, userData: Partial<User>) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulate API call
      await new Promise((resolve) =>
        setTimeout(resolve, 1500 + Math.random() * 1000),
      );

      const user: User = {
        id: Date.now().toString(),
        name: userData.name || "User",
        email: userData.email || `user@${provider}.com`,
        avatar: userData.avatar,
        provider: provider as any,
        verified: true,
        premium: false,
        createdAt: new Date(),
        lastLogin: new Date(),
        ...userData,
      };

      setState({
        isAuthenticated: true,
        user,
        isLoading: false,
        error: null,
      });

      localStorage.setItem("kruger-user", JSON.stringify(user));
      toast.success(`Welcome back, ${user.name}! 🎉`);
      return user;
    } catch (error) {
      const errorMessage = `Failed to sign in with ${provider}`;
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
      return null;
    }
  };

  const signInWithGoogle = useCallback(async () => {
    toast.info("Opening Google Sign-In...");
    return simulateAuth("google", {
      name: "Krishna Singh",
      email: "krishna.singh@gmail.com",
      avatar:
        "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.iconfinder.com%2Ficons%2F4406678%2Faccount_avatar_head_person_profile_user_icon&psig=AOvVaw0QxWZ8fBmBYGgQKQr7kAoQ&ust=1703123456789000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCKjS4P2X2oEDFQAAAAAdAAAAABAE",
    });
  }, []);

  const signInWithFacebook = useCallback(async () => {
    toast.info("Opening Facebook Sign-In...");
    return simulateAuth("facebook", {
      name: "Krishna Singh",
      email: "krishna.singh@facebook.com",
      avatar: "/placeholder.svg",
    });
  }, []);

  const signInWithApple = useCallback(async () => {
    toast.info("Opening Apple Sign-In...");
    return simulateAuth("apple", {
      name: "Krishna Singh",
      email: "krishna.singh@icloud.com",
      avatar: "/placeholder.svg",
    });
  }, []);

  const signInWithPhone = useCallback(async (phoneNumber: string) => {
    toast.info(`Sending OTP to ${phoneNumber}...`);

    // Simulate OTP sending
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("OTP sent! Enter the code: 123456");

    // Auto-verify for demo
    setTimeout(async () => {
      await simulateAuth("phone", {
        name: "Krishna Singh",
        email: `${phoneNumber.replace(/\D/g, "")}@phone.kruger`,
        avatar: "/placeholder.svg",
      });
    }, 2000);
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      toast.info("Signing in with email...");
      return simulateAuth("email", {
        name: email.split("@")[0],
        email,
        avatar: "/placeholder.svg",
      });
    },
    [],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      toast.info("Creating account...");
      return simulateAuth("email", {
        name,
        email,
        avatar: "/placeholder.svg",
      });
    },
    [],
  );

  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      setState(initialState);
      localStorage.removeItem("kruger-user");
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  }, []);

  const upgradeToPremium = useCallback(async () => {
    if (!state.user) return false;

    toast.info("Upgrading to Premium...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const updatedUser = { ...state.user, premium: true };
      setState((prev) => ({ ...prev, user: updatedUser }));
      localStorage.setItem("kruger-user", JSON.stringify(updatedUser));

      toast.success("🎉 Welcome to Kruger Premium!");
      return true;
    } catch (error) {
      toast.error("Failed to upgrade to Premium");
      return false;
    }
  }, [state.user]);

  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      if (!state.user) return false;

      try {
        const updatedUser = { ...state.user, ...updates };
        setState((prev) => ({ ...prev, user: updatedUser }));
        localStorage.setItem("kruger-user", JSON.stringify(updatedUser));

        toast.success("Profile updated successfully");
        return true;
      } catch (error) {
        toast.error("Failed to update profile");
        return false;
      }
    },
    [state.user],
  );

  return {
    ...state,
    signInWithGoogle,
    signInWithFacebook,
    signInWithApple,
    signInWithPhone,
    signInWithEmail,
    signUp,
    signOut,
    upgradeToPremium,
    updateProfile,
  };
}
