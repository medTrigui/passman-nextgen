import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function Profile() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  // Fetch current user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: userApi.getCurrentUser,
    onSuccess: (data) => {
      setUsername(data.username);
      setEmail(data.email);
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: { username?: string; email?: string }) =>
      userApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setError('');
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      userApi.updateProfile({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setError('');
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: userApi.deleteAccount,
    onSuccess: () => {
      logout();
      navigate('/login');
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile?.username === username && profile?.email === email) {
      return;
    }
    await updateProfileMutation.mutateAsync({ username, email });
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }
    await updatePasswordMutation.mutateAsync({
      currentPassword,
      newPassword,
    });
  };

  const handleDeleteAccount = async () => {
    setIsDeleteDialogOpen(false);
    await deleteAccountMutation.mutateAsync();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        Loading...
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Profile Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Profile Information */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Profile Information
          </Typography>
          <Box component="form" onSubmit={handleProfileUpdate}>
            <TextField
              margin="normal"
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 2 }}
              disabled={updateProfileMutation.isPending}
            >
              Update Profile
            </Button>
          </Box>
        </Paper>

        {/* Change Password */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Change Password
          </Typography>
          <Box component="form" onSubmit={handlePasswordUpdate}>
            <TextField
              margin="normal"
              fullWidth
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <TextField
              margin="normal"
              fullWidth
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Confirm New Password"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 2 }}
              disabled={updatePasswordMutation.isPending}
            >
              Change Password
            </Button>
          </Box>
        </Paper>

        {/* Delete Account */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Danger Zone
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Once you delete your account, there is no going back. Please be certain.
          </Typography>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            Delete Account
          </Button>
        </Paper>
      </Stack>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your account? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            disabled={deleteAccountMutation.isPending}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 