import { useState, useEffect } from 'react';
import { useSEO } from '../../../hooks/useSEO';
import '../css/Settings.css';

const Settings = () => {
  useSEO({
    title: 'Settings',
    description: 'Configure your Simoncees FinTech account settings and preferences.',
    keywords: 'account settings, preferences, configuration',
    robots: 'noindex, follow',
  });
  
  const [profile, setProfile] = useState({
    avatar: '',
    name: '',
    email: '',
    tillNumber: ''
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch profile from backend
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProfile({
          avatar: data.avatar || '',
          name: data.fullName || '',
          email: data.email || '',
          tillNumber: data.tillNumber || ''
        });
        setPreview(data.avatar || null);
      })
      .catch(err => console.error('Failed to load profile:', err));
  }, []);

  // Handle image upload - just convert to base64, let backend compress
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setMessage('Please upload a PNG, JPG, or WebP image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image too large. Maximum 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setProfile({ ...profile, avatar: reader.result });
    };
    reader.readAsDataURL(file);
  };

  // Handle input changes
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Save profile
  const handleSave = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    setMessage('');

    try {
      const body = {
        fullName: profile.name,
        email: profile.email,
        tillNumber: profile.tillNumber
      };

      if (profile.avatar && profile.avatar.startsWith('data:image/')) {
        body.avatar = profile.avatar;
      }

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Profile updated successfully!');
        if (data.avatar) {
          setPreview(data.avatar);
          setProfile(prev => ({ ...prev, avatar: data.avatar }));
        }
      } else {
        setMessage(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Save error:', err);
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings">
      <div className="settings-form">
        <h3>Edit Profile</h3>
        
        <div className="form-group">
          <label>Avatar</label>
          <input 
            type="file" 
            accept="image/png,image/jpeg,image/webp" 
            onChange={handleImageChange} 
          />
        </div>

        <div className="form-group">
          <label>Name</label>
          <input type="text" name="name" value={profile.name} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={profile.email} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Till Number</label>
          <input type="text" name="tillNumber" value={profile.tillNumber} onChange={handleChange} />
        </div>

        {message && (
          <p className={`settings-message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </p>
        )}

        <button onClick={handleSave} className="save-btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="settings-preview">
        <div className="preview-card">
          <img 
            src={preview || 'https://ui-avatars.com/api/?name=User&size=150'} 
            alt="Profile" 
            loading="lazy"
          />
          <h4>{profile.name || 'Your Name'}</h4>
          <p>{profile.email || 'your@email.com'}</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;