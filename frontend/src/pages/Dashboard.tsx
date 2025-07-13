import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageCircle, 
  Stethoscope, 
  Pill, 
  Settings, 
  LogOut, 
  Calendar,
  TrendingUp,
  Bell,
  Clock
} from 'lucide-react';

const Dashboard = () => {
  const recentInteractions = [
    {
      type: 'symptom',
      title: 'Headache and fatigue symptoms',
      date: '2 hours ago',
      status: 'Completed'
    },
    {
      type: 'chat',
      title: 'Conversation about sleep hygiene',
      date: '1 day ago',
      status: 'Completed'
    },
    {
      type: 'medication',
      title: 'Ibuprofen interaction question',
      date: '2 days ago',
      status: 'Completed'
    }
  ];

  const upcomingReminders = [
    {
      type: 'medication',
      title: 'Take Vitamin D',
      time: '2:00 PM',
      status: 'pending'
    },
    {
      type: 'appointment',
      title: 'Annual checkup',
      time: 'Tomorrow, 10:00 AM',
      status: 'scheduled'
    }
  ];

  const healthStats = [
    {
      label: 'Symptom Checks This Month',
      value: '8',
      change: '+2 from last month',
      trend: 'up'
    },
    {
      label: 'AI Conversations',
      value: '15',
      change: '+5 from last month',
      trend: 'up'
    },
    {
      label: 'Medication Queries',
      value: '4',
      change: 'Same as last month',
      trend: 'stable'
    }
  ];

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'symptom': return <Stethoscope className="h-5 w-5 text-primary" />;
      case 'chat': return <MessageCircle className="h-5 w-5 text-secondary" />;
      case 'medication': return <Pill className="h-5 w-5 text-accent" />;
      default: return <MessageCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-100 min-h-screen">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Dashboard</h2>
            <nav className="space-y-2">
              <Link
                to="/chat"
                className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors duration-200"
              >
                <MessageCircle className="h-5 w-5 mr-3" />
                AI Assistant
              </Link>
              <Link
                to="/symptom-checker"
                className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors duration-200"
              >
                <Stethoscope className="h-5 w-5 mr-3" />
                Symptom Checker
              </Link>
              <Link
                to="/medication-qa"
                className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors duration-200"
              >
                <Pill className="h-5 w-5 mr-3" />
                Medications
              </Link>
              <Link
                to="/settings"
                className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors duration-200"
              >
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </Link>
              <button className="w-full flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors duration-200">
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, Sarah!
            </h1>
            <p className="text-gray-600">
              Here's your health overview for today. Stay on top of your wellness journey.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {healthStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">{stat.label}</h3>
                  <TrendingUp className={`h-4 w-4 ${
                    stat.trend === 'up' ? 'text-green-500' : 'text-gray-400'
                  }`} />
                </div>
                <div className="flex items-baseline">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Interactions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Recent Interactions</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentInteractions.map((interaction, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                      {getInteractionIcon(interaction.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{interaction.title}</p>
                        <p className="text-xs text-gray-500">{interaction.date}</p>
                      </div>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        {interaction.status}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    to="/chat"
                    className="text-sm text-primary hover:text-primary-dark font-medium"
                  >
                    View all interactions →
                  </Link>
                </div>
              </div>
            </div>

            {/* Upcoming Reminders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Upcoming Reminders
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {upcomingReminders.map((reminder, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                      {reminder.type === 'medication' ? (
                        <Pill className="h-5 w-5 text-primary" />
                      ) : (
                        <Calendar className="h-5 w-5 text-secondary" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{reminder.title}</p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {reminder.time}
                        </p>
                      </div>
                      <button className="text-xs text-primary hover:text-primary-dark font-medium">
                        Mark Done
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    to="/settings"
                    className="text-sm text-primary hover:text-primary-dark font-medium"
                  >
                    Manage reminders →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-gradient-to-br from-primary/5 to-secondary/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/symptom-checker"
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center space-x-3"
              >
                <Stethoscope className="h-6 w-6 text-primary" />
                <span className="font-medium text-gray-900">Check Symptoms</span>
              </Link>
              <Link
                to="/chat"
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center space-x-3"
              >
                <MessageCircle className="h-6 w-6 text-secondary" />
                <span className="font-medium text-gray-900">Ask AI Assistant</span>
              </Link>
              <Link
                to="/medication-qa"
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center space-x-3"
              >
                <Pill className="h-6 w-6 text-accent" />
                <span className="font-medium text-gray-900">Medication Info</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;