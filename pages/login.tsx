import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Container, 
  Paper,
  Alert
} from '@mui/material';

export default function Login() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', { email, password });
      
      const requestBody = JSON.stringify({ email, password });
      console.log('Request body:', requestBody);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        console.log('Login successful, sending message to Figma plugin');
        // Send success message to Figma plugin
        if (window.opener) {
          window.opener.postMessage({
            type: 'login-success',
            token: data.token,
            user: data.user
          }, '*');
          console.log('Message sent to Figma plugin via window.opener');
        } else {
          // Try to send to parent window
          window.parent.postMessage({
            type: 'login-success',
            token: data.token,
            user: data.user
          }, '*');
          console.log('Message sent to Figma plugin via window.parent');
        }
        
        // Also try to send to all windows
        try {
          window.postMessage({
            type: 'login-success',
            token: data.token,
            user: data.user
          }, '*');
          console.log('Message sent to all windows via window.postMessage');
        } catch (e) {
          console.log('Could not send to all windows:', e);
        }
        
        // Store token in localStorage as backup
        try {
          localStorage.setItem('figma_web_token', data.token);
          localStorage.setItem('figma_web_user', JSON.stringify(data.user));
          console.log('Token stored in localStorage as backup');
        } catch (e) {
          console.log('Could not store in localStorage:', e);
        }
        
        // Also store in cookie as backup
        try {
          document.cookie = `figma_web_token=${data.token}; path=/; max-age=3600`;
          document.cookie = `figma_web_user=${encodeURIComponent(JSON.stringify(data.user))}; path=/; max-age=3600`;
          console.log('Token stored in cookie as backup');
        } catch (e) {
          console.log('Could not store in cookie:', e);
        }
        
        // Try to use BroadcastChannel to communicate with Figma plugin
        try {
          const channel = new BroadcastChannel('figma-login');
          channel.postMessage({
            type: 'login-success',
            token: data.token,
            user: data.user
          });
          console.log('Message sent via BroadcastChannel');
        } catch (e) {
          console.log('Could not use BroadcastChannel:', e);
        }
        
        // Show success message and close after longer delay
        setError(''); // Clear any previous errors
        setLoading(false);
        
        // Show success message
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #4caf50;
          color: white;
          padding: 20px;
          border-radius: 8px;
          z-index: 1000;
          text-align: center;
        `;
        successDiv.innerHTML = `
          <div>✅ Login Successful!</div>
          <div style="font-size: 12px; margin-top: 8px;">Redirecting to Figma plugin...</div>
        `;
        document.body.appendChild(successDiv);
        
        // Close the window after a longer delay
        setTimeout(() => {
          window.close();
        }, 3000);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            🌐 Figma Index Platform
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Login to upload your Figma indices
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </Button>
          </Box>

          <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 2 }}>
            Test credentials: admin@example.com / admin123
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
