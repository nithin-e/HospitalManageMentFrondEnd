import React, { useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface Medication {
  name: string;
  dose?: string;
  frequency?: string;
  duration?: string;
}

export interface PrescriptionData {
  appointmentId?: string;
  doctorEmail?: string;
  doctorName?: string;
  doctorQualification?: string;
  clinicName?: string;
  phone?: string;
  website?: string;
  patientEmail?: string;
  patientName?: string;
  patientAge?: number | string;
  patientAddress?: string;
  prescriptionDetails?: string;
  diagnosis?: string;
  medications?: Medication[];
  time?: string;
  date?: string | Date;
  appointmentDateTime?: string | Date;
}

type Props = {
  data?: PrescriptionData | null;
  onComplete?: () => void;
};

const PrescriptionPdf: React.FC<Props> = ({ data, onComplete }) => {
  const pdfRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const generatePDF = async () => {
      const element = pdfRef.current;
      if (!element) return;

      try {
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgProps = pdf.getImageProperties(imgData);
        const imgWidthMm = pageWidth;
        const imgHeightMm = (imgProps.height * imgWidthMm) / imgProps.width;

        if (imgHeightMm <= pageHeight) {
          pdf.addImage(imgData, "PNG", 0, 0, imgWidthMm, imgHeightMm);
        } else {
          let remainingHeight = imgHeightMm;
          let position = 0;
          const imgHeightPx = canvas.height;
          const pageHeightPx = Math.floor((imgProps.width * pageHeight) / imgWidthMm);

          while (remainingHeight > 0) {
            const pageCanvas = document.createElement("canvas");
            pageCanvas.width = canvas.width;
            pageCanvas.height = Math.min(pageHeightPx, imgHeightPx - position);
            const ctx = pageCanvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(canvas, 0, position, canvas.width, pageCanvas.height, 0, 0, canvas.width, pageCanvas.height);
              const pageData = pageCanvas.toDataURL("image/png");
              const pageImgProps = pdf.getImageProperties(pageData);
              const pageImgHeightMm = (pageImgProps.height * imgWidthMm) / pageImgProps.width;
              pdf.addImage(pageData, "PNG", 0, 0, imgWidthMm, pageImgHeightMm);
              remainingHeight -= pageImgHeightMm;
              position += pageCanvas.height;
              if (remainingHeight > 0) pdf.addPage();
            } else {
              break;
            }
          }
        }

        pdf.save("prescription.pdf");
        if (onComplete) onComplete();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to generate PDF:", err);
        if (onComplete) onComplete();
      }
    };

    if (data) {
      // Run after a brief delay to ensure fonts and images are rendered
      const t = setTimeout(generatePDF, 200);
      return () => clearTimeout(t);
    }
  }, [data, onComplete]);

  if (!data) return null;

  const formatDate = (d?: string | Date) => {
    if (!d) return "";
    const dateObj = d instanceof Date ? d : new Date(d);
    return dateObj.toLocaleString();
  };

  return (
    <div
      ref={pdfRef}
      style={{
        position: "absolute",
        left: "-9999px",
        padding: 20,
        backgroundColor: "#fff",
        color: "#000",
        width: 800,
        boxSizing: "border-box",
        border: "1px solid #ddd",
        borderRadius: 10,
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: 12,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Prescription</h2>
        <div style={{ fontSize: 12 }}>{data.clinicName ?? ""}</div>
        <div style={{ fontSize: 11 }}>{data.phone ?? ""} {data.website ? `| ${data.website}` : ""}</div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ width: "48%" }}>
          <div><strong>Doctor:</strong> {data.doctorName ?? ""}</div>
          <div><strong>Qualification:</strong> {data.doctorQualification ?? ""}</div>
          <div><strong>Email:</strong> {data.doctorEmail ?? ""}</div>
        </div>
        <div style={{ width: "48%", textAlign: "right" }}>
          <div><strong>Appointment ID:</strong> {data.appointmentId ?? ""}</div>
          <div><strong>Date/Time:</strong> {formatDate(data.appointmentDateTime ?? data.date)}</div>
          <div><strong>Time:</strong> {data.time ?? ""}</div>
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <div><strong>Patient Name:</strong> {data.patientName ?? ""}</div>
        <div><strong>Age:</strong> {data.patientAge ?? ""}</div>
        <div><strong>Address:</strong> {data.patientAddress ?? ""}</div>
        <div><strong>Patient Email:</strong> {data.patientEmail ?? ""}</div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <div><strong>Diagnosis:</strong></div>
        <div style={{ marginTop: 4 }}>{data.diagnosis ?? ""}</div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <div><strong>Medications:</strong></div>
        <ul style={{ marginTop: 4 }}>
          {(data.medications && data.medications.length > 0) ? (
            data.medications.map((m, idx) => (
              <li key={idx}>
                {m.name}{m.dose ? ` — ${m.dose}` : ""}{m.frequency ? `, ${m.frequency}` : ""}{m.duration ? ` (${m.duration})` : ""}
              </li>
            ))
          ) : (
            <li>{data.prescriptionDetails ?? ""}</li>
          )}
        </ul>
      </div>

      <div style={{ marginTop: 20, borderTop: "1px solid #eee", paddingTop: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <div><strong>Clinic:</strong> {data.clinicName ?? ""}</div>
            <div><strong>Contact:</strong> {data.phone ?? ""}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div><strong>Doctor Signature</strong></div>
            <div style={{ marginTop: 30 }}>__________________________</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionPdf;
