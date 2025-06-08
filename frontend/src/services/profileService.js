const API_URL = 'http://localhost:5000/api/v2';

export const profileService = {
  async getProfile() {
    const response = await fetch(`${API_URL}/profile`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  async updateProfile(data) {
    try {
      const response = await fetch('http://localhost:5000/api/v2/profile/update', {
        method: 'PUT',
        credentials: 'include', // Important for sending cookies
        headers: {
          'Content-Type': 'application/json',
          // Add any auth headers if needed
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      return response.json();
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_URL}/profile/avatar`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    if (!response.ok) throw new Error('Failed to upload avatar');
    return response.json();
  },

  async updateStats(data) {
    const response = await fetch(`${API_URL}/profile/stats/update`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update stats');
    return response.json();
  }
};