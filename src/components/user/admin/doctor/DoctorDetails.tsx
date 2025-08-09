import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Phone, Mail, MapPin, FileText, Award, Shield, CheckCheck, AlertTriangle, X, Check, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/user/ui/docui/avatar";
import { Button } from "@/components/user/ui/docui/button";
import { Badge } from "@/components/user/ui/docui/badge1";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/user/ui/docui/card1";
import { Separator } from "@/components/user/ui/docui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/user/ui/docui/sheet";
import { 
  AlertDialog,

  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/user/ui/alert-dialog";
import { Checkbox } from "@/components/user/ui/checkbox";
import { toast } from "sonner";
import { storeNotificationData } from "@/store/AdminSideApi/NotificationApi";
import { handlingAdminCancel } from "@/store/AdminSideApi/handlingAdminCancel";
import { blockingDoctor } from "@/store/AdminSideApi/BlockUser";

export const DoctorDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const doctor = location.state?.doctor;
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [isRejectionSuccessDialogOpen, setIsRejectionSuccessDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');


  console.log('plzz check this doctor details',doctor)

  if (!doctor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">Doctor not found</h2>
        <Button onClick={() => navigate("/doctors")}>Back to Doctors List</Button>
      </div>
    );
  }

  // Mock fields not provided in the API response
  const contact = {
    phone: doctor.phoneNumber || "Not provided",
    email: doctor.email || "Not provided",
    address: "Not provided",
  };

  // Mock license data based on API response
  const license = [
    {
      type: "Medical License",
      status: doctor.status && doctor.status.toLowerCase() === "approved" ? "Active" : "Pending",
      year: new Date(doctor.createdAt).getFullYear().toString(),
      number: doctor.medicalLicenseNumber,
      url: doctor.medicalLicenseUrl,
    },
  ];

 

  
  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const result = await storeNotificationData(doctor.email);
      
      if (result) {
        setIsApproveDialogOpen(false);
        setIsSuccessDialogOpen(true);
      } else {
        throw new Error("Failed to store notification data.");
      }
    } catch (error) {
      console.error("Error approving doctor:", error);
      toast.error(error.message || "Failed to approve doctor application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Predefined rejection reasons
  const rejectionReasons = [
    { id: "unclear_license", label: "Medical license photo is not clear" },
    { id: "insufficient_experience", label: "Insufficient years of experience" },
    { id: "incomplete_profile", label: "Incomplete profile information" },
    { id: "qualifications_mismatch", label: "Qualifications don't match our requirements" },
    { id: "unavailable_schedule", label: "Schedule availability doesn't meet our needs" },
    { id: "specialization_not_needed", label: "Specialization not currently needed" },
    { id: "documentation_issues", label: "Issues with submitted documentation" },
    { id: "unable_to_verify", label: "Unable to verify credentials" }
  ];



  const blockReasons = [
    { id: "misconduct", label: "Unprofessional behavior" },
    { id: "fake_info", label: "Fake or incorrect information" },
    { id: "complaints", label: "Too many patient complaints" },
    { id: "no_response", label: "Not responding to patients" },
    { id: "privacy_issue", label: "Shared private patient data" },
    { id: "rules_broken", label: "Broke platform rules" },
    { id: "spam", label: "Sending spam or ads" },
    { id: "legal_issue", label: "Legal or police issue" }
  ];
  

  const handleReasonToggle = (reasonId: string) => {
    setSelectedReasons(current => {
      if (current.includes(reasonId)) {
        return current.filter(id => id !== reasonId);
      } else {
        return [...current, reasonId];
      }
    });
  };


  const handleReject = async () => {
    if (selectedReasons.length === 0) {
      toast.error("Please select at least one reason for rejection");
      return;
    }
  
    setIsSubmitting(true);
    
    const rejectionReasonTexts = selectedReasons.map(
      reasonId => rejectionReasons.find(r => r.id === reasonId)?.label
    ).filter(Boolean);
  
    try {
      // Show loading state for exactly 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const result = await handlingAdminCancel(doctor.email, rejectionReasonTexts);
      
      
      if (result) {
        setIsRejectDialogOpen(false);
        setIsRejectionSuccessDialogOpen(true);
      } else {
        throw new Error("Failed to process rejection.");
      }
    } catch (error) {
      console.error("Error rejecting doctor application:", error);
      toast.error(error.message || "Failed to reject doctor application");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleDenyClick = () => {
    setIsModalOpen(true);
  };


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReason('');
  };

  const handleSubmitDeny = async () => {
    if (selectedReason) {
    
    
      const reason=blockReasons.find(r => r.id === selectedReason)?.label
          if(reason){
           const  res=  await blockingDoctor(reason,doctor.email)
           if(res.data.result.success){
            console.log('check the responce first then make the conditions',res)
           handleCloseModal();
           }

            }

      
  
    }
  };

  const getStatusBadge = () => {
    if (!doctor.status) return null;
    switch (doctor.status.toLowerCase()) {
      case "approved":
        return <Badge className="bg-emerald-500 text-white font-medium shadow-sm">Approved</Badge>;
      case "pending":
        return <Badge className="bg-amber-500 text-white font-medium shadow-sm">Pending</Badge>;
      case "declined":
        return <Badge className="bg-rose-500 text-white font-medium shadow-sm">Declined</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 animate-fade-in">
      <Button
        variant="ghost"
        className="mb-6 pl-0 text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50 flex items-center"
        onClick={() => navigate("/doctors")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Doctors
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column with profile */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6 animate-scale-in shadow-xl border-gray-200 rounded-xl overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                <div className="absolute top-4 right-4 z-10">{getStatusBadge()}</div>
                <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-700 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iMC4yIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIiAvPjwvc3ZnPg==')]"></div>
                </div>
                <div className="flex flex-col items-center -mt-16 px-6 pb-6">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-lg mb-4 hover:scale-105 transition-transform cursor-pointer">
                    <AvatarImage src={doctor.profileImageUrl} alt={doctor.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-200 text-indigo-800 text-xl font-bold">
                      {doctor.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-bold text-center">{doctor.name}</h2>
                  <p className="text-indigo-600 font-medium mt-1 text-center">{doctor.specialty}</p>
                  <p className="text-gray-600 text-sm mt-1 text-center">{doctor.qualifications}</p>

                  <Separator className="my-6 bg-indigo-100" />

                  <div className="w-full space-y-4">
                    <div className="flex items-center gap-3 transition-transform hover:translate-x-1">
                      <div className="bg-blue-50 p-2 rounded-full shadow-sm">
                        <Phone className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-indigo-600 font-medium">{contact.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 transition-transform hover:translate-x-1">
                      <div className="bg-blue-50 p-2 rounded-full shadow-sm">
                        <Mail className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-indigo-600 font-medium">{contact.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 transition-transform hover:translate-x-1">
                      <div className="bg-blue-50 p-2 rounded-full shadow-sm">
                        <MapPin className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="text-gray-700">{contact.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full mt-6">

                  {/* {doctor.isActive === 'true' && doctor.status !=='completed'? (
  <Button
    className="w-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-sm py-1 px-2 h-8 shadow-md"
    onClick={handleDenyClick}
  >
    Deny
  </Button>
) : (
  <div className="w-full text-center py-2 px-4 bg-red-100 border border-red-300 rounded-md">
    <p className="text-red-700 font-medium text-sm">Doctor Blocked</p>
  </div>
)} */}



{doctor.status && doctor.status.toLowerCase() === "completed" ? (
  doctor.isActive === true ? (
    <Button
      className="w-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-sm py-1 px-2 h-8 shadow-md"
      onClick={handleDenyClick}
    >
      Deny
    </Button>
  ) : (
    <div className="w-full text-center py-2 px-4 bg-red-100 border border-red-300 rounded-md">
      <p className="text-red-700 font-medium text-sm">Doctor Blocked</p>
    </div>
  )
) : (
  <div className="w-full text-center py-2 px-4 bg-red-100 border border-red-300 rounded-md">
    <p className="text-red-700 font-medium text-sm">Complete the process</p>
  </div>
)}


                  </div>
                </div>
              </div>
            </CardContent>
          </Card>





          {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[70vh] flex flex-col transform transition-all duration-300 animate-pulse-once">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold">Deny Application</h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-gray-700 mb-6 text-center font-medium">
                Select a reason for denying this application:
              </p>

              {/* Reason Selection */}
              <div className="grid gap-3 mb-6 pr-2">
                {blockReasons.map((reason, index) => (
                  <label
                    key={reason.id}
                    className={`group relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
                      selectedReason === reason.id
                        ? 'border-red-500 bg-red-50 shadow-md'
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                    }`}
                    style={{
                      animationDelay: `${index * 50}ms`
                    }}
                  >
                    <div className="relative">
                      <input
                        type="radio"
                        name="blockReason"
                        value={reason.id}
                        checked={selectedReason === reason.id}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                        selectedReason === reason.id
                          ? 'border-red-500 bg-red-500'
                          : 'border-gray-300 group-hover:border-red-400'
                      }`}>
                        {selectedReason === reason.id && (
                          <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                        )}
                      </div>
                    </div>
                    <span className={`ml-4 font-medium transition-colors duration-200 ${
                      selectedReason === reason.id ? 'text-red-700' : 'text-gray-700 group-hover:text-red-600'
                    }`}>
                      {reason.label}
                    </span>
                    {selectedReason === reason.id && (
                      <div className="ml-auto">
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 flex gap-4 p-6 bg-gray-50 rounded-b-2xl border-t border-gray-200">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-6 py-3 text-sm font-semibold text-gray-600 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-100 hover:border-gray-400 hover:shadow-md transition-all duration-200 transform hover:scale-105"
              >
                ❌ Cancel
              </button>
              <button
                onClick={handleSubmitDeny}
                disabled={!selectedReason}
                className={`flex-1 px-6 py-3 text-sm font-bold text-white rounded-xl transition-all duration-200 transform ${
                  selectedReason
                    ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg hover:scale-105 hover:shadow-xl'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                ✅ Submit
              </button>
            </div>
          </div>
        </div>
      )}
    
 









        </div>

        {/* Right column with sections */}
        <div className="lg:col-span-2 space-y-8">
          {/* Enhanced License Section */}
          <section className="animate-scale-in">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 p-1 rounded-md mr-2">
                <Shield className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">License & Certification</h3>
            </div>

            <Card className="shadow-xl overflow-hidden border-gray-200 rounded-xl bg-gradient-to-r from-blue-50/80 to-white">
              <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-blue-200/30 border-b border-blue-100 pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-indigo-800">
                  <Award className="h-5 w-5 text-emerald-500" />
                  Professional Medical License
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  {/* License details */}
                  <div className="md:col-span-2 space-y-4">
                    {license.map((lic, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow border border-indigo-100"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-1">
                              <h4 className="font-bold text-lg text-indigo-800">{lic.type}</h4>
                              {lic.status === "Active" && (
                                <CheckCheck className="h-4 w-4 text-emerald-500" />
                              )}
                            </div>
                            <p
                              className={`text-sm ${
                                lic.status === "Active" ? "text-emerald-500" : "text-amber-500"
                              } font-medium`}
                            >
                              {lic.status}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">Number: {lic.number}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`${
                              lic.status === "Active"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                : "bg-amber-50 text-amber-600 border-amber-200"
                            }`}
                          >
                            {lic.year}
                          </Badge>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-50 p-1 rounded-full">
                              <FileText className="h-3.5 w-3.5 text-blue-600" />
                            </div>
                            <span className="text-xs text-gray-500">Issued by State Medical Board</span>
                          </div>

                          <Sheet>
                            <SheetTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-2 hover:bg-indigo-50 text-indigo-600 border-indigo-200"
                              >
                                View License
                              </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
                              <div className="h-full">
                                <div className="bg-gradient-to-r from-indigo-600 to-blue-700 p-6 text-white">
                                  <h3 className="text-xl font-bold mb-1">{lic.type}</h3>
                                  <p className="text-white/80 text-sm">License Certificate</p>
                                </div>
                                <div className="p-6">
                                  <div className="mt-2 border rounded-lg overflow-hidden shadow-lg">
                                    <img
                                      src={lic.url}
                                      alt="License document"
                                      className="w-full h-auto"
                                      onError={(e) =>
                                        console.error("Failed to load license image:", lic.url)
                                      }
                                    />
                                  </div>
                                  <div className="mt-6 space-y-4">
                                    <div className="flex items-center p-3 bg-indigo-50 rounded-lg border border-indigo-100 shadow-sm">
                                      <div className="bg-emerald-100 p-2 rounded-full mr-3">
                                        <Award className="h-5 w-5 text-emerald-500" />
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-500">Valid Until</p>
                                        <p className="font-medium text-indigo-800">December 31, 2025</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-100 shadow-sm">
                                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-500">Issued By</p>
                                        <p className="font-medium text-indigo-800">State Medical Board</p>
                                      </div>
                                    </div>
                                  </div>
                                  <Button className="w-full mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md">
                                    Verify License
                                  </Button>
                                </div>
                              </div>
                            </SheetContent>
                          </Sheet>
                        </div>
                      </div>
                    ))}

                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-100 shadow-sm">
                      <p className="text-sm text-indigo-700 italic">
                        All medical professionals on our platform are verified for their credentials
                        and must maintain active licensing status to continue providing services.
                      </p>
                    </div>
                  </div>

                  {/* License image */}
                  <div className="md:col-span-3">
                    <div className="relative rounded-lg overflow-hidden border border-indigo-200 shadow-lg">
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs py-1 px-3 rounded-bl-lg font-medium shadow-md">
                        Official License
                      </div>
                      <img
                        src={license[0].url}
                        alt="License document"
                        className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300 cursor-zoom-in"
                        onError={(e) =>
                          console.error("Failed to load license image:", license[0].url)
                        }
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-white" />
                            <span className="text-white text-sm font-medium">Verified & Active</span>
                          </div>
                          <Badge className="bg-emerald-500 text-white border-none shadow-md">
                            {license[0].year}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-white rounded-lg border border-indigo-100 shadow-md">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-emerald-100 p-1 rounded-full">
                          <CheckCheck className="h-4 w-4 text-emerald-500" />
                        </div>
                        <h5 className="font-medium text-indigo-800">Verification Status</h5>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-green-50 p-2 rounded-md border border-emerald-100">
                          <Shield className="h-3 w-3 text-emerald-500" />
                          <span className="text-xs text-gray-600">Identity Verified</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-green-50 p-2 rounded-md border border-emerald-100">
                          <FileText className="h-3 w-3 text-emerald-500" />
                          <span className="text-xs text-gray-600">License Verified</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-green-50 p-2 rounded-md border border-emerald-100">
                          <Award className="h-3 w-3 text-emerald-500" />
                          <span className="text-xs text-gray-600">Credentials Valid</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-green-50 p-2 rounded-md border border-emerald-100">
                          <Shield className="h-3 w-3 text-emerald-500" />
                          <span className="text-xs text-gray-600">Background Checked</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Application Status Section */}
          {doctor.status && doctor.status.toLowerCase() === "pending" && (
            <section className="animate-scale-in">
              <div className="flex items-center mb-4">
                <div className="bg-amber-100 p-1 rounded-md mr-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Application Review</h3>
              </div>

              <Card className="shadow-xl overflow-hidden border-gray-200 rounded-xl">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100/70 border-b border-amber-100 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Review Application Status
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6 shadow-sm">
                    <p className="text-sm text-amber-800">
                      This doctor application is currently <span className="font-medium text-amber-600">pending review</span>. 
                      Please verify all documentation and credentials before making a decision.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-white to-emerald-50 rounded-lg p-4 border border-emerald-100 shadow-md">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-emerald-100 p-2 rounded-full">
                          <Check className="h-4 w-4 text-emerald-500" />
                        </div>
                        <h4 className="font-medium text-emerald-800">Approval</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Approving this application will grant the doctor access to the platform and allow them to provide services.
                      </p>
                      
                      <Button 
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-md text-white" 
                        onClick={() => setIsApproveDialogOpen(true)}
                      >
                        Approve Application
                      </Button>

                    </div>

                    <div className="bg-gradient-to-br from-white to-rose-50 rounded-lg p-4 border border-rose-100 shadow-md">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-rose-100 p-2 rounded-full">
                          <X className="h-4 w-4 text-rose-500" />
                        </div>
                        <h4 className="font-medium text-rose-800">Rejection</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Rejecting this application will deny the doctor access to the platform. A reason must be provided.
                      </p>
                      <Button 
                        className="w-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-md text-white" 
                        onClick={() => setIsRejectDialogOpen(true)}
                      >
                        Reject Application
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Approval confirmation dialog */}
              <AlertDialog open={isApproveDialogOpen} onOpenChange={(open) => {
                if (!isSubmitting) {
                  setIsApproveDialogOpen(open);
                }
              }}>
                <AlertDialogContent className="border-emerald-100">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-emerald-800">Approve Doctor Application</AlertDialogTitle>
                    <AlertDialogDescription>
                      You're about to approve {doctor.name}'s application. This will grant them access to the platform and allow them to provide services.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isSubmitting} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">Cancel</AlertDialogCancel>
                    <Button 
                      onClick={handleApprove}
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-md text-white"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        "Confirm Approval"
                      )}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Success dialog */}
              <AlertDialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
                <AlertDialogContent className="border-emerald-100">
                  <AlertDialogHeader>
                    <div className="flex justify-center mb-4">
                      <div className="bg-emerald-100 p-3 rounded-full">
                        <CheckCheck className="h-8 w-8 text-emerald-500" />
                      </div>
                    </div>
                    <AlertDialogTitle className="text-emerald-800 text-center">Application Approved</AlertDialogTitle>
                    <AlertDialogDescription className="text-center">
                      {doctor.name}'s application has been successfully approved!
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex justify-center">
                    <Button 
                      onClick={() => {
                        setIsSuccessDialogOpen(false);
                        navigate("/doctors");
                      }}
                      className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-md text-white"
                    >
                      OK
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

{/* rejection succes */}
<AlertDialog open={isRejectionSuccessDialogOpen} onOpenChange={setIsRejectionSuccessDialogOpen}>
  <AlertDialogContent className="border-rose-100">
    <AlertDialogHeader>
      <div className="flex justify-center mb-4">
        <div className="bg-rose-100 p-3 rounded-full">
          <X className="h-8 w-8 text-rose-500" />
        </div>
      </div>
      <AlertDialogTitle className="text-rose-800 text-center">Application Rejected</AlertDialogTitle>
      <AlertDialogDescription className="text-center">
        {doctor.name}'s application has been successfully rejected.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter className="flex justify-center">
      <Button 
        onClick={() => {
          setIsRejectionSuccessDialogOpen(false);
          
          navigate("/doctors", { 
            state: { 
              rejectedDoctor: true, 
              rejectedDoctorEmail: doctor.email,
              rejectionTimestamp: new Date().getTime()
            } 
          });
        }}
        className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-md text-white"
      >
        OK
      </Button>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

              {/* Rejection confirmation dialog */}
              <AlertDialog open={isRejectDialogOpen} onOpenChange={(open) => {
                if (!isSubmitting) {
                  setIsRejectDialogOpen(open);
                }
              }}>
                <AlertDialogContent className="max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-rose-600">
                      Reject Doctor Application
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      You're about to reject {doctor?.name}'s application. 
                      Please select the reason(s) for rejection:
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  
                  <div className="space-y-3 max-h-60 overflow-y-auto py-2">
                    {rejectionReasons.map((reason) => (
                      <div key={reason.id} className="flex items-start space-x-2">
                        <Checkbox 
                          id={reason.id}
                          checked={selectedReasons.includes(reason.id)}
                          onCheckedChange={() => handleReasonToggle(reason.id)}
                          className="border-rose-300 text-rose-600 data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600"
                        />
                        <label 
                          htmlFor={reason.id} 
                          className="text-sm cursor-pointer"
                        >
                          {reason.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  
                 


               <AlertDialogFooter className="mt-4">
                    <AlertDialogCancel 
                      disabled={isSubmitting} 
                      className="border-rose-200 text-rose-700 hover:bg-rose-50"
                    >
                      Cancel
                    </AlertDialogCancel>
                    <Button 
                      onClick={handleReject}
                      disabled={isSubmitting || selectedReasons.length === 0}
                      className={`bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-md text-white ${
                        selectedReasons.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        "Confirm Rejection"
                      )}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </section>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default DoctorDetails;