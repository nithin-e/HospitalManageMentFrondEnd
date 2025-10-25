import React, { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useSelector } from "react-redux";
import { RootState } from "@/store/redux/store";
import { useSocket } from "@/context/socketContext";

const VideoCallPage = () => {
  const selectUserAndDoctor = (state: RootState) => ({
    user: state.user?.user,
    doctor: state.doctor.data?.doctor,
  });

  const doctors = useSelector((state: RootState) => state.doctor.data?.doctor);

  console.log("check this doctor data ---------", doctors);

  const { user, doctor } = useSelector(selectUserAndDoctor);

  console.log(
    "check this datas getting or not while consultation tyme",
    user,
    doctor
  );

  const email = user?.email || doctor?.email;
  const { roomId } = useParams();
  const { socket, connected } = useSocket();
  const navigate = useNavigate();

  const zcRef = useRef(null);

  const getAppointmentId = () => {
    if (!roomId) return null;

    const parts = roomId.split("_");
    if (parts.length >= 2 && parts[0] === "consultation") {
      return parts[2];
    }
    return null;
  };

  const appointmentId = getAppointmentId();

  useEffect(() => {
    if (socket && connected) {
      console.log("Setting up AutoMaticLeave event listener");

      const handleAutoMaticLeave = () => {
        console.log(
          "Received AutoMaticLeave event <<<<<<<<>>>>>>>> ending call automatically"
        );
        handleAutoLeave();
      };

      socket.on("AutoMaticLeave", handleAutoMaticLeave);

      return () => {
        console.log("Cleaning up AutoMaticLeave listener");
        socket.off("AutoMaticLeave", handleAutoMaticLeave);
        socket.off("connect");
      };
    }
  }, [socket, connected]);

  const handleAutoLeave = () => {
    try {
      if (zcRef.current) {
        zcRef.current.destroy();
        zcRef.current = null;
      }

      navigate(-1);
    } catch (error) {
      console.error("Error during auto leave:", error);
      // Fallback navigation
      navigate("/dashboard");
    }
  };

  const myMeeting = async (element) => {
    const appID = 1757958631;
    const serverSecret = "474cae50897160fe21416980174fe248";
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomId,
      Date.now().toString(),
      email
    );

    const zc = ZegoUIKitPrebuilt.create(kitToken);

    zcRef.current = zc;

    zc.joinRoom({
      container: element,
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall,
      },
      showScreenSharingButton: false,
      onLeaveRoom: () => {
        const userType = user ? "user" : "doctor";
        console.log(`${userType} left the room (clicked hang up)`);
        handleCallEnd(userType);

        // Clear the reference when leaving normally
        zcRef.current = null;
      },

      onUserLeave: (users) => {
        console.log("Other users left:", users);
      },
    });
  };

  const handleCallEnd = (userType: string) => {
    const userId = user ? user._id : null;
    const doctorId = doctor ? doctor.id : null;

    socket.emit("call-ended", {
      endedBy: userType,
      appointmentId: appointmentId,
      userId: userId,
      doctorId: doctorId,
    });
  };

  return (
    <div>
      <div ref={myMeeting} />
    </div>
  );
};

export default VideoCallPage;
