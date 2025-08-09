// PrescriptionPdf.js
import React, { useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const PrescriptionPdf = ({ data, onComplete }) => {
  const pdfRef = useRef();

  useEffect(() => {
    const generatePDF = async () => {
      const element = pdfRef.current;
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("prescription.pdf");

      if (onComplete) onComplete();
    };

    if (data) {
      generatePDF();
    }
  }, [data, onComplete]);

  if (!data) return null;

  return (
    <div
      ref={pdfRef}
      style={{
        position: "absolute",
        left: "-9999px", // Hide from screen but render for capture
        padding: 20,
        backgroundColor: "#fff",
        color: "#000",
        width: "600px",
        border: "1px solid #ddd",
        borderRadius: "10px",
      }}
    >
      <h2 style={{ textAlign: "center" }}>Prescription</h2>
      <p><strong>Doctor Email:</strong> {data.doctorEmail}</p>
      <p><strong>Patient Email:</strong> {data.patientEmail}</p>
      <p><strong>Prescription:</strong> {data.prescriptionDetails}</p>
      <p><strong>Time:</strong> {data.time}</p>
      <p><strong>Date:</strong> {new Date(data.date).toLocaleDateString()}</p>
    </div>
  );
};

export default PrescriptionPdf;
