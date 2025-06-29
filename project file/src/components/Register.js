import React, { useState } from 'react';
import { register } from '../api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    usertype: 'customer', // Your server requires this field
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { username, email, password, usertype } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Here we call the imported `register` function
      const response = await register({ username, email, password, usertype });
      
      setSuccess('Registration successful! You can now log in.');
      console.log('Registration successful:', response.data);
    } catch (err) {
      // Display error message from the server, or a generic one
      const errorMessage = err.response?.data?.message || 'An error occurred during registration.';
      setError(errorMessage);
      console.error('Registration error:', errorMessage);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleRegister}>
        <div>
          <label>Username:</label>
          <input type="text" name="username" value={username} onChange={onChange} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={email} onChange={onChange} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" name="password" value={password} onChange={onChange} required />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;