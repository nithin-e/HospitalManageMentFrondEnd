import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const generatePrescriptionPDF = async (prescriptionData) => {
  // Create a hidden DOM element to render PDF content
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "-10000px";
  container.style.width = "800px";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.backgroundColor = "#fff";
  container.style.padding = "40px";
  container.style.lineHeight = "1.6";
  
  const currentDate = new Date();
  const prescriptionNumber = Math.floor(Math.random() * 100000);
  
  container.innerHTML = `
    <div style="border: 3px solid #2c5aa0; padding: 30px; background: #fff;">
      <!-- Header Section -->
      <div style="text-align: center; border-bottom: 2px solid #2c5aa0; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: #2c5aa0; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 2px;">
          MEDICAL PRESCRIPTION
        </h1>
        <div style="margin-top: 10px; color: #666; font-size: 14px;">
          Prescription No: RX-${prescriptionNumber} | Date: ${currentDate.toLocaleDateString()}
        </div>
      </div>

      <!-- Doctor Information -->
      <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #2c5aa0; margin-bottom: 25px;">
        <h3 style="color: #2c5aa0; margin: 0 0 10px 0; font-size: 18px;">Prescribing Physician</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div>
            <strong style="color: #333;">Email:</strong><br>
            <span style="color: #666;">${prescriptionData.doctorEmail}</span>
          </div>
          <div>
            <strong style="color: #333;">Date Issued:</strong><br>
            <span style="color: #666;">${new Date(prescriptionData.date).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <!-- Patient Information -->
      <div style="background: #e8f4f8; padding: 20px; border-left: 4px solid #17a2b8; margin-bottom: 25px;">
        <h3 style="color: #17a2b8; margin: 0 0 10px 0; font-size: 18px;">Patient Information</h3>
        <div>
          <strong style="color: #333;">Patient Email:</strong><br>
          <span style="color: #666; font-size: 16px;">${prescriptionData.patientEmail}</span>
        </div>
      </div>

      <!-- Prescription Details -->
      <div style="background: #fff; border: 2px solid #28a745; padding: 25px; margin-bottom: 25px;">
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
          <div style="background: #28a745; color: white; padding: 8px 15px; border-radius: 25px; font-weight: bold; margin-right: 15px;">
            Rx
          </div>
          <h3 style="color: #28a745; margin: 0; font-size: 20px;">Prescription Details</h3>
        </div>
        <div style="background: #f8fff9; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
          <div style="font-size: 16px; color: #333; white-space: pre-wrap; line-height: 1.8;">
            ${prescriptionData.prescriptionDetails}
          </div>
        </div>
      </div>

      <!-- Schedule Information -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
        <div style="background: #fff3cd; padding: 20px; border: 1px solid #ffeaa7; border-radius: 8px;">
          <h4 style="color: #856404; margin: 0 0 10px 0;">Administration Time</h4>
          <div style="font-size: 16px; color: #333; font-weight: 500;">
            ${prescriptionData.time}
          </div>
        </div>
        <div style="background: #d4edda; padding: 20px; border: 1px solid #c3e6cb; border-radius: 8px;">
          <h4 style="color: #155724; margin: 0 0 10px 0;">Issue Date</h4>
          <div style="font-size: 16px; color: #333; font-weight: 500;">
            ${new Date(prescriptionData.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      <!-- Important Notes -->
      <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h4 style="color: #721c24; margin: 0 0 10px 0;">⚠️ Important Instructions</h4>
        <ul style="color: #721c24; margin: 0; padding-left: 20px;">
          <li>Take medication exactly as prescribed</li>
          <li>Do not exceed recommended dosage</li>
          <li>Contact physician if side effects occur</li>
          <li>Keep out of reach of children</li>
        </ul>
      </div>

      <!-- Footer -->
      <div style="border-top: 2px solid #2c5aa0; padding-top: 20px; text-align: center;">
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 15px;">
          <div style="text-align: left;">
            <strong style="color: #2c5aa0;">Generated:</strong><br>
            <small style="color: #666;">${currentDate.toLocaleString()}</small>
          </div>
          <div>
            <strong style="color: #2c5aa0;">Prescription ID:</strong><br>
            <small style="color: #666;">RX-${prescriptionNumber}</small>
          </div>
          <div style="text-align: right;">
            <strong style="color: #2c5aa0;">Status:</strong><br>
            <small style="color: #28a745; font-weight: bold;">ACTIVE</small>
          </div>
        </div>
        <div style="background: #2c5aa0; color: white; padding: 10px; border-radius: 5px; font-size: 12px;">
          This prescription was generated electronically and is valid for medical use.
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(container);

  try {
    // Generate canvas with higher quality
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL("image/png", 1.0);

    // Create PDF with better formatting
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate dimensions to fit the page properly
    const imgWidth = pdfWidth - 20; // 10mm margin on each side
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    
    // Center the content
    const x = 10; // 10mm left margin
    const y = Math.max(10, (pdfHeight - imgHeight) / 2); // Center vertically or 10mm from top

    pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
    
    // Generate filename with timestamp
    const filename = `prescription_${prescriptionNumber}_${currentDate.toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate prescription PDF');
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
};

// Alternative version using jsPDF's built-in text methods (more reliable)
export const generatePrescriptionPDFText = (prescriptionData) => {
  const pdf = new jsPDF();
  const currentDate = new Date();
  const prescriptionNumber = Math.floor(Math.random() * 100000);
  
  // Set up fonts and colors
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(24);
  pdf.setTextColor(44, 90, 160); // Blue color
  
  // Title
  pdf.text("MEDICAL PRESCRIPTION", 105, 30, { align: 'center' });
  
  // Prescription number and date
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Prescription No: RX-${prescriptionNumber} | Date: ${currentDate.toLocaleDateString()}`, 105, 40, { align: 'center' });
  
  // Reset color and font
  pdf.setTextColor(0, 0, 0);
  pdf.setFont("helvetica", "normal");
  
  let yPosition = 60;
  
  // Doctor Information
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(44, 90, 160);
  pdf.text("Prescribing Physician", 20, yPosition);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  yPosition += 10;
  pdf.text(`Email: ${prescriptionData.doctorEmail}`, 20, yPosition);
  yPosition += 8;
  pdf.text(`Date Issued: ${new Date(prescriptionData.date).toLocaleDateString()}`, 20, yPosition);
  
  yPosition += 20;
  
  // Patient Information
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(23, 162, 184);
  pdf.text("Patient Information", 20, yPosition);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  yPosition += 10;
  pdf.text(`Patient Email: ${prescriptionData.patientEmail}`, 20, yPosition);
  
  yPosition += 20;
  
  // Prescription Details
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(40, 167, 69);
  pdf.text("Prescription Details", 20, yPosition);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  yPosition += 15;
  
  // Split prescription details into lines
  const prescriptionLines = pdf.splitTextToSize(prescriptionData.prescriptionDetails, 170);
  prescriptionLines.forEach(line => {
    pdf.text(line, 20, yPosition);
    yPosition += 7;
  });
  
  yPosition += 10;
  
  // Schedule Information
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text("Administration Time:", 20, yPosition);
  pdf.setFont("helvetica", "normal");
  pdf.text(prescriptionData.time, 80, yPosition);
  
  yPosition += 15;
  
  // Footer
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Generated: ${currentDate.toLocaleString()}`, 20, 270);
  pdf.text(`Prescription ID: RX-${prescriptionNumber}`, 105, 270, { align: 'center' });
  pdf.text("Status: ACTIVE", 190, 270, { align: 'right' });
  
  // Generate filename
  const filename = `prescription_${prescriptionNumber}_${currentDate.toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
};