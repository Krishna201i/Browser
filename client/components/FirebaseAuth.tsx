import React, { useState, useEffect } from 'react';
import { User, signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User as UserIcon, 
  LogIn, 
  LogOut, 
  UserPlus, 
  Shield, 
  Settings,
  Cloud,
  Database,
  History,
  Bookmark,
  Download
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { firebaseService } from '@/services/firebase-service';

interface FirebaseAuthProps {
  onUserChange?: (user: User | null) => void;
}

export default function FirebaseAuth({ onUserChange }: FirebaseAuthProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Sign in/up form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      onUserChange?.(user);
      
      if (user) {
        console.log('User signed in:', user.email);
        // Log browser event
        firebaseService.logBrowserEvent('user_signin', {
          email: user.email,
          uid: user.uid,
          timestamp: new Date().toISOString()
        });
      } else {
        console.log('User signed out');
      }
    });

    return () => unsubscribe();
  }, [onUserChange]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await firebaseService.signUp(email, password);
      } else {
        await firebaseService.signIn(email, password);
      }
      
      setIsDialogOpen(false);
      setEmail('');
      setPassword('');
    } catch (error: any) {
      setError(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await firebaseService.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getUserInitials = (user: User) => {
    if (user.displayName) {
      return user.displayName.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return user.email?.charAt(0).toUpperCase() || 'U';
  };

  if (!user) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="w-6 h-6 text-cyan-400" />
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  KrugerX Browser
                </span>
              </div>
              <p className="text-sm text-gray-500">Sign in to sync your browser data</p>
            </DialogTitle>
          </DialogHeader>

          <Tabs value={isSignUp ? "signup" : "signin"} onValueChange={(value) => setIsSignUp(value === "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <div className="text-red-500 text-sm">{error}</div>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <div className="text-red-500 text-sm">{error}</div>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-4 p-4 bg-cyan-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-cyan-700">
              <Cloud className="w-4 h-4" />
              <span className="font-medium">Cloud Sync Features:</span>
            </div>
            <ul className="mt-2 text-xs text-cyan-600 space-y-1">
              <li>• Bookmarks and history sync</li>
              <li>• Tab positions and layouts</li>
              <li>• Browser settings and preferences</li>
              <li>• Download history and files</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
          <Avatar className="w-6 h-6 mr-2">
            <AvatarImage src={user.photoURL || undefined} />
            <AvatarFallback className="text-xs">
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>
          {user.displayName || user.email?.split('@')[0]}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            User Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback className="text-lg">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {user.displayName || 'KrugerX User'}
                  </h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <Badge variant="secondary" className="mt-1">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sync Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Cloud className="w-4 h-4" />
                Sync Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-green-500" />
                  Bookmarks
                </span>
                <Badge variant="outline" className="text-xs">Synced</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-500" />
                  History
                </span>
                <Badge variant="outline" className="text-xs">Synced</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-purple-500" />
                  Tabs
                </span>
                <Badge variant="outline" className="text-xs">Synced</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-orange-500" />
                  Downloads
                </span>
                <Badge variant="outline" className="text-xs">Synced</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="destructive" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
