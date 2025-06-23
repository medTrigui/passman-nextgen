import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { passwordsApi } from '../services/api';
import type { Password, PasswordCreate, PasswordUpdate } from '../types';

interface PasswordDialogProps {
  open: boolean;
  onClose: () => void;
  password?: Password;
}

export default function PasswordDialog({ open, onClose, password }: PasswordDialogProps) {
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (password) {
      setTitle(password.title);
      setUsername(password.username);
      setNewPassword(password.password);
      setUrl(password.url || '');
      setNotes(password.notes || '');
      setTags(password.tags);
    } else {
      setTitle('');
      setUsername('');
      setNewPassword('');
      setUrl('');
      setNotes('');
      setTags([]);
    }
  }, [password]);

  const createMutation = useMutation({
    mutationFn: passwordsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passwords'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PasswordUpdate }) =>
      passwordsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passwords'] });
      onClose();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: PasswordCreate = {
      title,
      username,
      password: newPassword,
      url: url || undefined,
      notes: notes || undefined,
      tags,
    };

    if (password) {
      await updateMutation.mutateAsync({
        id: password.id,
        data,
      });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{password ? 'Edit Password' : 'Add Password'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error instanceof Error ? error.message : 'An error occurred'}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              fullWidth
            />
            <TextField
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Tags"
              value={tags.join(', ')}
              onChange={(e) => setTags(e.target.value.split(',').map((tag) => tag.trim()))}
              helperText="Separate tags with commas"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? (
              <CircularProgress size={24} />
            ) : password ? (
              'Save Changes'
            ) : (
              'Add Password'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 