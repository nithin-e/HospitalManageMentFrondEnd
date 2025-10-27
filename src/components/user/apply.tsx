import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Navbar from '@/components/user/Navbar';
import Footer from '@/components/user/Footer';
import { Button } from '@/components/ui/docui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { registerDoctorApi } from '@/store/redux/auth/StoreDoctorData';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/redux/store';
import { PlusCircle, Upload, UserCircle, Check, AlertCircle, FileText, Phone, Mail, ClipboardCheck, Stethoscope } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Inputt } from './reusable/Input';
import { fetchServicesApi } from '@/store/AdminSideApi/fetchServices';


const Apply: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    licenseNumber: "",
    specialty: "",
    qualifications: "",
    medicalLicenseNumber: "",
    agreeTerms: false,
  });
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [medicalLicense, setMedicalLicense] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitMessage, setSubmitMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formProgress, setFormProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<'personal' | 'professional' | 'documents'>('personal');
  const personalSectionRef = useRef<HTMLDivElement>(null);
  const professionalSectionRef = useRef<HTMLDivElement>(null);
  const documentsSectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Retrieve userId from Redux store
  const userId = useSelector((state: RootState) => state.user?.user._id||'');





  useEffect(() => {
  const fetchSpecialties = async () => {
    try {
      setLoadingSpecialties(true);
      const response = await fetchServicesApi();
      console.log('fetch services response', response);

      if (response && response.data && Array.isArray(response.data)) {
       
        const specialtiesData = response.data.map((service: any) => service.name);
        setSpecialties(specialtiesData);
      } else {
        console.error('No services found or invalid response format');
   
        setSpecialties([
          "Cardiology",
          "Dermatology",
          "Endocrinology",
          "Gastroenterology",
          "Neurology",
          "Oncology",
          "Pediatrics",
          "Psychiatry",
          "Radiology",
          "Surgery",
          "Urology",
        ]);
      }
    } catch (error) {
      console.error('Fetch services failed', error);
     
      setSpecialties([
        "Cardiology",
        "Dermatology",
        "Endocrinology",
        "Gastroenterology",
        "Neurology",
        "Oncology",
        "Pediatrics",
        "Psychiatry",
        "Radiology",
        "Surgery",
        "Urology",
      ]);
    } finally {
      setLoadingSpecialties(false);
    }
  };

  fetchSpecialties();
}, []);

  console.log('this is component Apply.tsx so check the user id getting or not inside the redux',userId)

  useEffect(() => {
 
    const totalFields = 9; 
    let completedFields = 0;
    
    if (formData.firstName.length >= 2) completedFields++;
    if (formData.lastName.length >= 2) completedFields++;
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) completedFields++;
    if (formData.phoneNumber.length >= 10) completedFields++;
    if (formData.licenseNumber.length >= 5) completedFields++;
    if (formData.specialty) completedFields++;
    if (formData.qualifications.length >= 10) completedFields++;
    if (formData.medicalLicenseNumber.length >= 5) completedFields++;
    if (profileImage && medicalLicense && formData.agreeTerms) completedFields++;

    setFormProgress(Math.floor((completedFields / totalFields) * 100));
  }, [formData, profileImage, medicalLicense]);

  // Background design effect
  useEffect(() => {
    // Add floating medical symbols effect
    const addMedicalSymbols = () => {
      const symbolsContainer = document.getElementById('medical-symbols-container');
      if (!symbolsContainer) return;
      
      const symbols = ['⚕️', '+', '🩺', '💊', '🏥'];
      const count = 12;
      
      for (let i = 0; i < count; i++) {
        const symbol = document.createElement('div');
        symbol.className = 'medical-symbol';
        symbol.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        
        // Random positions and animations
        const size = Math.random() * 20 + 10;
        const isPlus = symbol.innerText === '+';
        
        symbol.style.position = 'absolute';
        symbol.style.fontSize = `${isPlus ? size * 2 : size}px`;
        symbol.style.color = isPlus ? 'rgba(52, 152, 219, 0.15)' : 'rgba(46, 204, 113, 0.15)';
        symbol.style.left = `${Math.random() * 90 + 5}%`;
        symbol.style.top = `${Math.random() * 70 + 15}%`;
        symbol.style.opacity = '0';
        symbol.style.transform = 'translateY(20px)';
        symbol.style.transition = 'all 1s ease-out';
        symbol.style.animationDuration = `${Math.random() * 5 + 10}s`;
        symbol.style.animationDelay = `${Math.random() * 5}s`;
        symbol.style.zIndex = '0';
        
        symbolsContainer.appendChild(symbol);
        
        setTimeout(() => {
          symbol.style.opacity = '1';
          symbol.style.transform = 'translateY(0)';
        }, Math.random() * 1000 + 500);
      }
    };
    
    addMedicalSymbols();
    
    // Clean up function
    return () => {
      const symbolsContainer = document.getElementById('medical-symbols-container');
      if (symbolsContainer) {
        symbolsContainer.innerHTML = '';
      }
    };
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters.";
    }
    if (formData.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (formData.phoneNumber.length < 10) {
      newErrors.phoneNumber = "Please enter a valid phone number.";
    }
    if (formData.licenseNumber.length < 5) {
      newErrors.licenseNumber = "Please enter a valid license number.";
    }
    if (!formData.specialty) {
      newErrors.specialty = "Please select a specialty.";
    }
    if (formData.qualifications.length < 10) {
      newErrors.qualifications = "Please provide details about your qualifications.";
    }
    if (formData.medicalLicenseNumber.length < 5) {
      newErrors.medicalLicenseNumber = "Please enter a valid medical license number.";
    }
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms to continue.";
    }
    if (!profileImage) {
      newErrors.profileImage = "Please upload your profile image.";
    }
    if (!medicalLicense) {
      newErrors.medicalLicense = "Please upload your medical license.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { name: string; value: string }
  ) => {
    if ("target" in e) {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [e.name]: e.value }));
    }
  };

  const handleCheckboxChange = () => {
    setFormData((prev) => ({ ...prev, agreeTerms: !prev.agreeTerms }));
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMedicalLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMedicalLicense(e.target.files[0]);
    }
  };

  const scrollToSection = (section: 'personal' | 'professional' | 'documents') => {
    setActiveSection(section);
    
    let ref;
    switch(section) {
      case 'personal':
        ref = personalSectionRef;
        break;
      case 'professional':
        ref = professionalSectionRef;
        break;
      case 'documents':
        ref = documentsSectionRef;
        break;
    }
    
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitMessage("");
      
      // Find the first section with errors and scroll to it
      if (errors.firstName || errors.lastName || errors.email || errors.phoneNumber || errors.licenseNumber) {
        scrollToSection('personal');
      } else if (errors.specialty || errors.qualifications || errors.medicalLicenseNumber) {
        scrollToSection('professional');
      } else if (errors.profileImage || errors.medicalLicense || errors.agreeTerms) {
        scrollToSection('documents');
      }
      
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");

    // Create FormData object
    const apiData = new FormData();
    
    // Append form data
    apiData.append("userId", userId || "");
    apiData.append("firstName", formData.firstName);
    apiData.append("lastName", formData.lastName);
    apiData.append("email", formData.email);
    apiData.append("phoneNumber", formData.phoneNumber);
    apiData.append("licenseNumber", formData.licenseNumber);
    apiData.append("specialty", formData.specialty);
    apiData.append("qualifications", formData.qualifications);
    apiData.append("medicalLicenseNumber", formData.medicalLicenseNumber);
    apiData.append("agreeTerms", String(formData.agreeTerms));
    
    // Append files
    if (profileImage) {
      apiData.append("profileImage", profileImage);
    }
    if (medicalLicense) {
      apiData.append("medicalLicense", medicalLicense);
    }

    try {
      
      
      const response = await registerDoctorApi(apiData);

      console.log('check this responce------------------------',response);
      
      
      if (response.data.success === true) {
        navigate('/successForDoctorApplication');
      } else {
        setSubmitMessage(response.data.message);
      }

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        licenseNumber: "",
        specialty: "",
        qualifications: "",
        medicalLicenseNumber: "",
        agreeTerms: false,
      });
      setProfileImage(null);
      setProfileImagePreview(null);
      setMedicalLicense(null);
      setErrors({});
    } catch (error: any) {
      setSubmitMessage(`Failed to submit application: ${error.message}`);
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderErrorMessage = (fieldName: string) => {
    return errors[fieldName] ? (
      <p className="text-sm text-red-600 flex items-center mt-1">
        <AlertCircle className="w-4 h-4 mr-1" /> {errors[fieldName]}
      </p>
    ) : null;
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-gradient-to-b from-blue-50 to-white mt-8">
      {/* Medical symbols container */}
      <div id="medical-symbols-container" className="fixed inset-0 pointer-events-none overflow-hidden"></div>
      
      {/* Background pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      
      {/* Circle decorative elements */}
      <div className="absolute top-20 left-20 w-32 h-32 rounded-full border-4 border-blue-100 opacity-30 hidden md:block"></div>
      <div className="absolute bottom-32 right-32 w-16 h-16 rounded-full border-4 border-green-100 opacity-30 hidden md:block"></div>
      
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-md mb-8">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Stethoscope className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Join Our Medical Team</h1>
                <p className="text-gray-600">
                  Thank you for your interest in volunteering as a pro bono physician
                </p>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Application Progress</span>
                <span className="text-sm font-medium text-blue-600">{formProgress}% Complete</span>
              </div>
              <Progress value={formProgress} className="h-2" />
            </div>
            
            <div className="flex mb-8 border-b">
              <button 
                className={`px-4 py-2 font-medium text-sm ${activeSection === 'personal' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => scrollToSection('personal')}
              >
                Personal Information
              </button>
              <button 
                className={`px-4 py-2 font-medium text-sm ${activeSection === 'professional' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => scrollToSection('professional')}
              >
                Professional Details
              </button>
              <button 
                className={`px-4 py-2 font-medium text-sm ${activeSection === 'documents' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => scrollToSection('documents')}
              >
                Documents & Terms
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information Section */}
              <div ref={personalSectionRef} className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <UserCircle className="w-5 h-5 mr-2" />
                  Personal Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      disabled={isSubmitting}
                      className={`border ${errors.firstName ? 'border-red-300' : 'border-gray-300'} focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                      autoComplete="given-name"
                    />
                    {renderErrorMessage('firstName')}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      disabled={isSubmitting}
                      className={`border ${errors.lastName ? 'border-red-300' : 'border-gray-300'} focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                      autoComplete="family-name"
                    />
                    {renderErrorMessage('lastName')}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Mail className="w-4 h-4 mr-1" /> Email Address
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="doctor@example.com"
                    disabled={isSubmitting}
                    className={`border ${errors.email ? 'border-red-300' : 'border-gray-300'} focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                    autoComplete="email"
                  />
                  {renderErrorMessage('email')}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Phone className="w-4 h-4 mr-1" /> Phone Number
                  </label>
                  <Input
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                    disabled={isSubmitting}
                    className={`border ${errors.phoneNumber ? 'border-red-300' : 'border-gray-300'} focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                    autoComplete="tel"
                  />
                  {renderErrorMessage('phoneNumber')}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <ClipboardCheck className="w-4 h-4 mr-1" /> License Number
                  </label>
                  <Input
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    placeholder="Enter your license number"
                    disabled={isSubmitting}
                    className={`border ${errors.licenseNumber ? 'border-red-300' : 'border-gray-300'} focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                  />
                  {renderErrorMessage('licenseNumber')}
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => scrollToSection('professional')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Next: Professional Details
                  </Button>
                </div>
              </div>

              {/* Professional Information Section */}
              <div ref={professionalSectionRef} className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <Stethoscope className="w-5 h-5 mr-2" />
                  Professional Details
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medical Specialty</label>
                  <Select
                    onValueChange={(value) => handleChange({ name: "specialty", value })}
                    value={formData.specialty}
                    disabled={isSubmitting || loadingSpecialties}
                  >
                    <SelectTrigger className={`border ${errors.specialty ? 'border-red-300' : 'border-gray-300'} focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}>
                      <SelectValue placeholder={loadingSpecialties ? "Loading specialties..." : "Select your specialty"} />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {renderErrorMessage('specialty')}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications & Experience</label>
                  <Textarea
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleChange}
                    placeholder="Please provide details of your education, certifications, and relevant experience"
                    className={`min-h-[120px] border ${errors.qualifications ? 'border-red-300' : 'border-gray-300'} focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                    disabled={isSubmitting}
                  />
                  {renderErrorMessage('qualifications')}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FileText className="w-4 h-4 mr-1" /> Medical License Number
                  </label>
                  <Inputt
                    name="medicalLicenseNumber"
                    value={formData.medicalLicenseNumber}
                    onChange={handleChange}
                    placeholder="Enter your medical license number"
                    disabled={isSubmitting}
                    className={`border ${errors.medicalLicenseNumber ? 'border-red-300' : 'border-gray-300'} focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50`}
                  />
                  {renderErrorMessage('medicalLicenseNumber')}
                </div>
                
                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => scrollToSection('personal')}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => scrollToSection('documents')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Next: Upload Documents
                  </Button>
                </div>
              </div>

              {/* Documents & Terms Section */}
              <div ref={documentsSectionRef} className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Documents & Terms
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`border ${errors.profileImage ? 'border-red-300' : 'border-gray-300'} rounded-lg p-4 flex flex-col items-center justify-center h-64 bg-gray-50 cursor-pointer hover:bg-gray-100 transition duration-200`}
                    onClick={() => document.getElementById('profile-upload')?.click()}>
                    {profileImagePreview ? (
                      <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full overflow-hidden mb-2 border-2 border-blue-500">
                          <img src={profileImagePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-sm text-gray-600">Click to change</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                          <UserCircle className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">Upload Profile Image</p>
                        <p className="text-xs text-gray-500 mt-1">JPEG, PNG or GIF (Max 5MB)</p>
                      </>
                    )}
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfileImageChange}
                      disabled={isSubmitting}
                    />
                    {renderErrorMessage('profileImage')}
                  </div>
                  
                  <div className={`border ${errors.medicalLicense ? 'border-red-300' : 'border-gray-300'} rounded-lg p-4 flex flex-col items-center justify-center h-64 bg-gray-50 cursor-pointer hover:bg-gray-100 transition duration-200`}
                    onClick={() => document.getElementById('license-upload')?.click()}>
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Upload Medical License</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, JPG, or PNG (Max 10MB)</p>
                    {medicalLicense && (
                      <div className="mt-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center">
                        <Check className="w-3 h-3 mr-1" /> {medicalLicense.name}
                      </div>
                    )}
                    <input
                      id="license-upload"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={handleMedicalLicenseChange}
                      disabled={isSubmitting}
                    />
                    {renderErrorMessage('medicalLicense')}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={formData.agreeTerms}
                      onCheckedChange={handleCheckboxChange}
                      disabled={isSubmitting}
                      className={errors.agreeTerms ? 'border-red-500' : ''}
                    />
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        I have read and agree to the MedCare terms of use and privacy policy
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        By checking this box, you confirm that all information provided is accurate and complete.
                      </p>
                      {renderErrorMessage('agreeTerms')}
                    </div>
                  </div>
                </div>
                
                {submitMessage && (
                  <Alert className={submitMessage.includes("Failed") ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}>
                    <AlertDescription className={submitMessage.includes("Failed") ? "text-red-700" : "text-green-700"}>
                      {submitMessage}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => scrollToSection('professional')}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="min-w-[200px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <PlusCircle className="w-5 h-5 mr-2" /> Submit Application
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
          
        
          
          <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold mb-2">Why Join Our Medical Team?</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>Make a meaningful impact by providing healthcare to underserved communities</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>Flexible scheduling to fit your availability</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>Connect with a network of passionate healthcare professionals</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>Professional development opportunities through collaborative care</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Apply;