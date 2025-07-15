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
    <div className="px-4 sm:px-0">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">Connect with Licensed Therapists</h2>
        <p className="text-sm sm:text-base text-gray-600">Find qualified mental health professionals in your area</p>
      </div>

      {/* Therapist Listings */}
      <div className="space-y-4 sm:space-y-6">
        {therapists.map((therapist) => (
          <div key={therapist.id} className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
            {/* Mobile Top Section */}
            <div className="sm:hidden flex justify-between mb-3">
              <div className="flex items-center space-x-2">
                <img
                  src={therapist.image}
                  alt={therapist.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center space-x-1">
                    <h3 className="text-base font-semibold text-gray-900">{therapist.name}</h3>
                    {therapist.verified && (
                      <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-primary text-sm font-medium">{therapist.specialty}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{therapist.price}</p>
                <div className="flex items-center justify-end text-xs text-gray-500">
                  <MapPin className="h-3 w-3 mr-0.5" />
                  {therapist.distance}
                </div>
              </div>
            </div>

            {/* Desktop Top Section */}
            <div className="hidden sm:flex items-start space-x-4">
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
              </div>
            </div>

            {/* Common Middle Section */}
            <div className="mt-3 sm:mt-4">
              <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
                {therapist.approaches.map((approach, index) => (
                  <span
                    key={index}
                    className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                  >
                    {approach}
                  </span>
                ))}
              </div>
              
              {/* Mobile Rating and Availability */}
              <div className="sm:hidden flex items-center space-x-3 text-xs text-gray-600 mb-3">
                <div className="flex items-center">
                  <Star className="h-3 w-3 text-yellow-400 mr-0.5" />
                  {therapist.rating} ({therapist.reviews})
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-0.5" />
                  {therapist.availability}
                </div>
              </div>
              
              <div className="text-xs sm:text-sm text-gray-600 mb-3">
                Languages: {therapist.languages.join(', ')}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              {/* Mobile single button */}
              <button className="sm:hidden bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium w-full flex items-center justify-center">
                <Calendar className="h-4 w-4 mr-1" />
                Book Session
              </button>
              
              {/* Desktop buttons */}
              <div className="hidden sm:flex space-x-2">
                <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors duration-200">
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </button>
                <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors duration-200">
                  <Video className="h-4 w-4 mr-1" />
                  Video
                </button>
              </div>
              
              <button className="hidden sm:flex items-center bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark transition-colors duration-200">
                <Calendar className="h-4 w-4 mr-1" />
                Book Session
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FindTherapist;