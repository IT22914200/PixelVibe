import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PhotographyPostsPage = () => {
  // State for posts and UI
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  
  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");

  // Mock data fetch - replace with real API calls
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data with comments
        const mockPosts = [
          {
            id: 1,
            title: "Mountain Sunset",
            description: "Beautiful sunset in the Rockies",
            imageUrl: "https://source.unsplash.com/random/800x600/?mountain,sunset",
            createdAt: new Date("2023-05-15"),
            likes: 42,
            liked: false,
            tags: ["nature", "mountains", "sunset"],
            comments: [
              {
                id: 1,
                author: "Jane Doe",
                text: "Stunning view!",
                createdAt: new Date("2023-05-16")
              },
              {
                id: 2,
                author: "John Smith",
                text: "Where was this taken?",
                createdAt: new Date("2023-05-17")
              }
            ]
          },
          {
            id: 2,
            title: "Ocean Waves",
            description: "Calming ocean waves at dawn",
            imageUrl: "https://source.unsplash.com/random/800x600/?ocean,waves",
            createdAt: new Date("2023-06-20"),
            likes: 35,
            liked: false,
            tags: ["water", "beach", "dawn"],
            comments: [
              {
                id: 1,
                author: "Alex Johnson",
                text: "Love the colors in this shot!",
                createdAt: new Date("2023-06-21")
              }
            ]
          }
        ];
        
        setPosts(mockPosts);
      } catch (error) {
        toast.error("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);

  // Filter and sort posts
  const filteredPosts = [...posts]
    .filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortOption === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOption === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortOption === "likes") return b.likes - a.likes;
      return 0;
    });

  // Handle post creation/update
  const handleSubmitPost = (postData) => {
    if (currentPost) {
      // Update existing post
      setPosts(posts.map(p => p.id === currentPost.id ? { ...p, ...postData } : p));
      toast.success("Post updated successfully");
    } else {
      // Create new post
      const newPost = {
        ...postData,
        id: Math.max(...posts.map(p => p.id), 0) + 1,
        createdAt: new Date(),
        likes: 0,
        liked: false,
        comments: []
      };
      setPosts([...posts, newPost]);
      toast.success("Post created successfully");
    }
    setIsModalOpen(false);
  };

  // Handle post deletion
  const handleDeletePost = (id) => {
    setPosts(posts.filter(post => post.id !== id));
    toast.success("Post deleted successfully");
  };

  // Handle like/unlike
  const handleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const isLiked = !post.liked;
        return {
          ...post,
          liked: isLiked,
          likes: isLiked ? post.likes + 1 : post.likes - 1
        };
      }
      return post;
    }));
  };

  // Handle comment submission
  const handleCommentSubmit = (postId) => {
    if (!commentText.trim()) return;
    
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newComment = {
          id: Math.max(...post.comments.map(c => c.id), 0) + 1,
          author: "Current User", // Replace with actual user name
          text: commentText,
          createdAt: new Date()
        };
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    }));
    
    setCommentText("");
    toast.success("Comment added successfully");
  };

  // Toggle comments section
  const toggleComments = (postId) => {
    setActiveCommentPost(activeCommentPost === postId ? null : postId);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="photography-container">
      <header className="header">
        <h1>Photography Gallery</h1>
        <p>Capture moments, share perspectives</p>
      </header>

      <div className="controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="sort-controls">
          <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="likes">Most Liked</option>
          </select>

          <button 
            className="view-toggle"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? "☰ List View" : "⏹ Grid View"}
          </button>

          <button 
            className="create-button"
            onClick={() => {
              setCurrentPost(null);
              setIsModalOpen(true);
            }}
          >
            + Create Post
          </button>
        </div>
      </div>

      <div className={`posts-container ${viewMode}`}>
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <div key={post.id} className="post-card">
              <img src={post.imageUrl} alt={post.title} />
              <div className="post-content">
                <h3>{post.title}</h3>
                <p>{post.description}</p>
                <div className="tags">
                  {post.tags.map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
                
                {/* Like and Comment buttons */}
                <div className="interaction-buttons">
                  <button 
                    className={`like-button ${post.liked ? 'liked' : ''}`}
                    onClick={() => handleLike(post.id)}
                  >
                    ♥ {post.likes}
                  </button>
                  <button 
                    className="comment-button"
                    onClick={() => toggleComments(post.id)}
                  >
                    💬 {post.comments.length}
                  </button>
                </div>
                
                {/* Comments section */}
                {activeCommentPost === post.id && (
                  <div className="comments-section">
                    <div className="comments-list">
                      {post.comments.map(comment => (
                        <div key={comment.id} className="comment">
                          <strong>{comment.author}</strong>
                          <p>{comment.text}</p>
                          <small>
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                      ))}
                    </div>
                    <div className="comment-form">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                      />
                      <button 
                        onClick={() => handleCommentSubmit(post.id)}
                        disabled={!commentText.trim()}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Edit/Delete buttons (for post owner) */}
                <div className="post-actions">
                  <button onClick={() => {
                    setCurrentPost(post);
                    setIsModalOpen(true);
                  }}>
                    Edit
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => handleDeletePost(post.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-posts">
            <p>No posts found. Create your first post!</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <PostModal
          post={currentPost}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmitPost}
        />
      )}
    </div>
  );
};

