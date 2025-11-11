// src/pages/AdminLogin.jsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  TextInput,
  PasswordInput,
  Button,
  Container,
  Title,
  Stack,
  Paper,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminLogin() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Send login data to our new API endpoint
      await axios.post('/api/admin-login', data);

      // On success, show notification and redirect
      notifications.show({
        title: 'Login Successful',
        message: 'Redirecting to dashboard...',
        color: 'green',
      });
      navigate('/admin/dashboard');

    } catch (error) {
      console.error('Login Error:', error);
      notifications.show({
        title: 'Login Failed',
        message: 'Invalid email or password. Please try again.',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size="xs" p="md" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper withBorder shadow="md" p={30} radius="md" style={{ width: '100%' }}>
        <Title order={2} ta="center" mb="lg">
          Admin Login
        </Title>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack>
            <TextInput
              label="Email"
              placeholder="admin@example.com"
              withAsterisk
              {...register('email', { 
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/, message: 'Invalid email address' }
              })}
              error={errors.email?.message}
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              withAsterisk
              {...register('password', { required: 'Password is required' })}
              error={errors.password?.message}
            />
            <Button type="submit" size="md" mt="md" loading={isLoading}>
              Login
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

export default AdminLogin;