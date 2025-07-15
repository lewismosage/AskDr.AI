import React from 'react';
import { Star, MapPin, Clock, Phone, Video, Calendar } from 'lucide-react';

interface Therapist {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  location: string;
  distance: string;
  price: string;
  availability: string;
  image: string;
  verified: boolean;
  languages: string[];
  approaches: string[];
}

interface FindTherapistProps {
  therapists: Therapist[];
}

const FindTherapist: React.FC<FindTherapistProps> = ({ therapists }) => {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect with Licensed Therapists</h2>
        <p className="text-gray-600">Find qualified mental health professionals in your area</p>
      </div>

      {/* Search Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              placeholder="Enter zip code"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
              <option>All Specialties</option>
              <option>Anxiety & Depression</option>
              <option>Trauma & PTSD</option>
              <option>Relationship & Family</option>
              <option>Addiction</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Type</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
              <option>All Types</option>
              <option>In-Person</option>
              <option>Video Call</option>
              <option>Phone</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Insurance</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
              <option>All Options</option>
              <option>Accepts Insurance</option>
              <option>Self-Pay</option>
            </select>
          </div>
        </div>
      </div>

      {/* Therapist Listings */}
      <div className="space-y-6">
        {therapists.map((therapist) => (
          <div key={therapist.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start space-x-4">
              <img
                src={therapist.image}
                alt={therapist.name}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900">{therapist.name}</h3>
                      {therapist.verified && (
                        <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Verified
                        </div>
                      )}
                    </div>
                    <p className="text-primary font-medium">{therapist.specialty}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        {therapist.rating} ({therapist.reviews} reviews)
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {therapist.distance}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {therapist.availability}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{therapist.price}</p>
                    <p className="text-sm text-gray-600">{therapist.location}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {therapist.approaches.map((approach, index) => (
                      <span
                        key={index}
                        className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                      >
                        {approach}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-4 text-sm text-gray-600">
                      <span>Languages: {therapist.languages.join(', ')}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors duration-200">
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </button>
                      <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors duration-200">
                        <Video className="h-4 w-4 mr-1" />
                        Video
                      </button>
                      <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark transition-colors duration-200 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Book Session
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FindTherapist;
