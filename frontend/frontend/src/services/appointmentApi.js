import API from "./api";

/**
 * Fetch all appointments
 */
export const getAppointments = async () => {
  try {
    const response = await API.get("/appointments");
    return response.data;
  } catch (err) {
    if (err.response && (err.response.status === 404 || err.response.status === 307)) {
      const fallback = await API.get("/appointments/");
      return fallback.data;
    }
    throw err;
  }
};

/**
 * Create a new appointment
 * @param {Object} appointmentData
 */
export const createAppointment = async (appointmentData) => {
  try {
    const response = await API.post("/appointments", appointmentData);
    return response.data;
  } catch (err) {
    if (err.response && (err.response.status === 404 || err.response.status === 307)) {
      const fallback = await API.post("/appointments/", appointmentData);
      return fallback.data;
    }
    throw err;
  }
};

/**
 * Update an existing appointment by ID (supports PATCH and PUT)
 * @param {string|number} appointmentId
 * @param {Object} appointmentData
 */
export const updateAppointment = async (appointmentId, appointmentData) => {
  try {
    const response = await API.patch(`/appointments/${appointmentId}`, appointmentData);
    return response.data;
  } catch (err) {
    if (err.response && (err.response.status === 405 || err.response.status === 404)) {
      const fallback = await API.put(`/appointments/${appointmentId}`, appointmentData);
      return fallback.data;
    }
    throw err;
  }
};

/**
 * Delete an appointment by ID
 * @param {string|number} appointmentId
 */
export const deleteAppointment = async (appointmentId) => {
  try {
    const response = await API.delete(`/appointments/${appointmentId}`);
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      const fallback = await API.delete(`/appointments/${appointmentId}/`);
      return fallback.data;
    }
    throw err;
  }
};

const appointmentApi = {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};

export default appointmentApi;