import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/contexts/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  Building, 
  MapPin, 
  DollarSign, 
  Trash2, 
  ExternalLink
} from 'lucide-react';
import { Typography, Button, Chip, Dialog, DialogTitle, DialogContent, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import toast from 'react-hot-toast';

const ApplicationTracker = () => {
  const { user } = useUser();
  const [columns, setColumns] = useState({
    applied: { id: 'applied', title: 'Applied', items: [] },
    screening: { id: 'screening', title: 'Phone/Video Screening', items: [] },
    interview: { id: 'interview', title: 'Interview', items: [] },
    final: { id: 'final', title: 'Final Round', items: [] },
    offer: { id: 'offer', title: 'Offer', items: [] },
    rejected: { id: 'rejected', title: 'Rejected', items: [] }
  });
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newApplicationDialog, setNewApplicationDialog] = useState(false);
  const [formData, setFormData] = useState({
    job_title: '',
    company: '',
    location: '',
    salary: '',
    job_url: '',
    notes: '',
    status: 'applied',
    applied_date: new Date().toISOString().split('T')[0]
  });

  const fetchApplications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('applied_at', { ascending: false });

      if (error) throw error;

      // Organize applications by status
      const organized = {
        applied: { id: 'applied', title: 'Applied', items: [] },
        screening: { id: 'screening', title: 'Phone/Video Screening', items: [] },
        interview: { id: 'interview', title: 'Interview', items: [] },
        final: { id: 'final', title: 'Final Round', items: [] },
        offer: { id: 'offer', title: 'Offer', items: [] },
        rejected: { id: 'rejected', title: 'Rejected', items: [] }
      };

      data.forEach(app => {
        const status = app.status || 'applied';
        if (organized[status]) {
          organized[status].items.push(app);
        }
      });

      setColumns(organized);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    }
  }, [user.id]);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user, fetchApplications]);

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;
      toast.success('Application status updated');
      fetchApplications();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleSaveApplication = async () => {
    try {
      if (selectedApplication) {
        // Update existing
        const { error } = await supabase
          .from('job_applications')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedApplication.id);

        if (error) throw error;
        toast.success('Application updated');
      } else {
        // Create new
        const { error } = await supabase
          .from('job_applications')
          .insert({
            ...formData,
            user_id: user.id,
            applied_at: new Date().toISOString()
          });

        if (error) throw error;
        toast.success('Application added');
      }

      setEditDialogOpen(false);
      setNewApplicationDialog(false);
      setSelectedApplication(null);
      resetForm();
      fetchApplications();
    } catch (error) {
      console.error('Error saving application:', error);
      toast.error('Failed to save application');
    }
  };

  const handleDeleteApplication = async (id) => {
    if (!confirm('Are you sure you want to delete this application?')) return;

    try {
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Application deleted');
      fetchApplications();
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Failed to delete application');
    }
  };

  const resetForm = () => {
    setFormData({
      job_title: '',
      company: '',
      location: '',
      salary: '',
      job_url: '',
      notes: '',
      status: 'applied',
      applied_date: new Date().toISOString().split('T')[0]
    });
  };

  const openEditDialog = (application) => {
    setSelectedApplication(application);
    setFormData({
      job_title: application.job_title || '',
      company: application.company || '',
      location: application.location || '',
      salary: application.salary || '',
      job_url: application.job_url || '',
      notes: application.notes || '',
      status: application.status || 'applied',
      applied_date: application.applied_at ? new Date(application.applied_at).toISOString().split('T')[0] : ''
    });
    setEditDialogOpen(true);
  };

  const ApplicationCard = ({ application }) => {
    return (
      <motion.div
        layout
        className="bg-white rounded-lg shadow-md p-4 mb-3 border border-gray-200 cursor-pointer transition-all hover:shadow-lg"
        onClick={() => openEditDialog(application)}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <Typography variant="h6" className="font-semibold text-gray-900 text-sm">
              {application.job_title}
            </Typography>
            <div className="flex items-center gap-1 text-gray-600 text-xs mt-1">
              <Building className="w-3 h-3" />
              <span>{application.company}</span>
            </div>
          </div>
          <div className="flex gap-1">
            {application.job_url && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(application.job_url, '_blank');
                }}
                className="p-1 text-gray-400 hover:text-blue-600"
              >
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteApplication(application.id);
              }}
              className="p-1 text-gray-400 hover:text-red-600"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {application.location && (
          <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
            <MapPin className="w-3 h-3" />
            <span>{application.location}</span>
          </div>
        )}

        {application.salary && (
          <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
            <DollarSign className="w-3 h-3" />
            <span>{application.salary}</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-gray-400 text-xs">
          <Calendar className="w-3 h-3" />
          <span>
            {application.applied_at 
              ? new Date(application.applied_at).toLocaleDateString()
              : 'No date'
            }
          </span>
        </div>

        {application.notes && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
            {application.notes.substring(0, 100)}
            {application.notes.length > 100 && '...'}
          </div>
        )}

        {/* Status change buttons */}
        <div className="mt-3 flex flex-wrap gap-1">
          {Object.keys(columns).map(status => (
            application.status !== status && (
              <button
                key={status}
                onClick={(e) => {
                  e.stopPropagation();
                  updateApplicationStatus(application.id, status);
                }}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Move to {columns[status].title}
              </button>
            )
          ))}
        </div>
      </motion.div>
    );
  };

  const Column = ({ column }) => (
    <div className="bg-gray-50 rounded-lg p-4 min-h-[500px]">
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h6" className="font-semibold text-gray-900">
          {column.title}
        </Typography>
        <Chip 
          label={column.items.length} 
          size="small" 
          className="bg-white"
        />
      </div>
      
      <div className="min-h-[400px]">
        <AnimatePresence>
          {column.items.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Typography variant="h4" className="font-bold text-gray-900">
              Application Tracker
            </Typography>
            <Typography className="text-gray-600 mt-1">
              Track your job applications through the hiring process
            </Typography>
          </div>
          <Button
            variant="contained"
            startIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              resetForm();
              setNewApplicationDialog(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add Application
          </Button>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {Object.values(columns).map(column => (
            <Column key={column.id} column={column} />
          ))}
        </div>

        {/* Edit/Add Application Dialog */}
        <Dialog 
          open={editDialogOpen || newApplicationDialog} 
          onClose={() => {
            setEditDialogOpen(false);
            setNewApplicationDialog(false);
            setSelectedApplication(null);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedApplication ? 'Edit Application' : 'Add New Application'}
          </DialogTitle>
          <DialogContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <TextField
                label="Job Title"
                value={formData.job_title}
                onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                fullWidth
                required
              />
              <TextField
                label="Company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                fullWidth
                required
              />
              <TextField
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Salary"
                value={formData.salary}
                onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Job URL"
                value={formData.job_url}
                onChange={(e) => setFormData(prev => ({ ...prev, job_url: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Applied Date"
                type="date"
                value={formData.applied_date}
                onChange={(e) => setFormData(prev => ({ ...prev, applied_date: e.target.value }))}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  label="Status"
                >
                  <MenuItem value="applied">Applied</MenuItem>
                  <MenuItem value="screening">Phone/Video Screening</MenuItem>
                  <MenuItem value="interview">Interview</MenuItem>
                  <MenuItem value="final">Final Round</MenuItem>
                  <MenuItem value="offer">Offer</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </div>
            <TextField
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              fullWidth
              multiline
              rows={4}
              className="mt-4"
            />
            <div className="flex justify-end gap-2 mt-6">
              <Button
                onClick={() => {
                  setEditDialogOpen(false);
                  setNewApplicationDialog(false);
                  setSelectedApplication(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveApplication}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {selectedApplication ? 'Update' : 'Add'} Application
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ApplicationTracker;