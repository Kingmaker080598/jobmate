// components/ApplicationProfileForm.js

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';

export default function ApplicationProfileForm({ user }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    location: '',
    linkedin_url: '',
    portfolio_url: '',
    gender: '',
    race_ethnicity: '',
    disability_status: '',
    veteran_status: '',
    work_auth_status: '',
    needs_sponsorship: '',
    willing_to_relocate: '',
    willing_to_travel: '',
    expected_salary: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('application_profile')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching application profile:', error);
      } else if (data) {
        setFormData(data);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    const { error } = await supabase
      .from('application_profile')
      .upsert({
        ...formData,
        user_id: user.id,
      }, { onConflict: ['user_id'] });

    if (error) {
      console.error('Error saving profile:', error);
      setMessage('Error saving profile.');
    } else {
      setMessage('Profile saved successfully!');
    }
    setLoading(false);
  };

  return (
    <Box className="modern-card">
      <Typography variant="h6" className="modern-text mb-3 font-semibold" style={{ color: '#1f2937' }}>
        Auto-Fill Application Details
      </Typography>

      <Box className="grid grid-cols-1 gap-4">
        <TextField name="first_name" label="First Name" value={formData.first_name} onChange={handleChange} fullWidth />
        <TextField name="last_name" label="Last Name" value={formData.last_name} onChange={handleChange} fullWidth />
        <TextField name="email" label="Email" value={formData.email} onChange={handleChange} fullWidth />
        <TextField name="phone" label="Phone" value={formData.phone} onChange={handleChange} fullWidth />
        <TextField name="location" label="Location" value={formData.location} onChange={handleChange} fullWidth />
        <TextField name="linkedin_url" label="LinkedIn URL" value={formData.linkedin_url} onChange={handleChange} fullWidth />
        <TextField name="portfolio_url" label="Portfolio URL" value={formData.portfolio_url} onChange={handleChange} fullWidth />

        {/* Demographic Fields */}
        <FormControl fullWidth>
          <InputLabel>Gender</InputLabel>
          <Select name="gender" value={formData.gender} onChange={handleChange}>
            <MenuItem value="">Prefer not to say</MenuItem>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Non-binary">Non-binary</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Race / Ethnicity</InputLabel>
          <Select name="race_ethnicity" value={formData.race_ethnicity} onChange={handleChange}>
            <MenuItem value="">Prefer not to say</MenuItem>
            <MenuItem value="Hispanic or Latino">Hispanic or Latino</MenuItem>
            <MenuItem value="White">White</MenuItem>
            <MenuItem value="Black or African American">Black or African American</MenuItem>
            <MenuItem value="Asian">Asian</MenuItem>
            <MenuItem value="Native Hawaiian or Other Pacific Islander">Native Hawaiian or Other Pacific Islander</MenuItem>
            <MenuItem value="American Indian or Alaska Native">American Indian or Alaska Native</MenuItem>
            <MenuItem value="Two or more races">Two or more races</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Disability Status</InputLabel>
          <Select name="disability_status" value={formData.disability_status} onChange={handleChange}>
            <MenuItem value="">Prefer not to say</MenuItem>
            <MenuItem value="Yes, I have a disability">Yes, I have a disability</MenuItem>
            <MenuItem value="No, I do not have a disability">No, I do not have a disability</MenuItem>
            <MenuItem value="I don&#39;t wish to answer">I don&#39;t wish to answer</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Veteran Status</InputLabel>
          <Select name="veteran_status" value={formData.veteran_status} onChange={handleChange}>
            <MenuItem value="">Prefer not to say</MenuItem>
            <MenuItem value="I am a veteran">I am a veteran</MenuItem>
            <MenuItem value="I am not a veteran">I am not a veteran</MenuItem>
            <MenuItem value="I don&#39;t wish to answer">I don&#39;t wish to answer</MenuItem>
          </Select>
        </FormControl>

        {/* Legal & Availability Fields */}
        <FormControl fullWidth>
          <InputLabel>Work Authorization Status</InputLabel>
          <Select name="work_auth_status" value={formData.work_auth_status} onChange={handleChange}>
            <MenuItem value="">Prefer not to say</MenuItem>
            <MenuItem value="Authorized to work in the US">Authorized to work in the US</MenuItem>
            <MenuItem value="Need sponsorship now">Need sponsorship now</MenuItem>
            <MenuItem value="Need sponsorship in future">Need sponsorship in future</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Do you need sponsorship?</InputLabel>
          <Select name="needs_sponsorship" value={formData.needs_sponsorship} onChange={handleChange}>
            <MenuItem value="">Prefer not to say</MenuItem>
            <MenuItem value="Yes">Yes</MenuItem>
            <MenuItem value="No">No</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Willing to relocate?</InputLabel>
          <Select name="willing_to_relocate" value={formData.willing_to_relocate} onChange={handleChange}>
            <MenuItem value="">Prefer not to say</MenuItem>
            <MenuItem value="Yes">Yes</MenuItem>
            <MenuItem value="No">No</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Willing to travel?</InputLabel>
          <Select name="willing_to_travel" value={formData.willing_to_travel} onChange={handleChange}>
            <MenuItem value="">Prefer not to say</MenuItem>
            <MenuItem value="Yes">Yes</MenuItem>
            <MenuItem value="No">No</MenuItem>
          </Select>
        </FormControl>

        <TextField name="expected_salary" label="Expected Salary" value={formData.expected_salary} onChange={handleChange} fullWidth />
      </Box>

      {message && (
        <Typography className={message.includes('Error') ? 'error-text' : 'success-text'} style={{ marginTop: '1rem' }}>
          {message}
        </Typography>
      )}

      <Button
        className="modern-button mt-4"
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save Details'}
      </Button>
    </Box>
  );
}
