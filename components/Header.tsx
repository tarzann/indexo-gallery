import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box
} from '@mui/material';
import { useRouter } from 'next/router';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import HomeIcon from '@mui/icons-material/Home';

export default function Header() {
  const router = useRouter();

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Indexo Gallery
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            color="inherit" 
            startIcon={<HomeIcon />}
            onClick={() => router.push('/')}
            sx={{ 
              backgroundColor: router.pathname === '/' ? 'rgba(255,255,255,0.1)' : 'transparent'
            }}
          >
            דף ראשי
          </Button>
          
          <Button 
            color="inherit" 
            startIcon={<FolderOpenIcon />}
            onClick={() => router.push('/projects')}
            sx={{ 
              backgroundColor: router.pathname === '/projects' ? 'rgba(255,255,255,0.1)' : 'transparent'
            }}
          >
            פרויקטים
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
} 