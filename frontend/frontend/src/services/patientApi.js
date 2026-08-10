import API from "./api";

/**
 * Fetch all patients from the database
 */
export const getPatients = async () => {
  try {
    const response = await API.get("/patients/");
    return response.data;
  } catch (err) {
    if (err.response && (err.response.status === 404 || err.response.status === 307)) {
      const fallback = await API.get("/patients");
      return fallback.data;
    }
    throw err;
  }
};

/**
 * Create a new patient record
 * @param {Object} patientData - Patient details payload
 */
export const createPatient = async (patientData) => {
  try {
    const response = await API.post("/patients/", patientData);
    return response.data;
  } catch (err) {
    if (err.response && (err.response.status === 404 || err.response.status === 307)) {
      const fallback = await API.post("/patients", patientData);
      return fallback.data;
    }
    throw err;
  }
};

/**
 * Update an existing patient record by ID
 * @param {string|number} patientId - ID of the patient
 * @param {Object} patientData - Updated fields
 */
export const updatePatient = async (patientId, patientData) => {
  try {
    const response = await API.put(`/patients/${patientId}`, patientData);
    return response.data;
  } catch (err) {
    if (err.response && (err.response.status === 405 || err.response.status === 404)) {
      const fallback = await API.patch(`/patients/${patientId}`, patientData);
      return fallback.data;
    }
    throw err;
  }
};

/**
 * Delete a patient record by ID
 * @param {string|number} patientId - ID of the patient to remove
 */
export const deletePatient = async (patientId) => {
  try {
    const response = await API.delete(`/patients/${patientId}`);
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      const fallback = await API.delete(`/patients/${patientId}/`);
      return fallback.data;
    }
    throw err;
  }
};

const patientApi = {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
};

export default patientApi;