import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { passwordsApi } from '../services/api';
import type { PasswordEntry } from '../types';

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const { data: passwords = [], isLoading, error } = useQuery({
    queryKey: ['passwords'],
    queryFn: passwordsApi.getAll,
  });

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredPasswords = passwords.filter((password: PasswordEntry) =>
    password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    password.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    password.url?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error loading passwords</Typography>;
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Password Vault
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add Password
        </Button>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search passwords..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 4 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <Grid container spacing={3}>
        {filteredPasswords.map((password: PasswordEntry) => (
          <Grid item xs={12} sm={6} md={4} key={password.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  {password.title}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {password.username}
                </Typography>
                {password.url && (
                  <Typography color="textSecondary" gutterBottom>
                    {password.url}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <TextField
                    type={visiblePasswords[password.id] ? 'text' : 'password'}
                    value={password.password}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => togglePasswordVisibility(password.id)}>
                            {visiblePasswords[password.id] ? (
                              <VisibilityOffIcon />
                            ) : (
                              <VisibilityIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    fullWidth
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <IconButton color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
} 