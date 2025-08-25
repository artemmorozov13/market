import * as Yup from 'yup'

export const createProfileValidationSchema = () => {
  return Yup.object().shape({
    name: Yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
    email: Yup.string().required('Email is required').email('Enter a valid email'),
    bio: Yup.string().optional().max(200, 'Bio cannot exceed 200 characters'),
    age: Yup.number().required('Age is required').min(18, 'Age must be at least 18'),
    gender: Yup.string().required('Gender is required'),
    location: Yup.string().required('Location is required'),
    avatar: Yup.string().url('Avatar must be a valid URL').optional(),
  })
}
