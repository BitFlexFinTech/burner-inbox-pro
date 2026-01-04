import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, ArrowRight, Chrome, Sparkles, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = isLogin 
        ? await login(formData.email, formData.password)
        : await signup(formData.email, formData.password, formData.name);

      if (result.success) {
        toast({
          title: isLogin ? "Welcome back!" : "Account created!",
          description: "Redirecting to dashboard...",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Error",
          description: result.error || "Authentication failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (type: "user" | "admin" | "enterprise") => {
    setIsLoading(true);
    
    const credentials = {
      user: { email: "demo@burnermail.app", password: "" },
      admin: { email: "demo@burnermail.app", password: "" },
      enterprise: { email: "tadii@bitflex.app", password: "12345678" },
    }[type];

    try {
      const result = await login(credentials.email, credentials.password);
      
      if (result.success) {
        toast({
          title: type === "enterprise" 
            ? "Logged in as Enterprise Admin" 
            : `Logged in as Demo ${type === "admin" ? "Admin" : "User"}`,
          description: "Redirecting...",
        });
        navigate(type === "user" ? "/dashboard" : "/admin");
      } else {
        toast({
          title: "Login Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Login failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-grid relative flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
          <Mail className="h-8 w-8 text-primary transition-all duration-300 group-hover:drop-shadow-[0_0_10px_hsl(185_100%_50%/0.8)]" />
          <span className="text-2xl font-bold tracking-tight">
            Burner<span className="text-primary">MAIL</span>
          </span>
        </Link>

        <Card variant="neon" className="backdrop-blur-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isLogin ? "Welcome back" : "Create your account"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Enter your credentials to access your inboxes"
                : "Start creating disposable emails in seconds"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Demo Login Buttons */}
            <div className="space-y-2">
              <Button
                variant="glass"
                className="w-full justify-start"
                onClick={() => handleDemoLogin("user")}
                disabled={isLoading}
              >
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                Login as Demo User
              </Button>
              <Button
                variant="glass"
                className="w-full justify-start"
                onClick={() => handleDemoLogin("admin")}
                disabled={isLoading}
              >
                <Sparkles className="mr-2 h-4 w-4 text-secondary" />
                Login as Demo Admin
              </Button>
              <Button
                variant="neon-magenta"
                className="w-full justify-start"
                onClick={() => handleDemoLogin("enterprise")}
                disabled={isLoading}
              >
                <Shield className="mr-2 h-4 w-4" />
                Login as Enterprise Admin (tadii@bitflex.app)
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google OAuth */}
            <Button variant="outline" className="w-full" disabled={isLoading}>
              <Chrome className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or with email
                </span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Your name"
                      className="pl-10"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {isLogin && (
                <div className="text-right">
                  <Button variant="link" className="px-0 text-xs" type="button">
                    Forgot password?
                  </Button>
                </div>
              )}

              <Button
                variant="neon"
                className="w-full shimmer"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Loading..."
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                className="text-primary hover:underline font-medium"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
