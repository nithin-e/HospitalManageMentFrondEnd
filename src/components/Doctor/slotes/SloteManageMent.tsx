import { useState, useEffect } from 'react';
import { Calendar, Clock, Coffee, Edit, Check, Plus, AlertCircle, Eye, Users, Info, AlertTriangle } from 'lucide-react';
import Sidebar from '../layout/Sidebar';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/redux/store';
import { 
  storeAppointmentSlots,  
  fetchDoctorAppointmentSlots 
} from '@/store/redux/slices/DoctorSlice';
import { useToast } from '@/hooks/use-toast';
import PopUpMessage from '../components/popUpMessege';
import { useSocket } from '@/context/socketContext';
import { ArrowRight } from 'lucide-react';

export default function DoctorAppointmentScheduler() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [dateRange, setDateRange] = useState('oneWeek');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<Record<string, Array<{time: string, type: string}>>>({});
  const [removedSlots, setRemovedSlots] = useState<string[]>([]);
  const [dateValidationError, setDateValidationError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState(30);
  const [includeRestPeriods, setIncludeRestPeriods] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [savedDates, setSavedDates] = useState<string[]>([]);
  const [slotsCreated, setSlotsCreated] = useState(0);
  const [showSavedInfo, setShowSavedInfo] = useState(false);
  const [showScheduleOverview, setShowScheduleOverview] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [existingTimes, setExistingTimes] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [datesWithSlots, setDatesWithSlots] = useState<string[]>([]);
  
  const dispatch = useDispatch<AppDispatch>();
  const doctorData = useSelector((state: RootState) => state.doctor.data.doctor);
  const savedAppointmentData = useSelector((state: RootState) => state.doctor?.appointmentSlots);
  
  const doctorEmail = doctorData?.email || '';
  const doctorName = doctorData?.firstName || 'Doctor';
  const { socket, connected } = useSocket();

  useEffect(() => {
    if (doctorEmail) {
      dispatch(fetchDoctorAppointmentSlots(doctorEmail));
    }
  }, [dispatch, doctorEmail]);

  useEffect(() => {
    if (savedAppointmentData?.result?.success) {
      const slotData = savedAppointmentData.result;
      
      if (slotData.dates && slotData.dates.length > 0) {
        setSavedDates(slotData.dates);
        setDatesWithSlots(slotData.dates); // Set dates that actually have slots
        setSlotsCreated(slotData.slots_created || 0);
        setShowSavedInfo(true);
      }
      
      if (slotData.timeSlots) {
        const formattedTimeSlots: Record<string, Array<{time: string, type: string}>> = {};
        
        slotData.timeSlots.forEach((dateSlot: {date: string, slots: string[]}) => {
          formattedTimeSlots[dateSlot.date] = dateSlot.slots.map(time => ({
            time: time,
            type: 'appointment'
          }));
          
          if (slotData.includeRestPeriods) {
            const updatedSlots = [];
            let i = 0;
            
            while (i < formattedTimeSlots[dateSlot.date].length) {
              updatedSlots.push(formattedTimeSlots[dateSlot.date][i]);
              
              if (i < formattedTimeSlots[dateSlot.date].length - 1) {
                const slotTime = new Date(`2023-01-01T${formattedTimeSlots[dateSlot.date][i].time}`);
                slotTime.setMinutes(slotTime.getMinutes() + slotDuration);
                
                const restTimeString = slotTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                });
                
                updatedSlots.push({
                  time: restTimeString,
                  type: 'rest'
                });
              }
              
              i++;
            }
            
            formattedTimeSlots[dateSlot.date] = updatedSlots;
          }
        });
        
        setTimeSlots(formattedTimeSlots);
        
        if (slotData.selectedDates) {
          setSelectedDates(slotData.selectedDates);
        } else {
          setSelectedDates(Object.keys(formattedTimeSlots));
        }
        
        if (slotData.dateRange) setDateRange(slotData.dateRange);
        if (slotData.startTime) setStartTime(slotData.startTime);
        if (slotData.endTime) setEndTime(slotData.endTime);
        if (slotData.slotDuration) setSlotDuration(slotData.slotDuration);
        if (slotData.includeRestPeriods !== undefined) setIncludeRestPeriods(slotData.includeRestPeriods);
      }
    }
  }, [savedAppointmentData, slotDuration]);

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    const numDays = dateRange === 'oneWeek' ? 7 : 14;
    
    for (let i = 0; i < numDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date,
        formatted: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        dayOfWeek: date.getDay(),
        dateString: date.toISOString().split('T')[0]
      });
    }
    
    return dates;
  };

  const generateTimeSlots = (start, end, appointmentDuration) => {
    const slots = [];
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    
    const currentTime = new Date();
    currentTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date();
    endTime.setHours(endHour, endMinute, 0, 0);
    
    if (endTime <= currentTime) {
      endTime.setDate(endTime.getDate() + 1);
    }
    
    while (currentTime < endTime) {
      const timeString = currentTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      
      slots.push({
        time: currentTime.toTimeString().slice(0, 5),
        displayTime: timeString, 
        type: 'appointment'
      });
      
      currentTime.setMinutes(currentTime.getMinutes() + appointmentDuration);
      
      if (includeRestPeriods && currentTime < endTime) {
        const restTimeString = currentTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        
        slots.push({
          time: currentTime.toTimeString().slice(0, 5), 
          displayTime: restTimeString, 
          type: 'rest'
        });
        
        currentTime.setMinutes(currentTime.getMinutes() + 15);
      }
    }
    
    return slots;
  };

  const toggleDateSelection = (dateString: string) => {
    if (selectedDates.includes(dateString)) {
      setSelectedDates(selectedDates.filter(date => date !== dateString));
      const updatedSlots = {...timeSlots};
      delete updatedSlots[dateString];
      setTimeSlots(updatedSlots);
    } else {
      setSelectedDates([...selectedDates, dateString]);
    }
  };

  const handleTimeSlotSetup = (date) => {
    console.log('Setting up time slots for:', date);
    
    if (!startTime || !endTime) {
      alert('Please set start and end times first');
      return;
    }
    
    const slots = generateTimeSlots(startTime, endTime, slotDuration);
    setTimeSlots({
      ...timeSlots,
      [date]: slots
    });
  };

  const handleRemoveTimeSlots = (date: string) => {
    const updatedSlots = {...timeSlots};
    delete updatedSlots[date];
    setTimeSlots(updatedSlots);
  };

  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  const formatTimeForDisplay = (timeString) => {
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getAppointmentSlotsForDate = (date: string) => {
    return timeSlots[date]?.filter(slot => slot.type === 'appointment') || [];
  };

  const resetForm = () => {
    setShowSavedInfo(true);
  };

  const handleEditSavedSlots = () => {
    setShowSavedInfo(false);
    setIsEditingMode(true);
    setCurrentStep(2); 
  };

  const toggleScheduleOverview = () => {
    setShowScheduleOverview(!showScheduleOverview);
  };

  const handleRemoveIndividualSlot = (dateString: string, slotIndex: number) => {
    const updatedTimeSlots = { ...timeSlots };
    
    if (updatedTimeSlots[dateString]) {
      updatedTimeSlots[dateString] = updatedTimeSlots[dateString].filter((_, index) => index !== slotIndex);
      
      if (updatedTimeSlots[dateString].length === 0) {
        delete updatedTimeSlots[dateString];
      }
      
      setTimeSlots(updatedTimeSlots);
    }
  };

  const renderScheduleOverview = () => {
    if (!showSavedInfo || savedDates.length === 0) return null;

    return (
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Calendar size={24} className="text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-blue-800">Your Current Schedule Overview</h3>
          </div>
          <button
            onClick={toggleScheduleOverview}
            className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
          >
            <Eye size={16} className="mr-1" />
            {showScheduleOverview ? 'Hide Details' : 'View Details'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center">
              <Calendar size={20} className="text-blue-500 mr-2" />
              <div>
                <div className="text-2xl font-bold text-blue-800">{savedDates.length}</div>
                <div className="text-sm text-blue-600">Scheduled Days</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <div className="flex items-center">
              <Users size={20} className="text-green-500 mr-2" />
              <div>
                <div className="text-2xl font-bold text-green-800">{slotsCreated}</div>
                <div className="text-sm text-green-600">Available Slots</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <div className="flex items-center">
              <Clock size={20} className="text-purple-500 mr-2" />
              <div>
                <div className="text-2xl font-bold text-purple-800">{slotDuration}min</div>
                <div className="text-sm text-purple-600">Per Appointment</div>
              </div>
            </div>
          </div>
        </div>

        {showScheduleOverview && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                <Info size={16} className="mr-2" />
                Schedule Settings
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Date Range:</span>
                  <div className="font-medium">{dateRange === 'oneWeek' ? 'One Week' : 'Two Weeks'}</div>
                </div>
                <div>
                  <span className="text-gray-600">Working Hours:</span>
                  <div className="font-medium">{startTime} - {endTime}</div>
                </div>
                <div>
                  <span className="text-gray-600">Slot Duration:</span>
                  <div className="font-medium">{slotDuration} minutes</div>
                </div>
                <div>
                  <span className="text-gray-600">Rest Periods:</span>
                  <div className="font-medium">{includeRestPeriods ? 'Enabled (15min)' : 'Disabled'}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                <Calendar size={16} className="mr-2" />
                Detailed Schedule by Date
              </h4>
              <div className="space-y-3">
                {savedDates.sort().map(date => {
                  const appointmentSlots = getAppointmentSlotsForDate(date);
                  const totalSlots = appointmentSlots.length;
                  
                  return (
                    <div key={date} className="border-l-4 border-blue-400 pl-4 py-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-800">
                          {formatTimeForDisplay(date)}
                        </div>
                        <div className="text-sm text-blue-600 font-medium">
                          {totalSlots} appointments available
                        </div>
                      </div>
                      
                      {appointmentSlots.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {appointmentSlots.map((slot, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                            >
                              {slot.time}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-blue-200">
          <div className="flex items-center text-green-600">
            <Check size={16} className="mr-1" />
            <span className="text-sm">Schedule saved successfully</span>
          </div>
          <button 
            onClick={handleEditSavedSlots}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit size={16} className="mr-2" /> Edit Schedule
          </button>
        </div>
      </div>
    );
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
  
    try {
      let appointmentSettings;
      
      if (isEditingMode) {
        console.log('......isEditingMode isEditingMode isEditingMode isEditingMode isEditingMode.........');
        
        const newSlotsData = Object.keys(timeSlots).flatMap(date => 
          timeSlots[date]
            .filter(slot => slot.type === 'appointment')
            .map(slot => ({
              date: date,
              time: slot.time,
              type: slot.type,
              ...slot
            }))
        );

        appointmentSettings = {
          doctorEmail,
          action: 'update', 
          removedSlotIds: removedSlots, 
          remainingSlots: savedAppointmentData?.result?.slots
            ?.filter(slot => !removedSlots.includes(slot.id))
            ?.map(slot => ({
              id: slot.id,
              date: slot.date,
              time: slot.time,
              is_booked: slot.is_booked
            })) || [],
          newTimeSlots: newSlotsData,
          ...(newSlotsData.length > 0 && {
            startTime,
            endTime,
            slotDuration,
            includeRestPeriods
          })
        };
        
      } else {
        appointmentSettings = {
          doctorEmail,
          dateRange,
          selectedDates,
          startTime,
          endTime,
          slotDuration,
          includeRestPeriods,
          action: 'create',
          timeSlots: Object.keys(timeSlots).map(date => ({
            date,
            slots: timeSlots[date]
              .filter(slot => slot.type === 'appointment')
              .map(slot => slot.time)
          }))
        };
      }

      const response = await dispatch(storeAppointmentSlots(appointmentSettings));
      
      if (response.payload && response.payload.result && response.payload.result.success) {
        setSaveSuccess(true);
        setSavedDates(response.payload.result.dates || []);
        setDatesWithSlots(response.payload.result.dates || []); // Update dates with slots
        setSlotsCreated(response.payload.result.slots_created || 0);
        setIsEditingMode(false);
        setRemovedSlots([]);
        setTimeSlots({});
        resetForm();
        setCurrentStep(1);
        
        if (doctorEmail) {
          dispatch(fetchDoctorAppointmentSlots(doctorEmail));
        }
      } else {
        throw new Error('Failed to save appointment settings');
      }
    } catch (error: any) {
      setSaveError(error.message || 'An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      {renderScheduleOverview()}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Step 1: Select Doctor and Date Range</h2>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <input
              type="radio"
              id="oneWeek"
              name="dateRange"
              checked={true}
              readOnly
              className="h-4 w-4 text-blue-600"
            />
            <label htmlFor="oneWeek" className="ml-2 text-gray-700">
              One Week Schedule
              <p className="text-sm text-gray-500 mt-1">Select dates from the next 7 days</p>
            </label>
          </div>
        </div>
  
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            <Info size={16} className="inline mr-1" />
            You can select multiple dates in the next step
          </div>
          <button
            onClick={nextStep}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
          >
            {showSavedInfo && savedDates.length > 0 ? 'Create New Schedule' : 'Next'}
            <ArrowRight size={16} className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );

  // const renderStep2 = () => {
  //   const allDates = generateDates();
  //   const datesToShow = isEditingMode 
  //     ? allDates.filter(date => datesWithSlots.includes(date.dateString)) // Only show dates that have slots
  //     : allDates;
    
  //   const checkForExistingSlots = () => {
  //     if (isEditingMode) return null; 
      
  //     const conflictingDates = selectedDates.filter(date => 
  //       savedDates.includes(date) || timeSlots[date]
  //     );
      
  //     if (conflictingDates.length > 0) {
  //       const conflictingDateStrings = conflictingDates.map(date => 
  //         formatTimeForDisplay(date)
  //       ).join(', ');
        
  //       return `The following date(s) already have appointment slots: ${conflictingDateStrings}. Please edit these dates instead of creating new ones.`;
  //     }
      
  //     return null;
  //   };
    
  //   const handleNextStep = () => {
  //     if (!isEditingMode) {
  //       const validationError = checkForExistingSlots();
        
  //       if (validationError) {
  //         setDateValidationError(validationError);
  //         return;
  //       }
  //     }
      
  //     setDateValidationError(null);
  //     nextStep();
  //   };
    
  //   return (
  //     <div className="bg-white rounded-lg shadow-md p-6">
  //       <h2 className="text-xl font-semibold mb-4">
  //         Step 2: {isEditingMode ? 'Edit Your Scheduled Days' : 'Select Days'}
  //       </h2>
        
  //       {isEditingMode && (
  //         <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
  //           <p className="text-blue-700 text-sm">
  //             You are editing your existing schedule. Only your currently scheduled days are shown below.
  //           </p>
  //         </div>
  //       )}
        
  //       {!isEditingMode && dateValidationError && (
  //         <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
  //           <AlertCircle className="text-red-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
  //           <div>
  //             <p className="text-red-700 text-sm">{dateValidationError}</p>
  //             <button
  //               onClick={() => setDateValidationError(null)}
  //               className="text-red-600 text-xs underline mt-1 hover:text-red-800"
  //             >
  //               Dismiss
  //             </button>
  //           </div>
  //         </div>
  //       )}
        
  //       {isEditingMode && datesToShow.length === 0 && (
  //         <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
  //           <p className="text-yellow-700 text-sm">
  //             No scheduled dates found to edit. Please create a new schedule first.
  //           </p>
  //         </div>
  //       )}
        
  //       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-6">
  //         {datesToShow.map((date) => {
  //           const hasExistingSlots = savedDates.includes(date.dateString) || timeSlots[date.dateString];
            
  //           return (
  //             <div 
  //               key={date.dateString}
  //               className={`p-3 border rounded-md cursor-pointer transition-colors relative ${
  //                 selectedDates.includes(date.dateString) 
  //                   ? 'bg-blue-100 border-blue-500' 
  //                   : hasExistingSlots
  //                     ? 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100'
  //                     : 'hover:bg-gray-50'
  //               }`}
  //               onClick={() => toggleDateSelection(date.dateString)}
  //             >
  //               <div className="flex items-center">
  //                 <Calendar size={16} className="mr-2" />
  //                 <span>{date.formatted}</span>
  //               </div>
                
  //               {hasExistingSlots && (
  //                 <div className="absolute top-1 right-1">
  //                   <Info size={12} className="text-yellow-600" />
  //                 </div>
  //               )}
  //             </div>
  //           );
  //         })}
  //       </div>
  
  //       <div className="flex justify-between">
  //         <button
  //           onClick={() => {
  //             if (isEditingMode) {
  //               setIsEditingMode(false);
  //               setShowSavedInfo(true);
  //               setCurrentStep(1);
  //             } else {
  //               prevStep();
  //             }
  //           }}
  //           className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
  //         >
  //           {isEditingMode ? 'Cancel Edit' : 'Back'}
  //         </button>
  //         <button
  //           onClick={handleNextStep}
  //           disabled={selectedDates.length === 0}
  //           className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 ${
  //             selectedDates.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
  //           }`}
  //         >
  //           Next
  //         </button>
  //       </div>
  //     </div>
  //   );
  // };




  const renderStep2 = () => {
    const allDates = generateDates();
    const datesToShow = isEditingMode 
      ? allDates.filter(date => savedDates.includes(date.dateString) || timeSlots[date.dateString])
      : allDates;
    
    // Get dates that already have slots from the saved data
    const datesWithSlots = savedAppointmentData?.result?.slots 
      ? [...new Set(savedAppointmentData.result.slots.map(slot => slot.date))]
      : [];
    
    const checkForExistingSlots = () => {
      if (isEditingMode) return null; 
      
      const conflictingDates = selectedDates.filter(date => 
        savedDates.includes(date) || timeSlots[date]
      );
      
      if (conflictingDates.length > 0) {
        const conflictingDateStrings = conflictingDates.map(date => 
          formatTimeForDisplay(date)
        ).join(', ');
        
        return `The following date(s) already have appointment slots: ${conflictingDateStrings}. Please edit these dates instead of creating new ones.`;
      }
      
      return null;
    };
    
    const handleNextStep = () => {
      if (!isEditingMode) {
        const validationError = checkForExistingSlots();
        
        if (validationError) {
          setDateValidationError(validationError);
          return;
        }
      }
      
      setDateValidationError(null);
      nextStep();
    };
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          Step 2: {isEditingMode ? 'Edit Your Scheduled Days' : 'Select Days'}
        </h2>
        
        {isEditingMode && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm">
              You are editing your existing schedule. Only your currently scheduled days are shown below.
            </p>
          </div>
        )}
        
        {!isEditingMode && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm">
              Dates with existing slots are marked with a <span className="font-semibold">green indicator</span>.
              You can select them to edit existing slots or choose new dates to create slots.
            </p>
          </div>
        )}
        
        {!isEditingMode && dateValidationError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="text-red-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
            <div>
              <p className="text-red-700 text-sm">{dateValidationError}</p>
              <button
                onClick={() => setDateValidationError(null)}
                className="text-red-600 text-xs underline mt-1 hover:text-red-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        
        {isEditingMode && datesToShow.length === 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 text-sm">
              No scheduled dates found to edit. Please create a new schedule first.
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-6">
          {datesToShow.map((date) => {
            const hasExistingSlots = datesWithSlots.includes(date.dateString);
            const hasNewSlots = timeSlots[date.dateString];
            const isSelected = selectedDates.includes(date.dateString);
            
            return (
              <div 
                key={date.dateString}
                className={`p-3 border rounded-md cursor-pointer transition-colors relative ${
                  isSelected
                    ? 'bg-blue-100 border-blue-500' 
                    : hasExistingSlots
                      ? 'bg-green-50 border-green-300 hover:bg-green-100'
                      : hasNewSlots
                        ? 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100'
                        : 'hover:bg-gray-50'
                }`}
                onClick={() => toggleDateSelection(date.dateString)}
              >
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2" />
                  <span>{date.formatted}</span>
                </div>
                
                {hasExistingSlots && (
                  <div className="absolute top-1 right-1 flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                    <span className="text-xs text-green-700">Slots</span>
                  </div>
                )}
                
                {hasNewSlots && !hasExistingSlots && (
                  <div className="absolute top-1 right-1 flex items-center">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></div>
                    <span className="text-xs text-yellow-700">New</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
  
        <div className="flex justify-between">
          <button
            onClick={() => {
              if (isEditingMode) {
                setIsEditingMode(false);
                setShowSavedInfo(true);
                setCurrentStep(1);
              } else {
                prevStep();
              }
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {isEditingMode ? 'Cancel Edit' : 'Back'}
          </button>
          <button
            onClick={handleNextStep}
            disabled={selectedDates.length === 0}
            className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 ${
              selectedDates.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Next
          </button>
        </div>
      </div>
    );
  };



  const renderStep3 = () => {
    const formatTimeForDisplay = (timeString) => {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    };

    const getExistingTimesForDate = (dateString) => {
      const existingTimes = [];
      
      if (savedAppointmentData?.result?.slots) {
        const existingSlotsForDate = savedAppointmentData.result.slots
          .filter(slot => slot.date === dateString && !removedSlots.includes(slot.id))
          .map(slot => slot.time);
        existingTimes.push(...existingSlotsForDate);
      }
      
      if (timeSlots[dateString]) {
        const newSlotsForDate = timeSlots[dateString]
          .filter(slot => slot.type === 'appointment')
          .map(slot => slot.time);
        existingTimes.push(...newSlotsForDate);
      }
      
      return existingTimes;
    };

    const handleSlotRemoval = (slot) => {
      const existingTimes = getExistingTimesForDate(slot.date);
      
      if (slot.is_booked) {
        setSelectedSlot(slot);
        setExistingTimes(existingTimes);
        setShowPopup(true);
      } else {
        setRemovedSlots(prev => [...prev, slot.id]);
        toast({
          title: "Slot Removed",
          description: "Available slot removed successfully.",
        });
      }
    };

    const handleConfirmReshedule = (data) => {
      const rescheduleData = {
        action: data.action,
        patientEmail: data.originalSlot.patientEmail,
        doctorEmail: doctorEmail,
        originalSlot: {
          id: data.originalSlot.id,
          date: data.originalSlot.date,
          time: data.originalSlot.time,
          doctor_id: data.originalSlot.doctor_id
        },
        newSlot: {
          id: data.newSlot.id,
          time24: data.newSlot.time24,
          time12: data.newSlot.time12,
          available: data.newSlot.available
        }
      };

      socket.emit('reschedule-appointment', rescheduleData, (response) => {
        console.log("Socket response:", response);
      });
      
      setShowPopup(false);
      setSelectedSlot(null);
    };

    const handleCancelAction = () => {
      setShowPopup(false);
      setSelectedSlot(null);
    };

    const handleRemoveAllSlotsForDate = (daySlots) => {
      const availableSlots = daySlots.filter(slot => !slot.is_booked);
      const bookedSlots = daySlots.filter(slot => slot.is_booked);
      
      if (bookedSlots.length > 0) {
        // const confirmed = window.confirm(
        //   `Are you sure you want to remove all slots for this date?\n\n` +
        //   `This will remove:\n` +
        //   `• ${availableSlots.length} available slots\n` +
        //   `• ${bookedSlots.length} booked slots (will cancel user appointments)\n\n` +
        //   `Removing booked slots will cancel user appointments. This action cannot be undone.`
        // );


        socket.emit('canceling_Booked_UserAppointMent', bookedSlots, (response) => {
        console.log("Socket response:", response);
      });
         const confirmed =true
        
        if (confirmed) {
          const slotsToRemove = daySlots.map(slot => slot.id);
          setRemovedSlots(prev => [...prev, ...slotsToRemove]);
        }
      } else {
        const slotsToRemove = availableSlots.map(slot => slot.id);
        setRemovedSlots(prev => [...prev, ...slotsToRemove]);
      }
    };

    const handleTimeSlotSetupWithAvoidance = (dateString) => {
      if (!startTime || !endTime) {
        alert('Please set start and end times first');
        return;
      }

      const existingTimes = getExistingTimesForDate(dateString);
      const slots = [];
      const start = new Date(`2000-01-01 ${startTime}`);
      const end = new Date(`2000-01-01 ${endTime}`);
      
      if (start >= end) {
        alert('End time must be after start time');
        return;
      }

      let current = new Date(start);
      
      while (current < end) {
        const timeString = current.toTimeString().slice(0, 5);
        
        if (!existingTimes.includes(timeString)) {
          slots.push({
            time: timeString,
            type: 'appointment'
          });

          if (includeRestPeriods) {
            const restTime = new Date(current.getTime() + slotDuration * 60000);
            const restTimeString = restTime.toTimeString().slice(0, 5);
            
            if (restTime < end && !existingTimes.includes(restTimeString)) {
              slots.push({
                time: restTimeString,
                type: 'rest'
              });
            }
          }
        }

        const increment = includeRestPeriods ? slotDuration + 15 : slotDuration;
        current = new Date(current.getTime() + increment * 60000);
      }

      if (slots.length === 0) {
        alert('No available time slots can be created. All times in the specified range already exist or conflict with existing appointments.');
        return;
      }

      setTimeSlots(prev => ({
        ...prev,
        [dateString]: slots
      }));
    };

    return (
      <div className="space-y-6">
        <PopUpMessage
          showPopup={showPopup}
          onCancel={handleCancelAction}
          onConfirm={handleConfirmReshedule}
          selectedSlot={selectedSlot}
          existingTimes={existingTimes}
        />
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {isEditingMode ? 'Step 3: Edit Your Existing Time Slots' : 'Step 3: Set Time Slots'}
          </h2>

          {isEditingMode ? (
            <div className="mb-6">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700 text-sm">
                  <strong>Editing Mode:</strong> Below are your existing appointment slots for the selected dates from Step 2. 
                  You can remove individual slots or entire days as needed. You can also add new slots to these dates.
                  <br />
                  <strong>Note:</strong> When adding new slots, the system will automatically avoid conflicting with existing appointment times.
                  <br />
                  <strong>Warning:</strong> Removing booked slots will cancel user appointments.
                </p>
              </div>

              <h3 className="text-lg font-medium mb-3 flex items-center">
                <Edit size={18} className="mr-2" />
                Your Current Time Slots for Selected Dates
              </h3>

              <div className="space-y-4">
                {selectedDates.length > 0 ? (
                  (() => {
const slotsByDate = savedAppointmentData?.result?.slots
  ?.filter(slot => !removedSlots.includes(slot.id) && selectedDates.includes(slot.date))
  ?.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {}) || {}; 
                    return selectedDates.sort().map((dateString) => {
                      if (!slotsByDate[dateString] && !timeSlots[dateString]) return null;

                      const date = new Date(dateString);
                      const formattedDate = date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      });

                      const daySlots = slotsByDate[dateString] || [];
                      const availableSlots = daySlots.filter(slot => !slot.is_booked);
                      const bookedSlots = daySlots.filter(slot => slot.is_booked);
                      const existingTimes = getExistingTimesForDate(dateString);

                      return (
                        <div key={dateString} className="border rounded-md p-4 bg-gray-50">
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center">
                              <Calendar size={16} className="mr-2" />
                              <span className="font-medium">{formattedDate}</span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">
                                Total: {daySlots.length} | Available: {availableSlots.length} | Booked: {bookedSlots.length}
                              </span>
                              <button 
                                onClick={() => handleRemoveAllSlotsForDate(daySlots)}
                                className="text-red-500 text-sm hover:text-red-700 flex items-center"
                                disabled={daySlots.length === 0}
                              >
                                <AlertCircle size={14} className="mr-1" />
                                Remove All Slots
                              </button>
                            </div>
                          </div>

                          <div className="mt-3">
                            <h4 className="text-sm font-medium mb-2 flex items-center">
                              <Clock size={14} className="mr-1" /> 
                              Existing Time Slots (Click × to remove):
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                              {daySlots
                                .sort((a, b) => {
                                  const timeA = new Date(`2000-01-01 ${a.time}`);
                                  const timeB = new Date(`2000-01-01 ${b.time}`);
                                  return timeA.getTime() - timeB.getTime();
                                })
                                .map((slot) => (
                                  <div 
                                    key={slot.id} 
                                    className={`px-3 py-2 rounded text-sm flex items-center justify-between group border-2 ${
                                      slot.is_booked
                                        ? 'bg-red-50 text-red-700 border-red-300 opacity-75' 
                                        : 'bg-blue-50 text-blue-700 border-blue-300'
                                    }`}
                                  >
                                    <div className="flex items-center">
                                      <Clock size={12} className="mr-1" />
                                      <span>
                                        {formatTimeForDisplay(slot.time)}
                                        {slot.is_booked && ' (Booked)'}
                                      </span>
                                    </div>

                                    <button
                                      onClick={() => handleSlotRemoval(slot)}
                                      className={`ml-2 hover:bg-red-100 rounded px-1 font-bold transition-all ${
                                        slot.is_booked 
                                          ? 'text-red-600 hover:text-red-800' 
                                          : 'text-red-500 hover:text-red-700'
                                      }`}
                                      title={slot.is_booked ? "Remove this booked slot (will cancel appointment)" : "Remove this slot"}
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                            </div>

                            <div className="mt-4 p-4 bg-white border border-blue-200 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                  <Calendar size={16} className="mr-2" />
                                  <span className="font-medium">{formattedDate}</span>
                                  <span className="ml-2 text-xs text-gray-500">
                                    ({existingTimes.length} existing time slots)
                                  </span>
                                </div>

                                {timeSlots[dateString] ? (
                                  <button onClick={() => handleRemoveTimeSlots(dateString)}
                                    className="text-red-500 text-sm hover:text-red-700"
                                  >
                                    Remove All New Slots
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => handleTimeSlotSetupWithAvoidance(dateString)}
                                    className="text-blue-500 text-sm hover:text-blue-700 flex items-center"
                                    disabled={!startTime || !endTime}
                                  >
                                    <Plus size={14} className="mr-1" />
                                    Add New Slots 
                                  </button>
                                )}
                              </div>

                              {timeSlots[dateString] && (
                                <div className="mt-3">
                                  <h4 className="text-sm font-medium mb-2 flex items-center">
                                    <Plus size={14} className="mr-1" /> 
                                    New Time Slots to Add:
                                  </h4>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                    {timeSlots[dateString].map((slot, index) => (
                                      <div 
                                        key={index} 
                                        className={`px-3 py-2 rounded text-sm flex items-center justify-between group ${
                                          slot.type === 'rest' 
                                            ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                                            : 'bg-green-50 text-green-700 border border-green-200'
                                        }`}
                                      >
                                        <div className="flex items-center">
                                          {slot.type === 'rest' ? (
                                            <>
                                              <Coffee size={12} className="mr-1" /> 
                                              <span>{formatTimeForDisplay(slot.time)} (Rest)</span>
                                            </>
                                          ) : (
                                            <>
                                              <Clock size={12} className="mr-1" />
                                              <span>{formatTimeForDisplay(slot.time)} (New)</span>
                                            </>
                                          )}
                                        </div>

                                        <button
                                          onClick={() => handleRemoveIndividualSlot(dateString, index)}
                                          className="ml-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                          title="Remove this slot"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="mt-2 text-xs text-gray-500">
                                    {timeSlots[dateString].filter(slot => slot.type === 'appointment').length} new appointment slots
                                    {timeSlots[dateString].filter(slot => slot.type === 'rest').length > 0 && 
                                      `, ${timeSlots[dateString].filter(slot => slot.type === 'rest').length} rest periods`
                                    }
                                  </div>
                                </div>
                              )}

                              {!timeSlots[dateString] && (
                                <div className="mt-3">
                                  <h4 className="text-sm font-medium mb-3 flex items-center">
                                    <Plus size={14} className="mr-1" />
                                    Configure New Slots for This Date
                                  </h4>

                                  <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                                    <strong>Smart Conflict Avoidance:</strong> New slots will automatically skip times that conflict with existing appointments ({existingTimes.length} existing times will be avoided).
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                    <div>
                                      <label className="block text-gray-700 text-sm mb-1">
                                        Start Time
                                      </label>
                                      <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full border rounded-md px-2 py-1 text-sm"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-gray-700 text-sm mb-1">
                                        End Time
                                      </label>
                                      <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full border rounded-md px-2 py-1 text-sm"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-gray-700 text-sm mb-1">
                                        Duration
                                      </label>
                                      <select
                                        value={slotDuration}
                                        onChange={(e) => setSlotDuration(parseInt(e.target.value))}
                                        className="w-full border rounded-md px-2 py-1 text-sm"
                                      >
                                        <option value="15">15 minutes</option>
                                        <option value="30">30 minutes</option>
                                        <option value="45">45 minutes</option>
                                        <option value="60">60 minutes</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div className="flex items-center mb-3">
                                    <input
                                      type="checkbox"
                                      id={`includeRestPeriods-${dateString}`}
                                      checked={includeRestPeriods}
                                      onChange={(e) => setIncludeRestPeriods(e.target.checked)}
                                      className="h-4 w-4"
                                    />
                                    <label htmlFor={`includeRestPeriods-${dateString}`} className="ml-2 text-sm flex items-center">
                                      <Coffee size={12} className="mr-1 text-blue-500" /> 
                                      Include rest periods
                                    </label>
                                  </div>

                                  {existingTimes.length > 0 && (
                                    <div className="mt-3 p-2 bg-gray-50 border rounded text-xs">
                                      <strong>Existing times that will be avoided:</strong>
                                      <div className="mt-1 flex flex-wrap gap-1">
                                        {existingTimes.sort().map((time, idx) => (
                                          <span key={idx} className="bg-gray-200 px-2 py-1 rounded text-xs">
                                            {formatTimeForDisplay(time)}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="mt-3 p-3 bg-white rounded border">
                              <div className="text-sm text-gray-600 space-y-1">
                                <div><strong>Existing Slots:</strong> {daySlots.length}</div>
                                <div className="text-green-600"><strong>Available:</strong> {availableSlots.length}</div>
                                <div className="text-red-600"><strong>Booked:</strong> {bookedSlots.length}</div>
                                {timeSlots[dateString] && (
                                  <div className="text-blue-600">
                                    <strong>New Slots to Add:</strong> {timeSlots[dateString].filter(slot => slot.type === 'appointment').length}
                                  </div>
                                )}
                                {bookedSlots.length > 0 && (
                                  <div className="text-xs text-red-500 mt-1">
                                    * Removing booked slots will cancel user appointments
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                        </div>
                      );
                    }).filter(Boolean);
                  })()
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle size={16} className="text-yellow-600 mr-2" />
                      <span className="text-yellow-700">
                        No existing time slots found for the selected dates. 
                        Please select dates in Step 2 or create a new schedule.
                      </span>
                    </div>
                  </div>
                )}
              </div>
              

              {savedAppointmentData?.result?.slots && savedAppointmentData.result.slots.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Database Information:</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <div>• Total dates in database: {savedAppointmentData.result.dates?.length || 0}</div>
                    <div>• Total slots in database: {savedAppointmentData.result.slots.length}</div>
                    <div>• Available slots: {savedAppointmentData.result.slots.filter((slot) => !slot.is_booked).length}</div>
                    <div>• Booked slots: {savedAppointmentData.result.slots.filter((slot) => slot.is_booked).length}</div>
                    {removedSlots.length > 0 && (
                      <div className="text-orange-600">• Slots marked for removal: {removedSlots.length}</div>
                    )}
                    {Object.keys(timeSlots).length > 0 && (
                      <div className="text-blue-600">• New slots to be added: {
                        Object.values(timeSlots).reduce((total, slots) => 
                          total + slots.filter(slot => slot.type === 'appointment').length, 0
                        )
                      }</div>
                    )}
                  </div>
                </div>
              )}

              {removedSlots.length > 0 && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-2 flex items-center">
                    <AlertCircle size={16} className="mr-2" />
                    Pending Changes
                  </h4>
                  <div className="text-sm text-orange-700 space-y-1">
                    <div>• {removedSlots.length} slot(s) will be removed when you save</div>
                    <div className="text-xs text-red-600">
                      * This includes any booked slots that will cancel user appointments
                    </div>
                    <button
                      onClick={() => setRemovedSlots([])}
                      className="text-orange-600 text-xs underline hover:text-orange-800"
                    >
                      Undo all removals
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Default Time Settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    Appointment Duration (minutes)
                  </label>
                  <select
                    value={slotDuration}
                    onChange={(e) => setSlotDuration(parseInt(e.target.value))}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="includeRestPeriods"
                  checked={includeRestPeriods}
                  onChange={(e) => setIncludeRestPeriods(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="includeRestPeriods" className="ml-2 flex items-center">
                  <Coffee size={16} className="mr-1 text-blue-500" /> 
                  Include 15-minute rest periods between appointments
                </label>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Selected Days</h3>

                <div className="space-y-4">
                  {selectedDates.sort().map((dateString) => {
                    const date = new Date(dateString);
                    const formattedDate = date.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    });

                    return (
                      <div key={dateString} className="border rounded-md p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <Calendar size={16} className="mr-2" />
                            <span className="font-medium">{formattedDate}</span>
                          </div>

                          {timeSlots[dateString] ? (
                            <button onClick={() => handleRemoveTimeSlots(dateString)}
                              className="text-red-500 text-sm hover:text-red-700"
                            >
                              Remove All Slots
                            </button>
                          ) : (
                            <button onClick={() => handleTimeSlotSetup(dateString)}
                              className="text-blue-500 text-sm hover:text-blue-700"
                            >
                              Set Up Time Slots
                            </button>
                          )}
                        </div>

                        {timeSlots[dateString] && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium mb-2 flex items-center">
                              <Clock size={14} className="mr-1" /> Time Slots:
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {timeSlots[dateString].map((slot, index) => (
                                <div 
                                  key={index} 
                                  className={`px-3 py-2 rounded text-sm flex items-center justify-between group ${
                                    slot.type === 'rest' 
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                                  }`}
                                >
                                  <div className="flex items-center">
                                    {slot.type === 'rest' ? (
                                      <>
                                        <Coffee size={12} className="mr-1" /> 
                                        <span>{formatTimeForDisplay(slot.time)} (Rest)</span>
                                      </>
                                    ) : (
                                      <>
                                        <Clock size={12} className="mr-1" />
                                        <span>{formatTimeForDisplay(slot.time)}</span>
                                      </>
                                    )}
                                  </div>

                                  <button
                                    onClick={() => handleRemoveIndividualSlot(dateString, index)}
                                    className="ml-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remove this slot"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>

                            <div className="mt-2 text-xs text-gray-500">
                              {timeSlots[dateString].filter(slot => slot.type === 'appointment').length} appointment slots
                              {timeSlots[dateString].filter(slot => slot.type === 'rest').length > 0 && 
                                `, ${timeSlots[dateString].filter(slot => slot.type === 'rest').length} rest periods`
                              }
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <div>
              {saveError && (
                <div className="flex items-center text-red-500 text-sm mb-2">
                  <AlertCircle size={14} className="mr-1" /> {saveError}
                </div>
              )}
              <button
                onClick={saveSettings}
                disabled={
                  isSaving || 
                  (isEditingMode 
                    ? !savedAppointmentData?.result?.slots || savedAppointmentData.result.slots.length === 0
                    : Object.keys(timeSlots).length === 0
                  )
                }
                className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center ${
                  isSaving || 
                  (isEditingMode 
                    ? !savedAppointmentData?.result?.slots || savedAppointmentData.result.slots.length === 0
                    : Object.keys(timeSlots).length === 0
                  ) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSaving ? 'Saving...' : (isEditingMode ? 'Update Schedule' : 'Save Settings')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };







  const renderProgressBar = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          currentStep >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
        }`}>
          1
        </div>
        <span className="mx-2 text-sm">Doctor & Date Range</span>
      </div>
      
      <div className={`w-12 h-1 ${currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`} />
      
      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          currentStep >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'
        }`}>
          2
        </div>
        <span className="mx-2 text-sm">Select Days</span>
      </div>
      
      <div className={`w-12 h-1 ${currentStep >= 3 ? 'bg-blue-500' : 'bg-gray-200'}`} />
      
      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          currentStep === 3 ? 'bg-blue-500 text-white' : 'bg-gray-200'
        }`}>
          3
        </div>
        <span className="mx-2 text-sm">Set Time Slots</span>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar doctorName={doctorName} />
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Doctor Appointment Scheduler</h1>
            {renderProgressBar()}
          </div>
          
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>
      </div>
    </div>
  );
}