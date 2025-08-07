import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { useRouter } from 'next/router';

type IndexFile = {
  filename: string; // This is now the database ID
  projectId: string;
  figmaFileKey: string;
  fileName: string;
  timestamp: string;
  uploadedAt: string;
  size: number;
  frameCount: number;
  thumbnailCount: number;
};

export default function Projects() {
  const [files, setFiles] = useState<IndexFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/index-files');
      const data = await response.json();
      if (data.success) {
        setFiles(data.files);
      } else {
        setError('Failed to load files');
      }
    } catch (err) {
      setError('Error loading files');
      console.error('Error loading files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleViewIndex = (id: string) => {
    router.push(`/?index=${encodeURIComponent(id)}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        פרויקטי אינדקס
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {files.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              אין קבצי אינדקס
            </Typography>
            <Typography color="text.secondary">
              העלה אינדקס מהפלאגין כדי לראות אותו כאן
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
          {files.map((file) => (
            <Box key={file.filename}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {file.fileName}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {file.frameCount} עמודים, {file.thumbnailCount} תמונות
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    גודל: {formatFileSize(file.size)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    הועלה: {new Date(file.uploadedAt).toLocaleString('he-IL')}
                  </Typography>
                  
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={() => handleViewIndex(file.filename)}
                    sx={{ mt: 2 }}
                  >
                    צפה באינדקס
                  </Button>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
} 