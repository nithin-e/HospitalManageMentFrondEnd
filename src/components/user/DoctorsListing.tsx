import React, { useEffect, useMemo, useState } from 'react';
import { Check, Search, User } from 'lucide-react';
import { UserfetchingDoctors } from '../../store/userSideApi/UserfetchingDoctors';
import { useNavigate } from 'react-router-dom';

const DoctorCard = ({ doctor, onBook }) => {
  const { 
    firstName = '', 
    lastName = '', 
    specialty = 'General Practice', 
    profileImageUrl = '',      
    qualifications = '',
    medicalLicenseNumber = '',
    isActive = false
  } = doctor || {};

  const fullName = `Dr. ${firstName} ${lastName}`.trim();
  const displayName = fullName.length > 4 ? fullName : 'Doctor';

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 relative overflow-hidden group border border-gray-200">
      {/* Verified Badge */}
      {isActive && (
        <div className="absolute top-4 right-4 bg-green-100 rounded-full p-1.5 z-10">
          <Check className="w-4 h-4 text-green-600" />
        </div>
      )}
      
      {/* Accent Line */}
      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: 'rgb(0, 59, 115)' }}></div>
      
      <div className="flex flex-col items-center">
        {/* Profile Image */}
        <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-gray-100 shadow-md group-hover:border-blue-200 transition-colors">
          {profileImageUrl ? (
            <img 
              src={profileImageUrl} 
              alt={displayName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className={`w-full h-full flex items-center justify-center ${profileImageUrl ? 'hidden' : 'flex'}`}
            style={{ backgroundColor: 'rgba(0, 59, 115, 0.1)' }}
          >
            <User className="w-16 h-16" style={{ color: 'rgb(0, 59, 115)' }} />
          </div>
        </div>
        
        {/* Doctor Name */}
        <h3 className="text-xl font-semibold text-gray-800 mb-1 text-center">
          {displayName}
        </h3>
        
        {/* Specialty */}
        <p className="font-medium mb-2 text-center" style={{ color: 'rgb(0, 59, 115)' }}>
          {specialty}
        </p>
        
        {/* Qualifications */}
        {qualifications && (
          <p className="text-sm text-gray-500 mb-3 text-center line-clamp-2">
            {qualifications}
          </p>
        )}
        
        {/* License Number */}
        {medicalLicenseNumber && (
          <p className="text-xs text-gray-400 mb-4">
            License: {medicalLicenseNumber}
          </p>
        )}
        
        {/* Divider */}
        <div className="w-12 h-1 rounded-full" style={{ backgroundColor: 'rgb(0, 59, 115)' }}></div>

        {/* Actions */}
        <div className="mt-4 w-full flex items-center justify-center gap-3">
          <button
            onClick={() => onBook(doctor)}
            className="px-4 py-2 text-white rounded-lg font-medium shadow-sm hover:opacity-90 transition-all"
            style={{ backgroundColor: 'rgb(0, 59, 115)' }}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

const DoctorListing = () => {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('name-asc');
  const perPage = 8;
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    
    const loadDoctors = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await UserfetchingDoctors();
        console.log('API Response:', response);
        
        if (!mounted) return;
        
        let doctorData = [];
        
        if (response?.data?.data?.data) {
          doctorData = response.data.data.data;
        } else if (response?.data?.data) {
          doctorData = response.data.data;
        } else if (response?.data) {
          doctorData = response.data;
        } else if (Array.isArray(response)) {
          doctorData = response;
        }
        
        if (!Array.isArray(doctorData)) {
          doctorData = [];
        }
        
        console.log('Processed doctor data:', doctorData);
        
        setDoctors(doctorData);
        setFiltered(doctorData);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        if (mounted) {
          setError('Failed to fetch doctors. Please try again later.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    loadDoctors();
    
    return () => { 
      mounted = false; 
    };
  }, []);

  useEffect(() => {
    const query = search.trim().toLowerCase();
    
    if (!query) {
      setFiltered(doctors);
      setPage(1);
      return;
    }
    
    const filtered = doctors.filter((doctor) => {
      const firstName = (doctor.firstName || '').toLowerCase();
      const lastName = (doctor.lastName || '').toLowerCase();
      const fullName = `${firstName} ${lastName}`.trim();
      const specialty = (doctor.specialty || '').toLowerCase();
      const qualifications = (doctor.qualifications || '').toLowerCase();
      
      return (
        firstName.includes(query) ||
        lastName.includes(query) ||
        fullName.includes(query) ||
        specialty.includes(query) ||
        qualifications.includes(query)
      );
    });
    
    setFiltered(filtered);
    setPage(1);
  }, [search, doctors]);

  const sortedFiltered = useMemo(() => {
    const items = Array.isArray(filtered) ? [...filtered] : [];

    switch (sort) {
      case 'name-asc':
        return items.sort((a, b) => {
          const aName = `${(a.firstName || '')} ${(a.lastName || '')}`.trim().toLowerCase();
          const bName = `${(b.firstName || '')} ${(b.lastName || '')}`.trim().toLowerCase();
          return aName.localeCompare(bName);
        });
      case 'name-desc':
        return items.sort((a, b) => {
          const aName = `${(a.firstName || '')} ${(a.lastName || '')}`.trim().toLowerCase();
          const bName = `${(b.firstName || '')} ${(b.lastName || '')}`.trim().toLowerCase();
          return bName.localeCompare(aName);
        });
      case 'specialty-asc':
        return items.sort((a, b) => ((a.specialty || '')).toLowerCase().localeCompare(((b.specialty || '')).toLowerCase()));
      case 'specialty-desc':
        return items.sort((a, b) => ((b.specialty || '')).toLowerCase().localeCompare(((a.specialty || '')).toLowerCase()));
      case 'active-first':
        return items.sort((a, b) => (b.isActive === true) - (a.isActive === true));
      default:
        return items;
    }
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedFiltered.length / perPage));
  const start = (page - 1) * perPage;
  const pageItems = sortedFiltered.slice(start, start + perPage);

  const handleBook = (doctor) => {
    navigate('/AppointMent', { state: { doctor } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-blue-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3" style={{ color: 'rgb(0, 59, 115)' }}>
            Our Medical Experts
          </h1>
          <p className="text-gray-600 text-lg sm:text-xl">
            Meet our team of experienced healthcare professionals
          </p>
        </div>

        {/* Search and Pagination Info */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or specialty..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 shadow-sm focus:outline-none focus:ring-2 transition-all"
                style={{ '--tw-ring-color': 'rgb(0, 59, 115)' }}
              />
            </div>
          </div>
          <div className="text-sm text-gray-600 font-medium bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200">
            Page {page} of {totalPages} • {filtered.length} doctor{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'rgb(0, 59, 115)' }}></div>
            <p className="mt-4 text-gray-600">Loading doctors...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && pageItems.length === 0 && (
          <div className="text-center py-20">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {search ? 'No doctors found matching your search.' : 'No doctors available at the moment.'}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-4 font-medium hover:opacity-80 transition-opacity"
                style={{ color: 'rgb(0, 59, 115)' }}
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Doctors Grid */}
        {!loading && !error && pageItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {pageItems.map((doctor) => (
              <DoctorCard 
                key={doctor.id || doctor._id} 
                doctor={doctor} 
                onBook={handleBook}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && !error && filtered.length > 0 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
            >
              Previous
            </button>
            
            <div className="px-5 py-2.5 text-white rounded-lg font-medium shadow-sm" style={{ backgroundColor: 'rgb(0, 59, 115)' }}>
              {page} / {totalPages}
            </div>
            
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorListing;