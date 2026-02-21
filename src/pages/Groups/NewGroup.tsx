import React, { useState } from 'react';
import { TextField, Button, Box, Typography, MenuItem } from '@mui/material';
import { useAuth } from '../../context/Authentication/useAuth';
import { useNavigate } from 'react-router-dom';
import groupService from '../../services/groupService';
import { toast } from 'react-toastify';

const CreateGroupForm = () => {
  const { user, jwtToken } = useAuth();
  const [formData, setFormData] = useState({
    groupName: '',
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
      admin: user?.name
    };

    console.log("Submitting to MySQL:", newGroup);
    try {
          const response = await groupService.create(newGroup, jwtToken || "");
          if (response) {
            toast.success("Successfully created group.")
            navigate("/groups");
          }
        } catch (err) {
          toast.error((err as any).response?.data?.message || "Failed to create group");
        }
  };

  return (
    <Box p={3} width={'100%'} mt={2}>
      <Typography variant="h5" gutterBottom>Create a New Group</Typography>
      <br /><br />
      <Box component="form" onSubmit={handleSubmit} width={'80%'} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Group Name"
          name="groupName"
          variant="outlined"
          required
          value={formData.groupName}
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
          disabled={!formData.groupName}
        >
          Create Group
        </Button>
      </Box>
    </Box>
  );
};

export default CreateGroupForm;