import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import progressUpdateApi from '../api/progressApi';
import './ProgressPage.css'; // Import the CSS file

// Set app element for accessibility
Modal.setAppElement('#root');

const ProgressPage = () => {
  const [progressUpdates, setProgressUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    update: '',
    goalsAchieved: false
  });

  const userId = localStorage.getItem('userId');

  // Fetch all progress updates
  useEffect(() => {
    const fetchProgressUpdates = async () => {
      try {
        setLoading(true);
        const data = await progressUpdateApi.getAllProgressUpdates();
        setProgressUpdates(data);
      } catch (error) {
        console.error('Error fetching progress updates:', error);
        toast.error('Failed to load progress updates');
      } finally {
        setLoading(false);
      }
    };

    fetchProgressUpdates();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Open modal for creating new progress update
  const openCreateModal = () => {
    setCurrentProgress(null);
    setFormData({
      title: '',
      update: '',
      goalsAchieved: false
    });
    setIsModalOpen(true);
  };

  // Open modal for editing progress update
  const openEditModal = (progress) => {
    setCurrentProgress(progress);
    setFormData({
      title: progress.title,
      update: progress.update,
      goalsAchieved: progress.goalsAchieved
    });
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Submit form (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.update) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const progressData = {
        ...formData,
        user: { id: userId }
      };
      
      if (currentProgress) {
        // Update existing progress
        await progressUpdateApi.updateProgressUpdate(currentProgress.id, progressData);
        toast.success('Progress update modified successfully');
      } else {
        // Create new progress update
        await progressUpdateApi.createProgressUpdate(progressData);
        toast.success('Progress update created successfully');
      }
      
      // Refresh progress updates list
      const updatedProgressList = await progressUpdateApi.getAllProgressUpdates();
      setProgressUpdates(updatedProgressList);
      closeModal();
    } catch (error) {
      console.error('Error saving progress update:', error);
      toast.error(currentProgress ? 'Failed to update progress' : 'Failed to create progress update');
    } finally {
      setLoading(false);
    }
  };

  // Delete progress update
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this progress update?')) {
      try {
        setLoading(true);
        await progressUpdateApi.deleteProgressUpdate(id);
        toast.success('Progress update deleted successfully');
        
        // Refresh progress updates list
        const updatedProgressList = await progressUpdateApi.getAllProgressUpdates();
        setProgressUpdates(updatedProgressList);
      } catch (error) {
        console.error('Error deleting progress update:', error);
        toast.error('Failed to delete progress update');
      } finally {
        setLoading(false);
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && progressUpdates.length === 0) {
    return (
      <div className="progress-page-loading">
        <div className="progress-spinner"></div>
      </div>
    );
  }

  return (
    <div className="progress-page-container">
      <div className="progress-header">
        <h1>Progress Updates</h1>
        {userId && (
          <button onClick={openCreateModal} className="add-progress-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Progress Update
          </button>
        )}
      </div>

      {progressUpdates.length === 0 ? (
        <div className="empty-state">
          <p>No progress updates yet. Start tracking your learning journey!</p>
        </div>
      ) : (
        <div className="progress-grid">
          {progressUpdates.map((progress) => (
            <div 
              key={progress.id} 
              className={`progress-card ${progress.goalsAchieved ? 'goals-achieved' : ''}`}
            >
              <div className="progress-card-header">
                <h3>{progress.title}</h3>
                <div className="progress-meta">
                  <span>{formatDate(progress.createdAt)}</span>
                  {progress.goalsAchieved && (
                    <span className="achieved-badge">
                      Goals Achieved
                    </span>
                  )}
                </div>
              </div>
              <div className="progress-card-body">
                <p>{progress.update}</p>
                
                {userId === progress.userId && (
                  <div className="progress-actions">
                    <button
                      onClick={() => openEditModal(progress)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(progress.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="progress-modal"
        overlayClassName="progress-modal-overlay"
        contentLabel="Progress Update Modal"
      >
        <div className="modal-header">
          <h2>
            {currentProgress ? 'Edit Progress Update' : 'Add Progress Update'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">
              Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g. Completed Week 1 Goals"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="update">
              Progress Details <span className="required">*</span>
            </label>
            <textarea
              id="update"
              name="update"
              value={formData.update}
              onChange={handleInputChange}
              rows="4"
              placeholder="Describe your progress and achievements"
              required
            ></textarea>
          </div>
          
          <div className="form-checkbox">
            <input
              type="checkbox"
              id="goalsAchieved"
              name="goalsAchieved"
              checked={formData.goalsAchieved}
              onChange={handleInputChange}
            />
            <label htmlFor="goalsAchieved">
              Goals Achieved
            </label>
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              onClick={closeModal}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="loading-indicator">
                  <svg className="spinner" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                  Processing...
                </span>
              ) : currentProgress ? 'Update' : 'Submit'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProgressPage;