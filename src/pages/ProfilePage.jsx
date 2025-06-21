import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import userApi from "../api/userApi";
import UserBadge from "../components/user/UserBadge";
import "./ProfilePage.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    birthday: "",
    gender: "",
    age: "",
    public: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const validationPatterns = {
    name: /^[a-zA-Z\s]{2,50}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    birthday: /^\d{4}-\d{2}-\d{2}$/,
    gender: /^(male|female|other)$/i,
    age: /^(1[89]|[2-9]\d|1[0-2]\d)$/,
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          toast.error("Please login first");
          navigate("/login");
          return;
        }

        const userData = await userApi.getUserById(userId);
        setUser(userData);
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          birthday: userData.birthday
            ? new Date(userData.birthday).toISOString().split("T")[0]
            : "",
          gender: userData.gender || "",
          age: userData.age ? userData.age.toString() : "",
          public: userData.public || false,
        });
      } catch (error) {
        toast.error("Failed to fetch user data");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (validationPatterns[name] && !validationPatterns[name].test(value)) {
      setErrors((prev) => ({ ...prev, [name]: true }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (
        validationPatterns[key] &&
        !validationPatterns[key].test(formData[key])
      ) {
        newErrors[key] = true;
      }
    });

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      toast.error("Please correct the errors in the form");
      return;
    }

    try {
      const updatedUser = await userApi.updateUser(user.id, {
        ...user,
        ...formData,
        age: parseInt(formData.age),
        public: formData.public,
      });
      setUser(updatedUser);
      setEditMode(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    }
  };

  const togglePublicProfile = async () => {
    try {
      const updatedUser = await userApi.updateUser(user.id, {
        ...user,
        public: !user.public,
      });
      setUser(updatedUser);
      setFormData((prev) => ({ ...prev, public: updatedUser.public }));
      toast.success(
        `Profile is now ${updatedUser.public ? "public" : "private"}`
      );
    } catch (error) {
      toast.error("Failed to update profile visibility");
      console.error(error);
    }
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      userApi
        .deleteUser(user.id)
        .then(() => {
          toast.success("Account deleted successfully");
          handleLogout();
        })
        .catch((error) => {
          toast.error("Failed to delete account");
          console.error(error);
        });
    }
  };

  const handleLogout = () => {
    userApi.logout();
    navigate("/login");
    toast.info("You have been logged out");
  };

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="loading-spinner">
        <p className="error-text">Failed to load user data</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">My Profile</h1>
              <p className="opacity-90">Manage your account information</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {user.public ? "Public" : "Private"}
              </span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={user.public}
                  onChange={togglePublicProfile}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="profile-content">
          {!editMode ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold">
                    Personal Information
                  </h2>
                  <UserBadge />
                </div>
                <button
                  onClick={() => setEditMode(true)}
                  className="edit-btn"
                >
                  Edit Profile
                </button>
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <p className="label">Name</p>
                  <p className="value">{user.name || "Not provided"}</p>
                </div>
                <div className="info-item">
                  <p className="label">Email</p>
                  <p className="value">{user.email}</p>
                </div>
                <div className="info-item">
                  <p className="label">Birthday</p>
                  <p className="value">
                    {user.birthday
                      ? new Date(user.birthday).toLocaleDateString()
                      : "Not provided"}
                  </p>
                </div>
                <div className="info-item">
                  <p className="label">Gender</p>
                  <p className="value">{user.gender || "Not provided"}</p>
                </div>
                <div className="info-item">
                  <p className="label">Age</p>
                  <p className="value">{user.age || "Not provided"}</p>
                </div>
                <div className="info-item">
                  <p className="label">Account Status</p>
                  <p className={`status-badge ${
                    user.deleteStatus ? "status-deleted" : "status-active"
                  }`}>
                    {user.deleteStatus ? "Deleted" : "Active"}
                  </p>
                </div>
              </div>

              <div className="divider"></div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="label">Profile Visibility</p>
                  <p className="text-sm text-gray-600">
                    {user.public
                      ? "Your profile is visible to everyone"
                      : "Your profile is private"}
                  </p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={user.public}
                    onChange={togglePublicProfile}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <button
                  onClick={handleLogout}
                  className="logout-btn"
                >
                  Logout
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="delete-btn"
                >
                  Delete Account
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-between items-center pb-4">
                <h2 className="text-xl font-semibold">Edit Profile</h2>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`form-input ${errors.name ? "error-input" : ""}`}
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="error-text">
                      Please enter a valid name (2-50 characters)
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`form-input ${errors.email ? "error-input" : ""}`}
                    placeholder="example@email.com"
                  />
                  {errors.email && (
                    <p className="error-text">Please enter a valid email</p>
                  )}
                </div>

                <div>
                  <label className="label">Birthday</label>
                  <input
                    type="date"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleInputChange}
                    className={`form-input ${errors.birthday ? "error-input" : ""}`}
                  />
                  {errors.birthday && (
                    <p className="error-text">Please enter a valid date</p>
                  )}
                </div>

                <div>
                  <label className="label">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`form-input ${errors.gender ? "error-input" : ""}`}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="error-text">Please select a gender</p>
                  )}
                </div>

                <div>
                  <label className="label">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="18"
                    max="129"
                    className={`form-input ${errors.age ? "error-input" : ""}`}
                    placeholder="25"
                  />
                  {errors.age && (
                    <p className="error-text">Please enter a valid age (18-129)</p>
                  )}
                </div>

                <div className="divider"></div>

                <div className="flex justify-between items-center">
                  <div>
                    <label className="label">Profile Visibility</label>
                    <p className="text-sm text-gray-600">
                      {formData.public
                        ? "Your profile will be visible to everyone"
                        : "Your profile will be private"}
                    </p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={formData.public}
                      onChange={() =>
                        setFormData((prev) => ({ ...prev, public: !prev.public }))
                      }
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  className="save-btn"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default ProfilePage;