import React, { useState, useRef, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import PhotographyPostApi from '../../api/PhotographyPostApi';
import mediaApi from '../../api/mediaApi';
import { uploadFile } from '../../services/uploadFileService';
import './CreateUpdatePostModal.css';

Modal.setAppElement('#root');

const CreateUpdatePostModal = ({ isOpen, onClose, initialPost = null, onSubmitSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreview, setMediaPreview] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);
  const userId = localStorage.getItem("userId");
  
  useEffect(() => {
    if (initialPost) {
      setTitle(initialPost.title || '');
      setDescription(initialPost.description || '');
      if (initialPost.media && initialPost.media.length > 0) {
        const previews = initialPost.media.map(item => ({
          id: item.id,
          url: item.url,
          type: item.type,
          existingMedia: true
        }));
        setMediaPreview(previews);
      }
    } else {
      resetForm();
    }
  }, [initialPost, isOpen]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    const invalidFiles = files.filter(file => 
      !file.type.startsWith('image/') && !file.type.startsWith('video/')
    );
    
    if (invalidFiles.length > 0) {
      toast.error('Only image and video files are allowed');
      return;
    }
    
    const totalMedia = mediaFiles.length + files.length;
    if (totalMedia > 3) {
      toast.error('Maximum 3 media files allowed');
      return;
    }
    
    const existingVideos = mediaFiles.filter(file => file.type.startsWith('video/'));
    const newVideos = files.filter(file => file.type.startsWith('video/'));
    
    if (existingVideos.length + newVideos.length > 1) {
      toast.error('Only one video is allowed');
      return;
    }
    
    const validateVideoDuration = async (videoFile) => {
      return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = function() {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > 30) {
            reject('Video must not exceed 30 seconds');
          } else {
            resolve(true);
          }
        };
        video.src = URL.createObjectURL(videoFile);
      });
    };
    
    const processFiles = async () => {
      try {
        for (const file of newVideos) {
          await validateVideoDuration(file);
        }
        
        setMediaFiles(prev => [...prev, ...files]);
        
        const newPreviews = files.map(file => ({
          url: URL.createObjectURL(file),
          type: file.type.startsWith('image/') ? 'image' : 'video',
          file: file
        }));
        
        setMediaPreview(prev => [...prev, ...newPreviews]);
      } catch (error) {
        toast.error(error);
      }
    };
    
    if (newVideos.length > 0) {
      processFiles();
    } else {
      setMediaFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => ({
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 'video',
        file: file
      }));
      setMediaPreview(prev => [...prev, ...newPreviews]);
    }
  };

  const removeMedia = (index) => {
    setMediaPreview(prev => prev.filter((_, i) => i !== index));
    
    if (!mediaPreview[index].existingMedia) {
      setMediaFiles(prev => prev.filter((_, i) => {
        const previewsBeforeIndex = mediaPreview.slice(0, index)
          .filter(p => !p.existingMedia).length;
        return i !== (index - (mediaPreview.length - mediaFiles.length - previewsBeforeIndex));
      }));
      URL.revokeObjectURL(mediaPreview[index].url);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return false;
    }
    
    if (!description.trim()) {
      toast.error('Description is required');
      return false;
    }
    
    if (mediaPreview.length === 0) {
      toast.error('At least one photo or video is required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      let postData = {
        title,
        description,
        createdAt: new Date(),
        likeCount: initialPost?.likeCount || 0,
        deleteStatus: false,
        createdBy: userId,
      };
      
      let postId;
      
      if (initialPost) {
        const updatedPost = await PhotographyPostApi.updatePost(initialPost.id, postData);
        postId = updatedPost.id;
        
        if (initialPost.media) {
          const existingMediaIds = mediaPreview
            .filter(item => item.existingMedia)
            .map(item => item.id);
          
          const mediaToDelete = initialPost.media
            .filter(item => !existingMediaIds.includes(item.id))
            .map(item => item.id);
          
          for (const mediaId of mediaToDelete) {
            await mediaApi.deleteMedia(mediaId);
          }
        }
      } else {
        const newPost = await PhotographyPostApi.createPost({...postData});
        postId = newPost.id;
      }
      
      const newFiles = mediaFiles.filter(file => 
        !mediaPreview.find(preview => 
          preview.existingMedia && preview.file === file
        )
      );
      
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        const fileType = file.type.startsWith('image/') ? 'image' : 'video';
        
        try {
          const updateProgress = (progress) => {
            setUploadProgress(prev => ({
              ...prev,
              [i]: progress
            }));
          };
          
          const downloadUrl = await uploadFile(file, updateProgress);
          
          const mediaData = {
            type: fileType,
            url: downloadUrl,
            deleteStatus: false,
            relatedPost: postId
          };
          
          await mediaApi.createMedia(mediaData);
        } catch (error) {
          console.error(`Error uploading file ${i}:`, error);
          toast.error(`Failed to upload media ${i + 1}`);
        }
      }
      
      toast.success(initialPost ? 'Post updated successfully!' : 'Post created successfully!');
      resetForm();
      onClose();
      onSubmitSuccess();
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error(error.response?.data?.message || 'Failed to save post');
    } finally {
      setIsLoading(false);
      setUploadProgress({});
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setMediaFiles([]);
    setUploadProgress({});
    
    mediaPreview.forEach(preview => {
      if (!preview.existingMedia) {
        URL.revokeObjectURL(preview.url);
      }
    });
    setMediaPreview([]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleCancel}
      className="modal-content"
      overlayClassName="modal-overlay"
      contentLabel="Create/Update Photography Post"
    >
      <div className="modal-header">
        <div className="flex justify-between items-center">
          <h2 className="modal-title">
            {initialPost ? 'Update Photography Post' : 'Create New Photography Post'}
          </h2>
          <button 
            onClick={handleCancel}
            className="modal-close-btn"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        <div>
          <label htmlFor="title" className="form-label">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
            placeholder="Add a title for your post"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="form-input form-textarea"
            placeholder="Describe your photography post..."
            disabled={isLoading}
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="form-label">
              Media
            </label>
            <span className={`text-sm ${mediaPreview.length === 3 ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
              {mediaPreview.length}/3 files
            </span>
          </div>
          
          <div className="flex flex-col space-y-2">
            <div className="flex items-center">
              <label className={`media-upload-label ${mediaPreview.length >= 3 ? 'disabled' : ''}`}>
                <div className="flex flex-col items-center space-y-1">
                  <svg className={`w-6 h-6 ${mediaPreview.length >= 3 ? 'text-gray-400' : 'text-purple-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span className={`text-sm font-medium ${mediaPreview.length >= 3 ? 'text-gray-500' : 'text-purple-600'}`}>
                    {mediaPreview.length === 0 ? 'Add photos/videos' : 'Add more media'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Maximum 3 files (only 1 video allowed)
                  </span>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*,video/*"
                  className="hidden"
                  multiple
                  disabled={isLoading || mediaPreview.length >= 3}
                />
              </label>
            </div>
          </div>
        </div>

        {mediaPreview.length > 0 && (
          <div className="space-y-2">
            <p className="form-label">Selected Media:</p>
            <div className="media-preview-grid">
              {mediaPreview.map((media, index) => (
                <div key={index} className="media-preview-item group">
                  <div className="aspect-w-16 aspect-h-9">
                    {media.type === 'image' ? (
                      <img
                        src={media.url}
                        alt={`Preview ${index}`}
                        className="media-preview"
                      />
                    ) : (
                      <video
                        src={media.url}
                        className="media-preview"
                        controls
                      />
                    )}
                  </div>
                  
                  {uploadProgress[index] !== undefined && !media.existingMedia && (
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${uploadProgress[index]}%` }}
                      ></div>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="remove-media-btn"
                    disabled={isLoading}
                    aria-label="Remove media"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="modal-footer">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-btn"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="loading-spinner -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span>{initialPost ? 'Update Post' : 'Create Post'}</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateUpdatePostModal;