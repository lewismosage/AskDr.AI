import React, { useState, useEffect } from "react";
import { Trash2, Plus, Loader2, Lock } from "lucide-react";
import api from "../lip/api";
import { Link } from "react-router-dom";

interface Reminder {
  id: string;
  title: string;
  notes?: string;
  start_time: string;
  frequency: string;
  reminder_type: string;
}

const Reminder: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    notes: "",
    datetime: "",
    frequency: "once",
    reminder_type: "medication",
  });
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [userPlan, setUserPlan] = useState<"free" | "plus" | "pro" | null>(
    null
  );

  const API_LIST_URL = "/reminders/";
  const API_CREATE_URL = "/reminders/create/";
  const API_UPDATE_URL = (id: string) => `/reminders/${id}/update/`;
  const API_DELETE_URL = (id: string) => `/reminders/${id}/delete/`;

  // Check access and fetch reminders
  useEffect(() => {
    const checkAccessAndFetch = async () => {
      try {
        setLoading(true);
        // Check if user has access to reminders
        const accessResponse = await api.get(
          "/features/check-reminder-access/"
        );
        setHasAccess(accessResponse.data.has_access);
        setUserPlan(accessResponse.data.plan);
        if (accessResponse.data.has_access) {
          // Only fetch reminders if user has access
          const remindersResponse = await api.get(API_LIST_URL);
          setReminders(remindersResponse.data);
        }
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    checkAccessAndFetch();
  }, []);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add reminder
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Map datetime to start_time and include all required fields
      const payload = {
        title: formData.title,
        notes: formData.notes,
        start_time: formData.datetime,
        frequency: formData.frequency,
        reminder_type: formData.reminder_type,
      };
      const res = await api.post(API_CREATE_URL, payload);
      setReminders((prev) => [...prev, res.data]);
      setFormData({
        title: "",
        notes: "",
        datetime: "",
        frequency: "once",
        reminder_type: "medication",
      });
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to add reminder");
    } finally {
      setLoading(false);
    }
  };

  // Delete reminder
  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await api.delete(API_DELETE_URL(id));
      setReminders((prev) => prev.filter((r) => r.id !== id));
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to delete reminder");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Reminders</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Lock className="h-12 w-12 text-yellow-500" />
            <h2 className="text-2xl font-semibold text-gray-800">
              Reminders are a Premium Feature
            </h2>
            <p className="text-gray-600 max-w-md">
              {userPlan === "free"
                ? "Upgrade to Plus or Pro plan to access medication and appointment reminders."
                : "Your current plan doesn't include reminder features."}
            </p>
            <Link
              to="/pricing"
              className="mt-4 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
            >
              View Plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Reminders</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Reminder Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Add New Reminder
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="reminder_type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Reminder Type
              </label>
              <select
                id="reminder_type"
                name="reminder_type"
                value={formData.reminder_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
                required
              >
                <option value="medication">Medication</option>
                <option value="appointment">Appointment</option>
              </select>
            </div>
            <div className="mb-4">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="datetime"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date & Time
              </label>
              <input
                type="datetime-local"
                id="datetime"
                name="datetime"
                value={formData.datetime}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="frequency"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Frequency
              </label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
              >
                <option value="once">Once</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2" size={18} />
                  Add Reminder
                </>
              )}
            </button>
          </form>
        </div>

        {/* Reminder List */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Your Reminders
          </h2>
          {loading && reminders.length === 0 ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : reminders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
              No reminders yet. Add one to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="bg-white p-4 rounded-lg shadow-md border-l-4 border-primary"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {reminder.title}
                      </h3>
                      {reminder.notes && (
                        <p className="text-gray-600">{reminder.notes}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        <strong>Due:</strong> {formatDate(reminder.start_time)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      disabled={loading}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-12 bg-primary/5 border border-primary/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Reminder Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <p>
              Set medication reminders 15–30 minutes before meal times for
              better absorption
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <p>
              Schedule appointment reminders 24 hours in advance to avoid
              missing them
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <p>
              Use descriptive titles to quickly identify what each reminder is
              for
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <p>
              Enable browser notifications to receive alerts even when the app
              is closed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reminder;
