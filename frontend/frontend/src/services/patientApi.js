import API from "./api";

/**
 * Fetch all patients from the database
 */
export const getPatients = async () => {
  const response = await API.get("/patients/");
  return response.data;
};

/**
 * Create a new patient record
 * @param {Object} patientData - Patient details payload
 */
export const createPatient = async (patientData) => {
  const response = await API.post("/patients/", patientData);
  return response.data;
};

/**
 * Update an existing patient record by ID
 * @param {string|number} patientId - ID of the patient
 * @param {Object} patientData - Updated fields
 */
export const updatePatient = async (patientId, patientData) => {
  const response = await API.put(`/patients/${patientId}`, patientData);
  return response.data;
};

/**
 * Delete a patient record by ID
 * @param {string|number} patientId - ID of the patient to remove
 */
export const deletePatient = async (patientId) => {
  const response = await API.delete(`/patients/${patientId}`);
  return response.data;
};

// Default export object for backwards compatibility
const patientApi = {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
};

export default patientApi;