// Post Modal Component (same as before)
const PostModal = ({ post, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: post?.title || "",
    description: post?.description || "",
    tags: post?.tags.join(", ") || "",
    image: null,
    imagePreview: post?.imageUrl || null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imagePreview: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const postData = {
      title: formData.title,
      description: formData.description,
      tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
      imageUrl: formData.imagePreview
    };
    onSubmit(postData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>{post ? "Edit Post" : "Create New Post"}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required={!post}
            />
            {formData.imagePreview && (
              <div className="image-preview">
                <img src={formData.imagePreview} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">{post ? "Update" : "Create"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// CSS Styles with new additions for like/comment features
const styles = `
  .photography-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
  }

  .header {
    text-align: center;
    margin-bottom: 30px;
  }

  .header h1 {
    font-size: 2.5rem;
    color: #333;
  }

  .controls {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-bottom: 20px;
    gap: 15px;
  }

  .search-box {
    position: relative;
    flex: 1;
    min-width: 250px;
  }

  .search-box input {
    width: 100%;
    padding: 10px 15px 10px 35px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
  }

  .sort-controls {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .sort-controls select {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .view-toggle, .create-button {
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .create-button {
    background-color: #4CAF50;
    color: white;
  }

  .create-button:hover {
    background-color: #45a049;
  }

  .posts-container {
    display: grid;
    gap: 20px;
  }

  .posts-container.grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }

  .posts-container.list {
    grid-template-columns: 1fr;
  }

  .post-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }

  .post-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }

  .post-content {
    padding: 15px;
  }

  .post-content h3 {
    margin-top: 0;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin: 10px 0;
  }

  .tag {
    background-color: #f0f0f0;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
  }

  /* New styles for like and comment buttons */
  .interaction-buttons {
    display: flex;
    gap: 10px;
    margin: 15px 0;
  }

  .like-button, .comment-button {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border: none;
    border-radius: 4px;
    background-color: #f0f0f0;
    cursor: pointer;
  }

  .like-button:hover, .comment-button:hover {
    background-color: #e0e0e0;
  }

  .like-button.liked {
    background-color: #ffebee;
    color: #f44336;
  }

  /* Comments section styles */
  .comments-section {
    margin-top: 10px;
    border-top: 1px solid #eee;
    padding-top: 10px;
  }

  .comments-list {
    max-height: 200px;
    overflow-y: auto;
    margin-bottom: 10px;
  }

  .comment {
    margin-bottom: 10px;
    padding: 8px;
    background-color: #f9f9f9;
    border-radius: 4px;
  }

  .comment small {
    color: #777;
    font-size: 0.8rem;
  }

  .comment-form {
    display: flex;
    gap: 10px;
  }

  .comment-form input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .comment-form button {
    padding: 8px 15px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .comment-form button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  .post-actions {
    display: flex;
    gap: 10px;
    margin-top: 15px;
  }

  .post-actions button {
    padding: 5px 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .delete-button {
    background-color: #f44336;
    color: white;
  }

  .delete-button:hover {
    background-color: #d32f2f;
  }

  .no-posts {
    text-align: center;
    padding: 40px;
    grid-column: 1 / -1;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal {
    background-color: white;
    padding: 25px;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    position: relative;
  }

  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
  }

  .form-group {
    margin-bottom: 15px;
  }

  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }

  .form-group input, .form-group textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .form-group textarea {
    min-height: 100px;
  }

  .image-preview {
    margin-top: 10px;
  }

  .image-preview img {
    max-width: 100%;
    max-height: 200px;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }

  .form-actions button {
    padding: 8px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .form-actions button[type="submit"] {
    background-color: #4CAF50;
    color: white;
  }

  .form-actions button[type="submit"]:hover {
    background-color: #45a049;
  }

  .loading-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
  }

  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 4px solid #3498db;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin-bottom: 15px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Add styles to the document
const styleElement = document.createElement("style");
styleElement.innerHTML = styles;
document.head.appendChild(styleElement);

export default PhotographyPostsPage;