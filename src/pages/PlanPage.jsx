import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import learningPlanApi from '../api/planApi';
import userApi from '../api/userApi';
import './PlanPage.css'; // Import the CSS file

Modal.setAppElement('#root');

const PlanPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeRequired: '',
    type: 'weekly'
  });

  const userId = localStorage.getItem('userId');

  // Fetch all plans and user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [plansData, user] = await Promise.all([
          learningPlanApi.getAllLearningPlans(),
          userApi.getUserById(userId)
        ]);
        setPlans(plansData);
        setUserData(user);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load learning plans');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'timeRequired' ? parseInt(value) || '' : value
    });
  };

  const openCreateModal = () => {
    setCurrentPlan(null);
    setFormData({
      title: '',
      description: '',
      timeRequired: '',
      type: 'weekly'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (plan) => {
    setCurrentPlan(plan);
    setFormData({
      title: plan.title,
      description: plan.description,
      timeRequired: plan.timeRequired,
      type: plan.type
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.timeRequired) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      
      if (currentPlan) {
        const updatedPlan = {
          ...formData,
          user: { id: userId }
        };
        await learningPlanApi.updateLearningPlan(currentPlan.planId, updatedPlan);
        toast.success('Learning plan updated successfully');
      } else {
        await learningPlanApi.createLearningPlan(
          formData.title,
          formData.description,
          formData.timeRequired,
          formData.type
        );
        toast.success('Learning plan created successfully');
      }
      
      const updatedPlans = await learningPlanApi.getAllLearningPlans();
      setPlans(updatedPlans);
      closeModal();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error(currentPlan ? 'Failed to update plan' : 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (planId) => {
    if (window.confirm('Are you sure you want to delete this learning plan?')) {
      try {
        setLoading(true);
        await learningPlanApi.deleteLearningPlan(planId);
        toast.success('Learning plan deleted successfully');
        
        const updatedPlans = await learningPlanApi.getAllLearningPlans();
        setPlans(updatedPlans);
      } catch (error) {
        console.error('Error deleting plan:', error);
        toast.error('Failed to delete plan');
      } finally {
        setLoading(false);
      }
    }
  };

  const isUserPlan = (plan) => {
    return plan.userId === userId;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && plans.length === 0) {
    return (
      <div className="plan-page-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="plan-page-container">
      <div className="plan-page-header">
        <h1>Learning Plans</h1>
        <button onClick={openCreateModal} className="create-plan-btn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create New Plan
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="no-plans-message">
          <p>No learning plans yet. Create your first plan to get started!</p>
        </div>
      ) : (
        <div className="plans-grid">
          {plans.map((plan) => (
            <div key={plan.planId} className="plan-card">
              <div className="plan-card-header">
                <h3>{plan.title}</h3>
                <div className="plan-meta">
                  <span className="capitalize">{plan.type}</span>
                  <span className="meta-separator">•</span>
                  <span>{plan.timeRequired} min</span>
                </div>
              </div>
              <div className="plan-card-body">
                <p className="plan-description">{plan.description}</p>
                <div className="plan-date">
                  Created: {formatDate(plan.createdAt)}
                </div>
                
                {isUserPlan(plan) && (
                  <div className="plan-actions">
                    <button
                      onClick={() => openEditModal(plan)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(plan.planId)}
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

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="plan-modal"
        overlayClassName="plan-modal-overlay"
        contentLabel="Learning Plan Modal"
      >
        <div className="modal-header">
          <h2>{currentPlan ? 'Edit Learning Plan' : 'Create Learning Plan'}</h2>
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
              placeholder="e.g. Beginner Photography Skills"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              placeholder="Describe your learning plan"
              required
            ></textarea>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="timeRequired">
                Time Required (minutes) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="timeRequired"
                name="timeRequired"
                value={formData.timeRequired}
                onChange={handleInputChange}
                min="1"
                placeholder="e.g. 150"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="type">Plan Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
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
                <span className="btn-loading">
                  <svg className="spinner" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : currentPlan ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PlanPage;