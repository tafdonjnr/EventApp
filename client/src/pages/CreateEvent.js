import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getImageUrl, getAuthToken, API_BASE_URL } from '../config/api';
import LoadingState from '../components/LoadingState';
import Stepper, { Step } from '../components/Stepper';

export default function CreateEvent() {
  const BANNER_PREVIEW_STORAGE_KEY = 'eventBannerPreview';
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    price: '',
    ticketsAvailable: '',
    category: 'general',
  });
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const { id } = useParams();
  const token = getAuthToken();

  const fetchEventData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const event = await response.json();
        setFormData({
          title: event.title || '',
          description: event.description || '',
          date: event.date ? event.date.split('T')[0] : '',
          time: event.date ? event.date.split('T')[1]?.substring(0, 5) : '',
          venue: event.venue || '',
          price: event.price || '',
          ticketsAvailable: event.ticketsAvailable || '',
          category: event.category || 'general',
        });
        if (event.banner) setBannerPreview(getImageUrl(event.banner));
      }
    } catch (err) {
      setError('Failed to load event data');
    } finally {
      setIsLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    if (!token) {
      navigate('/organizer/login');
      return;
    }

    // Restore persisted banner preview for create flow after refresh/revisit.
    if (!id) {
      const savedPreview = localStorage.getItem(BANNER_PREVIEW_STORAGE_KEY);
      if (savedPreview) setBannerPreview(savedPreview);
    }

    if (id) {
      setIsEdit(true);
      fetchEventData();
    } else {
      setIsLoading(false);
    }
  }, [id, token, navigate, fetchEventData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64DataUrl = ev.target?.result;
        if (typeof base64DataUrl === 'string') {
          setBannerPreview(base64DataUrl);
          localStorage.setItem(BANNER_PREVIEW_STORAGE_KEY, base64DataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const saveEvent = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('description', formData.description);
      formPayload.append('date', `${formData.date}T${formData.time}`);
      formPayload.append('venue', formData.venue);
      formPayload.append('price', formData.price);
      formPayload.append('ticketsAvailable', formData.ticketsAvailable);
      formPayload.append('category', formData.category);
      if (bannerFile) formPayload.append('banner', bannerFile);

      const url = isEdit ? `${API_BASE_URL}/api/events/${id}` : `${API_BASE_URL}/api/events`;
      const method = isEdit ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formPayload,
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.removeItem(BANNER_PREVIEW_STORAGE_KEY);
        setSuccess(isEdit ? 'Event updated successfully!' : 'Event created successfully!');
        setTimeout(() => navigate('/dashboard/events'), 2000);
      } else {
        setError(data.message || 'Failed to save event');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 min-h-[60vh] flex items-center justify-center">
        <LoadingState message="Loading event data..." size="large" containerStyle={{ minHeight: '60vh' }} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 sm:px-6">
      <h1 className="heading-1 text-center mb-8">{isEdit ? 'Edit Event' : 'Create New Event'}</h1>

      {error && (
        <div className="card-standard mb-6 text-red-600 border-red-200 bg-red-50">{error}</div>
      )}
      {success && (
        <div className="card-standard mb-6 text-green-700 border-green-200 bg-green-50">{success}</div>
      )}

      <div className="card-standard max-w-3xl mx-auto">
        <Stepper
          initialStep={1}
          onStepChange={() => {}}
          onFinalStepCompleted={saveEvent}
          backButtonText="Previous"
          nextButtonText="Next"
        >
          <Step>
            <div className="space-y-6">
              <div>
                <label className="block body-text font-semibold text-primaryText mb-2">Event Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter event title"
                  className="input-standard"
                />
              </div>

              <div>
                <label className="block body-text font-semibold text-primaryText mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Describe your event"
                  rows={4}
                  className="input-standard"
                />
              </div>
            </div>
          </Step>

          <Step>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block body-text font-semibold text-primaryText mb-2">Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="input-standard"
                  />
                </div>
                <div>
                  <label className="block body-text font-semibold text-primaryText mb-2">Time *</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                    className="input-standard"
                  />
                </div>
              </div>

              <div>
                <label className="block body-text font-semibold text-primaryText mb-2">Venue *</label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  required
                  placeholder="Event location"
                  className="input-standard"
                />
              </div>
            </div>
          </Step>

          <Step>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block body-text font-semibold text-primaryText mb-2">Price ($) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="input-standard"
                  />
                </div>
                <div>
                  <label className="block body-text font-semibold text-primaryText mb-2">Available Tickets *</label>
                  <input
                    type="number"
                    name="ticketsAvailable"
                    value={formData.ticketsAvailable}
                    onChange={handleInputChange}
                    required
                    min="1"
                    placeholder="Number of tickets"
                    className="input-standard"
                  />
                </div>
              </div>

              <div>
                <label className="block body-text font-semibold text-primaryText mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="input-standard"
                >
                  <option value="general">General</option>
                  <option value="music">Music</option>
                  <option value="sports">Sports</option>
                  <option value="technology">Technology</option>
                  <option value="business">Business</option>
                  <option value="education">Education</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="food">Food & Drink</option>
                  <option value="health">Health & Wellness</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </Step>

          <Step>
            <div className="space-y-6">
              <div>
                <label className="block body-text font-semibold text-primaryText mb-2">Event Banner</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="input-standard file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-primaryStart file:text-white file:font-semibold"
                />
                <p className="small-text mt-2">Recommended size: 1200x400 pixels. Max file size: 5MB.</p>
              </div>

              {bannerPreview && (
                <div>
                  <label className="block body-text font-semibold text-primaryText mb-2">Banner Preview</label>
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    className="w-full max-h-48 object-cover rounded-xl border border-softBorder"
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button
                  type="button"
                  disabled={loading}
                  onClick={saveEvent}
                  className="primary-btn w-full sm:w-auto"
                >
                  {loading ? 'Saving...' : isEdit ? 'Update Event' : 'Create Event'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="secondary-btn w-full sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Step>
        </Stepper>
      </div>
    </div>
  );
}
