import API from "./api";

/**
 * Sends automated appointment notification emails via backend endpoint
 * @param {Object} payload - Notification details
 * @param {string} payload.to_email - Recipient email address
 * @param {string} payload.patient_name - Patient full name
 * @param {string} payload.doctor_name - Doctor full name
 * @param {string} payload.appointment_date - Date and time of appointment
 * @param {string} payload.status - Updated status ('Scheduled' | 'Completed' | 'Cancelled')
 * @param {string} [payload.type='status_update'] - Notification trigger type
 */
export const sendAppointmentEmail = async ({
  to_email,
  patient_name,
  doctor_name,
  appointment_date,
  status,
  type = "status_update",
}) => {
  if (!to_email) {
    console.warn("Notification skipped: Missing target email address.");
    return null;
  }

  const subject = `Appointment Status Update: ${status}`;
  const messageBody = `Hello ${patient_name},\n\nYour appointment with Dr. ${doctor_name} scheduled for ${appointment_date} status has been updated to: ${status.toUpperCase()}.\n\nThank you,\nHealthcare Management Team`;

  try {
    const response = await API.post("/notifications/email/", {
      to_email,
      subject,
      body: messageBody,
      notification_type: type,
      metadata: {
        patient_name,
        doctor_name,
        appointment_date,
        status,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Failed to dispatch automated email notification:", error);
    // Return error status instead of crashing caller workflow
    return { success: false, error };
  }
};

/**
 * Bulk dispatch appointment reminders
 * @param {Array<Object>} notificationsList
 */
export const sendBulkAppointmentEmails = async (notificationsList) => {
  try {
    const response = await API.post("/notifications/email/bulk", {
      notifications: notificationsList,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to dispatch bulk email notifications:", error);
    return { success: false, error };
  }
};