import React, { useState, useEffect } from 'react';
import feedbackApi from '../api/feedbackApi';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import UserData from '../components/feedbacks/UserData';

// Make sure to bind modal to your app element for accessibility
Modal.setAppElement('#root');

const FeedbacksPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    // Get user ID from localStorage
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
    
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await feedbackApi.getAllFeedbacks();
      setFeedbacks(response);
      setLoading(false);
    } catch (err) {
        console.error(err);
      setError('Failed to fetch feedbacks');
      setLoading(false);
      toast.error('Failed to load feedbacks');
    }
  };

  const handleOpenModal = (feedback = null) => {
    if (feedback) {
      setCurrentFeedback(feedback);
      setComment(feedback.comment);
    } else {
      setCurrentFeedback(null);
      setComment('');
    }
    setModalIsOpen(true);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    setCurrentFeedback(null);
    setComment('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    
    try {
      if (currentFeedback) {
        // Update existing feedback
        await feedbackApi.updateFeedback(currentFeedback.id, { comment });
        toast.success('Feedback updated successfully');
      } else {
        // Create new feedback
        await feedbackApi.createFeedback({ 
          user: { id: userId },
          comment 
        });
        toast.success('Feedback submitted successfully');
      }
      
      handleCloseModal();
      fetchFeedbacks();
    } catch (err) {
        console.error(err);
      toast.error(currentFeedback ? 'Failed to update feedback' : 'Failed to submit feedback');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await feedbackApi.deleteFeedback(id);
        toast.success('Feedback deleted successfully');
        fetchFeedbacks();
      } catch (err) {       console.error(err);
        toast.error('Failed to delete feedback');
      }
    }
  };

  // Custom styles for the modal
  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      width: '90%',
      maxWidth: '500px',
      borderRadius: '12px',
      padding: '0',
      border: 'none',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(2px)'
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-purple-700">Feedback</h1>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-md hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
        >
          Add Feedback
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
          <p>{error}</p>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="bg-purple-50 border border-purple-200 text-purple-700 p-8 rounded-lg text-center">
          <p className="text-xl">No feedbacks yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {feedbacks.map((feedback) => (
            <div 
              key={feedback._id} 
              className="bg-white rounded-lg shadow-md overflow-hidden border border-purple-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-3 text-white">
                <UserData userId={feedback.userId} />
              </div>
              <div className="p-4">
                <p className="text-gray-700">{feedback.comment}</p>
              </div>
              
              {userId === feedback?.userId && (
                <div className="px-4 py-3 bg-gray-50 border-t border-purple-100 flex justify-end space-x-2">
                  <button
                    onClick={() => handleOpenModal(feedback)}
                    className="px-3 py-1 text-sm text-purple-600 hover:text-purple-800 focus:outline-none"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(feedback.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800 focus:outline-none"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleCloseModal}
        style={customStyles}
        contentLabel="Feedback Modal"
      >
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-t-lg animate-gradient-x">
          <h2 className="text-xl font-bold text-white">
            {currentFeedback ? 'Edit Feedback' : 'Add Feedback'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white rounded-b-lg">
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
              Your Feedback
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
              rows="4"
              placeholder="Share your thoughts about the app..."
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200"
            >
              {currentFeedback ? 'Update' : 'Submit'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FeedbacksPage;