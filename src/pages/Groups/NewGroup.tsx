import React, { useState } from 'react';
import { TextField, Button, Box, Typography, MenuItem } from '@mui/material';
import { useAuth } from '../../context/Authentication/useAuth';
import { useNavigate } from 'react-router-dom';

const CreateGroupForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    group_name: '',
    category: '',
  });
  const navigate = useNavigate();

  const categories = ['Household', 'Trip', 'Event', 'Project', 'Other'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // This matches your MySQL schema structure
    const newGroup = {
      ...formData,
      group_id: crypto.randomUUID(), // Client-side UUID generation
      created_by: user?.userId,    // From your useAuth state
      status: 'ACTIVE'
    };

    console.log("Submitting to MySQL:", newGroup);
    // Add your axios/fetch call here to POST to your backend
    navigate("/groups");
  };

  return (
    <Box p={3} width={'100%'} mt={2}>
      <Typography variant="h5" gutterBottom>Create a New Group</Typography>
      <br /><br />
      <Box component="form" onSubmit={handleSubmit} width={'80%'} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Group Name"
          name="group_name"
          variant="outlined"
          required
          value={formData.group_name}
          onChange={handleChange}
          fullWidth
        />
        <br />

        <TextField
          select
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          fullWidth
        >
          {categories.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <br />
        
        <Button 
          type="submit" 
          variant="contained" 
          size="large"
          sx={{ width: '130px' }}
          disabled={!formData.group_name}
        >
          Create Group
        </Button>
      </Box>
    </Box>
  );
};

export default CreateGroupForm;