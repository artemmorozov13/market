'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material'
import { fetchUserProfile, saveUserProfile } from '../api/api'
import { createProfileValidationSchema } from '../lib/validationSchema'

import styles from './UserProfileForm.module.css'

export const UserProfileForm: React.FC = () => {
  const validationSchema = createProfileValidationSchema()
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: '',
      email: '',
      bio: '',
      age: 0,
      gender: '',
      location: '',
      avatar: '',
    },
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await fetchUserProfile()
        reset(data)
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [reset])

  const onSubmit = async (data: any) => {
    setSaving(true)
    try {
      await saveUserProfile(data)
    } catch (err) {
      console.error('Error saving profile:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box className={styles.formContainer}>
        <Skeleton variant="circular" width={100} height={100} />
        <Skeleton variant="text" width="80%" height={30} />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="rectangular" width="100%" height={40} />
        <Skeleton variant="rectangular" width="100%" height={40} />
        <Skeleton variant="rectangular" width="100%" height={40} />
        <Skeleton variant="rectangular" width="100%" height={40} />
        <Skeleton variant="rectangular" width="100%" height={40} />
        <Skeleton variant="rectangular" width="100%" height={40} />
      </Box>
    )
  }

  return (
    <Box className={styles.formContainer}>
      <Typography variant="h5" gutterBottom>
        User Profile
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          {/* Avatar Field */}
          <Controller
            name="avatar"
            control={control}
            render={({ field }) => (
              <>
                <Avatar src={field.value} alt="User Avatar" sx={{ width: 100, height: 100 }} />
                <Button variant="outlined" component="label" sx={{ ml: 2 }}>
                  Upload
                  <input
                    type="file"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = () => field.onChange(reader.result as string)
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                </Button>
              </>
            )}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Name Field */}
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Name"
                variant="outlined"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />

          {/* Email Field */}
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                variant="outlined"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />

          {/* Bio Field */}
          <Controller
            name="bio"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Bio"
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                error={!!errors.bio}
                helperText={errors.bio?.message}
              />
            )}
          />

          {/* Age Field */}
          <Controller
            name="age"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Age"
                variant="outlined"
                fullWidth
                type="number"
                error={!!errors.age}
                helperText={errors.age?.message}
              />
            )}
          />

          {/* Gender Field */}
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Gender"
                select
                variant="outlined"
                fullWidth
                error={!!errors.gender}
                helperText={errors.gender?.message}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            )}
          />

          {/* Location Field */}
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Location"
                variant="outlined"
                fullWidth
                error={!!errors.location}
                helperText={errors.location?.message}
              />
            )}
          />
        </Box>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={saving}
          className={styles.submitButton}
        >
          {saving ? <CircularProgress size={24} /> : 'Save Profile'}
        </Button>
      </form>
    </Box>
  )
}
