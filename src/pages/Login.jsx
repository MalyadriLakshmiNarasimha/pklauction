import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, loginError, clearLoginError } = useAuth();
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/lobby', { replace: true });
    }
  }, [isAuthenticated, navigate, user]);

  useEffect(() => {
    if (loginError) {
      setFormError(loginError.message);
    }
  }, [loginError]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError('');

    login()
      .then(() => {
        clearLoginError();
      })
      .catch((error) => {
        setFormError(error.message || 'Unable to sign in.');
      });
  };

  return (
    <div className="min-h-screen pt-20 px-4 pb-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-24 left-10 w-72 h-72 bg-pkl-green/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-pkl-yellow/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pkl-green/10 border border-pkl-green/20 text-pkl-green text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Login to continue to PKL Auction
          </div>
          <div className="space-y-4 max-w-2xl">
            <h1 className="font-cardo text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-foreground">
              Sign in with Google and enter the
              <span className="block bg-gradient-to-r from-pkl-green via-pkl-yellow to-pkl-green bg-clip-text text-transparent">
                auction room
              </span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              You will be redirected through Supabase Google auth. After sign in, your name is pulled from your Google profile or email prefix.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-pkl-green" />
            The account menu will show your signed-in name after auth completes.
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-2xl"
        >
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Login</p>
            <h2 className="font-cardo text-3xl font-bold text-foreground mt-2">Welcome back</h2>
          </div>

          <div className="space-y-4">
            {formError ? (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">
                {formError}
              </p>
            ) : null}

            <Button onClick={handleSubmit} className="w-full h-12 bg-pkl-green hover:bg-pkl-green/90 text-white text-base font-semibold rounded-xl group">
              Continue with Google
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              Back to home
            </Link>
            <span>Use Google to sign in.</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}