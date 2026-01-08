import React, { useState } from 'react';

const PopUpMessage = ({ 
  showPopup, 
  onCancel, 
  onConfirm, 
  selectedSlot = null,
  existingTimes = [],
  getExistingTimesForDate = null,
  title = "Confirm Slot Cancellation",
  message = "Are you sure you want to remove this slot? This slot is already booked by a patient.",
  warningText = "⚠️ Cancelling this slot will notify the patient and may affect their schedule.",
  cancelButtonText = "Cancel"
}) => {
  const [showReschedule, setShowReschedule] = useState(false);
  const [selectedRescheduleSlot, setSelectedRescheduleSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    selectedSlot?.date || new Date().toISOString().split('T')[0]
  );
  const [existingTimesForDate, setExistingTimesForDate] = useState(existingTimes || []);

  // Convert 24-hour time to 12-hour format
  const convertTo12Hour = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Generate available slots. For same-day reschedule allow 9 AM - 8 PM,
  // for other dates allow only slots after 5 PM (17:00) up to 8 PM.
  const generateAvailableSlots = () => {
    const slots = [];
    const isOtherDate = selectedDate !== (selectedSlot?.date || '');
    const startHour = isOtherDate ? 17 : 9; // 5 PM for other dates
    const endHour = 20; // 8 PM in 24-hour format

    for (let hour = startHour; hour < endHour; hour++) {
      for (const minutes of [0, 30]) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}`;
        const time12 = convertTo12Hour(time24);

        // Determine conflicts using existingTimesForDate (which is kept in state)
        const isExisting = (existingTimesForDate || []).some((existingTime) => {
          if (typeof existingTime === 'string') {
            return existingTime === time24 || existingTime === time12;
          }
          if (typeof existingTime === 'object' && existingTime.time) {
            return existingTime.time === time24 || existingTime.time === time12;
          }
          return false;
        });

        slots.push({
          id: `${hour}-${minutes}`,
          time24: time24,
          time12: time12,
          available: !isExisting,
        });
      }
    }
    return slots;
  };

  // Refresh existing times for the current selected date when date changes
  React.useEffect(() => {
    if (getExistingTimesForDate && selectedDate) {
      try {
        const res = getExistingTimesForDate(selectedDate);
        // If the parent returns an array or promise, handle both
        if (res && typeof res.then === 'function') {
          res.then((arr) => setExistingTimesForDate(arr || []));
        } else {
          setExistingTimesForDate(res || []);
        }
      } catch (e) {
        setExistingTimesForDate(existingTimes || []);
      }
    } else {
      setExistingTimesForDate(existingTimes || []);
    }
  }, [selectedDate, getExistingTimesForDate, existingTimes]);

  const availableSlots = generateAvailableSlots();

  const handleRescheduleClick = () => {
    setShowReschedule(true);
    setSelectedRescheduleSlot(null);
  };

  const handleBackToConfirm = () => {
    setShowReschedule(false);
    setSelectedRescheduleSlot(null);
  };

  const handleRescheduleConfirm = () => {
    if (selectedRescheduleSlot) {
      // Attach selected date to newSlot
      const payload = {
        action: 'reschedule',
        originalSlot: selectedSlot,
        newSlot: {
          ...selectedRescheduleSlot,
          date: selectedDate,
        },
      };
      onConfirm(payload);
      setShowReschedule(false);
      setSelectedRescheduleSlot(null);
    }
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        
        {!showReschedule ? (
          // Original confirmation view
          <>
            {/* Popup Header */}
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>

            {/* Popup Content */}
            <div className="mb-6">
              <p className="text-gray-700 mb-2">{message}</p>
              
              {selectedSlot && (
                <div className="bg-gray-50 p-3 rounded-md mt-3">
                  {selectedSlot.time && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Time:</span> {selectedSlot.time}
                    </p>
                  )}
                  {selectedSlot.patient && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Patient:</span> {selectedSlot.patient}
                    </p>
                  )}
                  {selectedSlot.date && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Date:</span> {selectedSlot.date}
                    </p>
                  )}
                </div>
              )}
              
              {warningText && (
                <p className="text-sm text-red-600 mt-2">{warningText}</p>
              )}
            </div>

            {/* Popup Actions */}
            <div className="flex flex-col space-y-3">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  {cancelButtonText}
                </button>
                <button
                  onClick={handleRescheduleClick}
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Reschedule Slot
                </button>
              </div>
            </div>
          </>
        ) : (
          // Reschedule view
          <>
            {/* Reschedule Header */}
            <div className="flex items-center mb-4">
              <button
                onClick={handleBackToConfirm}
                className="mr-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Reschedule Appointment</h3>
            </div>

            {/* Current Slot Info */}
            {selectedSlot && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-md mb-4">
                <p className="text-sm text-red-800 font-medium mb-1">Current Slot:</p>
                <p className="text-sm text-red-700">
                  {selectedSlot.time} - {selectedSlot.patient} ({selectedSlot.date})
                </p>
              </div>
            )}

            {/* Date selector */}
            <div className="mb-4">
              <label className="text-sm text-gray-700 mb-1 block">Reschedule Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border rounded-md px-2 py-1 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">If you choose another date, only slots after 5:00 PM will be shown.</p>
            </div>

            {/* Available Slots */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">
                Available Slots
              </h4>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => slot.available && setSelectedRescheduleSlot(slot)}
                    disabled={!slot.available}
                    className={`p-3 rounded-md text-sm font-medium transition-colors ${
                      !slot.available
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : selectedRescheduleSlot?.id === slot.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                    }`}
                  >
                    {slot.time12}
                    {!slot.available && (
                      <div className="text-xs mt-1">Booked</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Reschedule Slot */}
            {selectedRescheduleSlot && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-md mb-4">
                <p className="text-sm text-blue-800 font-medium mb-1">New Slot Selected:</p>
                <p className="text-sm text-blue-700">{selectedRescheduleSlot.time12}</p>
              </div>
            )}

            {/* Reschedule Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleBackToConfirm}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleRescheduleConfirm}
                disabled={!selectedRescheduleSlot}
                className={`px-4 py-2 text-white rounded-md transition-colors ${
                  selectedRescheduleSlot
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Confirm Reschedule
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PopUpMessage;