import API from "./api";

/**
 * Fetch all doctors from the database
 */
export const fetchDoctors = async () => {
  const response = await API.get("/doctors/");
  return response.data;
};

/**
 * Create a new doctor record
 * @param {Object} doctorData - Doctor details payload
 */
export const createDoctor = async (doctorData) => {
  const response = await API.post("/doctors/", doctorData);
  return response.data;
};

/**
 * Update an existing doctor record by ID
 * @param {string|number} doctorId - ID of the doctor
 * @param {Object} doctorData - Updated fields
 */
export const updateDoctor = async (doctorId, doctorData) => {
  const response = await API.put(`/doctors/${doctorId}`, doctorData);
  return response.data;
};

/**
 * Delete a doctor record by ID
 * @param {string|number} doctorId - ID of the doctor to remove
 */
export const deleteDoctor = async (doctorId) => {
  const response = await API.delete(`/doctors/${doctorId}`);
  return response.data;
};

// Default export object for backwards compatibility
const doctorApi = {
  fetchDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};

export default doctorApi;