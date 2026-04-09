import React, { useState } from 'react';
import { Icons } from './Icons';

function LoginScreen({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // For demo purposes, just log in with any credentials
    const user = {
      id: Date.now(),
      name: name || email.split('@')[0] || 'User',
      email: email || 'user@example.com',
      avatar: null
    };
    localStorage.setItem('wb_user', JSON.stringify(user));
    onLogin(user);
  };

  const handleGuestLogin = () => {
    const user = {
      id: Date.now(),
      name: 'Guest',
      email: 'guest@webbuilder.com',
      avatar: null,
      isGuest: true
    };
    localStorage.setItem('wb_user', JSON.stringify(user));
    onLogin(user);
  };

  return (
    <div className="login-screen">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo">
            <Icons.Sparkles />
          </div>
          <h1>WebBuilder</h1>
        </div>
        <div className="login-hero">
          <h2>Build beautiful websites without code</h2>
          <p>Drag and drop components, customize styles, and publish in minutes. No coding required.</p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-container">
          <h2>{isSignUp ? 'Create your account' : 'Welcome back'}</h2>
          <p className="login-subtitle">
            {isSignUp
              ? 'Start building amazing websites today'
              : 'Sign in to access your projects'}
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            {isSignUp && (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {!isSignUp && (
              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <button type="button" className="forgot-link">Forgot password?</button>
              </div>
            )}

            <button type="submit" className="login-btn-primary">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>

            <div className="login-divider">
              <span>or</span>
            </div>

            <button type="button" className="login-btn-guest" onClick={handleGuestLogin}>
              Continue as Guest
            </button>

            <div className="login-social">
              <button type="button" className="social-btn">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button type="button" className="social-btn">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </button>
            </div>
          </form>

          <p className="login-switch">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
