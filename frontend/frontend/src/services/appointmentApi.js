import API from "./api";

/**
 * Fetch all appointments
 */
export const getAppointments = async () => {
  const response = await API.get("/appointments/");
  return response.data;
};

/**
 * Create a new appointment
 * @param {Object} appointmentData
 */
export const createAppointment = async (appointmentData) => {
  const response = await API.post("/appointments/", appointmentData);
  return response.data;
};

/**
 * Update an existing appointment by ID
 * @param {string|number} appointmentId
 * @param {Object} appointmentData
 */
export const updateAppointment = async (appointmentId, appointmentData) => {
  const response = await API.put(`/appointments/${appointmentId}`, appointmentData);
  return response.data;
};

/**
 * Delete an appointment by ID
 * @param {string|number} appointmentId
 */
export const deleteAppointment = async (appointmentId) => {
  const response = await API.delete(`/appointments/${appointmentId}`);
  return response.data;
};

// Default export object for backwards compatibility
const appointmentApi = {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};

export default appointmentApi;