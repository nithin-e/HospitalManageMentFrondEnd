import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const generatePrescriptionPDF = async (prescriptionData) => {
  // Create a hidden DOM element to render PDF content
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "-10000px";
  container.style.width = "850px";
  container.style.fontFamily = "'Segoe UI', Arial, sans-serif";
  container.style.backgroundColor = "#fff";
  container.style.padding = "30px";
  container.style.lineHeight = "1.5";
  
  const currentDate = new Date();
  const prescriptionNumber = prescriptionData.prescriptionId?.substring(0, 8) || Math.floor(Math.random() * 100000);
  
  container.innerHTML = `
    <div style="border: 2px solid #2563eb; padding: 35px; background: #fff; border-radius: 12px;">
      <!-- Header Section -->
      <div style="text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px;">
        <div style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; margin-bottom: 10px;">
          <span style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">📋 MEDICAL PRESCRIPTION</span>
        </div>
        <div style="margin-top: 12px; color: #666; font-size: 13px;">
          Prescription No: <strong>RX-${prescriptionNumber}</strong> | Generated: ${currentDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </div>
      </div>

      <!-- Two Column Layout for Patient & Doctor Info -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
        
        <!-- Patient Information -->
        <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 20px; border-left: 4px solid #3b82f6; border-radius: 8px;">
          <div style="display: flex; align-items: center; margin-bottom: 15px;">
            <div style="background: #3b82f6; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 10px;">
              P
            </div>
            <h3 style="color: #1e40af; margin: 0; font-size: 18px; font-weight: 600;">Patient Information</h3>
          </div>
          <div style="space-y: 8px;">
            <div style="margin-bottom: 10px;">
              <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 3px;">Full Name</div>
              <div style="font-size: 15px; color: #1e293b; font-weight: 500;">${prescriptionData.patientName || 'Not specified'}</div>
            </div>
            <div style="margin-bottom: 10px;">
              <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 3px;">Email Address</div>
              <div style="font-size: 14px; color: #475569;">${prescriptionData.patientEmail}</div>
            </div>
            <div>
              <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 3px;">Phone Number</div>
              <div style="font-size: 14px; color: #475569;">${prescriptionData.patientPhone || 'Not provided'}</div>
            </div>
          </div>
        </div>

        <!-- Doctor Information -->
        <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 20px; border-left: 4px solid #22c55e; border-radius: 8px;">
          <div style="display: flex; align-items: center; margin-bottom: 15px;">
            <div style="background: #22c55e; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 10px;">
              Dr
            </div>
            <h3 style="color: #15803d; margin: 0; font-size: 18px; font-weight: 600;">Prescribing Physician</h3>
          </div>
          <div style="space-y: 8px;">
            <div style="margin-bottom: 10px;">
              <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 3px;">Doctor Name</div>
              <div style="font-size: 15px; color: #1e293b; font-weight: 500;">${prescriptionData.doctorName || 'Not specified'}</div>
            </div>
            <div style="margin-bottom: 10px;">
              <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 3px;">Specialty</div>
              <div style="font-size: 14px; color: #475569;">${prescriptionData.specialty || 'General Medicine'}</div>
            </div>
            <div>
              <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 3px;">Email</div>
              <div style="font-size: 14px; color: #475569;">${prescriptionData.doctorEmail}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Appointment Details -->
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-left: 4px solid #f59e0b; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 16px; font-weight: 600; display: flex; align-items: center;">
          <span style="margin-right: 8px;">📅</span> Appointment Details
        </h3>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
          <div>
            <div style="font-size: 11px; color: #78350f; text-transform: uppercase; font-weight: 600; margin-bottom: 3px;">Date</div>
            <div style="font-size: 14px; color: #451a03; font-weight: 500;">${prescriptionData.appointmentDate || new Date(prescriptionData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
          </div>
          <div>
            <div style="font-size: 11px; color: #78350f; text-transform: uppercase; font-weight: 600; margin-bottom: 3px;">Time</div>
            <div style="font-size: 14px; color: #451a03; font-weight: 500;">${prescriptionData.appointmentTime || prescriptionData.time}</div>
          </div>
          <div>
            <div style="font-size: 11px; color: #78350f; text-transform: uppercase; font-weight: 600; margin-bottom: 3px;">Status</div>
            <div style="display: inline-block; background: #22c55e; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
              ${prescriptionData.status || 'Completed'}
            </div>
          </div>
          <div>
            <div style="font-size: 11px; color: #78350f; text-transform: uppercase; font-weight: 600; margin-bottom: 3px;">Amount</div>
            <div style="font-size: 14px; color: #451a03; font-weight: 500;">₹${prescriptionData.amount || '500'}</div>
          </div>
        </div>
      </div>

      ${prescriptionData.notes ? `
      <!-- Appointment Notes -->
      <div style="background: linear-gradient(135deg, #fef9c3 0%, #fef08a 100%); padding: 18px; border-left: 4px solid #eab308; border-radius: 8px; margin-bottom: 25px;">
        <h4 style="color: #713f12; margin: 0 0 10px 0; font-size: 15px; font-weight: 600; display: flex; align-items: center;">
          <span style="margin-right: 8px;">📝</span> Appointment Notes
        </h4>
        <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #fde047;">
          <p style="font-size: 13px; color: #3f3f46; margin: 0; line-height: 1.6;">${prescriptionData.notes}</p>
        </div>
      </div>
      ` : ''}

      <!-- Prescription Details - Main Section -->
      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #22c55e; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
        <div style="display: flex; align-items: center; margin-bottom: 18px;">
          <div style="background: #22c55e; color: white; padding: 10px 18px; border-radius: 25px; font-weight: bold; font-size: 18px; margin-right: 12px; box-shadow: 0 4px 6px rgba(34, 197, 94, 0.3);">
            Rx
          </div>
          <h3 style="color: #15803d; margin: 0; font-size: 20px; font-weight: 700;">Prescription Details</h3>
        </div>
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #86efac; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          <div style="font-size: 15px; color: #1e293b; white-space: pre-wrap; line-height: 1.8; font-family: 'Courier New', monospace;">
${prescriptionData.prescriptionDetails || 'No prescription details available'}
          </div>
        </div>
      </div>

      <!-- Important Instructions -->
      <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border: 2px solid #f87171; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h4 style="color: #991b1b; margin: 0 0 12px 0; font-size: 16px; font-weight: 600; display: flex; align-items: center;">
          <span style="margin-right: 8px;">⚠️</span> Important Instructions
        </h4>
        <ul style="color: #7f1d1d; margin: 0; padding-left: 22px; line-height: 1.8; font-size: 13px;">
          <li style="margin-bottom: 6px;">Take medication exactly as prescribed by your physician</li>
          <li style="margin-bottom: 6px;">Do not exceed the recommended dosage without consulting your doctor</li>
          <li style="margin-bottom: 6px;">Contact your physician immediately if you experience any side effects</li>
          <li style="margin-bottom: 6px;">Store medication properly and keep out of reach of children</li>
          <li>Complete the full course of treatment even if symptoms improve</li>
        </ul>
      </div>

      <!-- Footer -->
      <div style="border-top: 2px solid #e5e7eb; padding-top: 20px;">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 15px; text-align: center;">
          <div style="background: #f9fafb; padding: 12px; border-radius: 6px;">
            <div style="font-size: 10px; color: #6b7280; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Generated On</div>
            <div style="font-size: 12px; color: #1f2937; font-weight: 500;">${currentDate.toLocaleString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</div>
          </div>
          <div style="background: #f9fafb; padding: 12px; border-radius: 6px;">
            <div style="font-size: 10px; color: #6b7280; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Prescription ID</div>
            <div style="font-size: 12px; color: #1f2937; font-weight: 500;">RX-${prescriptionNumber}</div>
          </div>
          <div style="background: #f9fafb; padding: 12px; border-radius: 6px;">
            <div style="font-size: 10px; color: #6b7280; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Validity</div>
            <div style="font-size: 12px; color: #059669; font-weight: 600;">ACTIVE</div>
          </div>
        </div>
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 14px; border-radius: 8px; text-align: center; font-size: 12px; font-weight: 500; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
          ✓ This prescription was generated electronically and is valid for medical use
        </div>
        <div style="text-align: center; margin-top: 15px; font-size: 11px; color: #9ca3af;">
          For any queries, please contact your healthcare provider | © ${currentDate.getFullYear()} HealNova Medical System
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(container);

  try {
    // Generate canvas with higher quality
    const canvas = await html2canvas(container, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    });
    
    const imgData = canvas.toDataURL("image/png", 1.0);

    // Create PDF with better formatting
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate dimensions to fit the page properly
    const imgWidth = pdfWidth - 20; // 10mm margin on each side
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    
    // Check if content fits on one page, if not adjust
    let finalHeight = imgHeight;
    let finalWidth = imgWidth;
    if (imgHeight > pdfHeight - 20) {
      finalHeight = pdfHeight - 20;
      finalWidth = (imgProps.width * finalHeight) / imgProps.height;
    }
    
    // Center the content
    const x = (pdfWidth - finalWidth) / 2;
    const y = 10; // 10mm from top

    pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight, undefined, 'FAST');
    
    // Generate filename with timestamp
    const patientName = prescriptionData.patientName?.replace(/\s+/g, '_') || 'patient';
    const filename = `prescription_${patientName}_${prescriptionNumber}_${currentDate.toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate prescription PDF');
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
};