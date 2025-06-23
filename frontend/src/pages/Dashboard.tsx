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
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { passwordsApi } from '../services/api';
import type { Password } from '../types';
import PasswordDialog from '../components/PasswordDialog';

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPassword, setSelectedPassword] = useState<Password | undefined>();
  const queryClient = useQueryClient();

  const {
    data: passwords = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['passwords'],
    queryFn: passwordsApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: passwordsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passwords'] });
    },
  });

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this password?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleAdd = () => {
    setSelectedPassword(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (password: Password) => {
    setSelectedPassword(password);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPassword(undefined);
  };

  const filteredPasswords = passwords.filter((password: Password) =>
    password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    password.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    password.url?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading passwords: {error instanceof Error ? error.message : 'Unknown error'}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Password Vault
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
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

      {deleteMutation.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error deleting password: {deleteMutation.error instanceof Error ? deleteMutation.error.message : 'Unknown error'}
        </Alert>
      )}

      <Grid container spacing={3}>
        {filteredPasswords.map((password: Password) => (
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
                  <IconButton color="primary" onClick={() => handleEdit(password)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(password.id)}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? <CircularProgress size={24} /> : <DeleteIcon />}
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <PasswordDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        password={selectedPassword}
      />
    </Box>
  );
} 