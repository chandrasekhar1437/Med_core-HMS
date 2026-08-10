import API from "./api";

/**
 * Fetch all doctors from the database
 */
export const fetchDoctors = async () => {
  try {
    const response = await API.get("/doctors");
    return response.data;
  } catch (err) {
    if (err.response && (err.response.status === 404 || err.response.status === 307)) {
      const fallback = await API.get("/doctors/");
      return fallback.data;
    }
    throw err;
  }
};

/**
 * Create a new doctor record
 * @param {Object} doctorData - Doctor details payload
 */
export const createDoctor = async (doctorData) => {
  try {
    const response = await API.post("/doctors", doctorData);
    return response.data;
  } catch (err) {
    if (err.response && (err.response.status === 404 || err.response.status === 307)) {
      const fallback = await API.post("/doctors/", doctorData);
      return fallback.data;
    }
    throw err;
  }
};

/**
 * Update an existing doctor record by ID
 * @param {string|number} doctorId - ID of the doctor
 * @param {Object} doctorData - Updated fields
 */
export const updateDoctor = async (doctorId, doctorData) => {
  try {
    const response = await API.put(`/doctors/${doctorId}`, doctorData);
    return response.data;
  } catch (err) {
    if (err.response && (err.response.status === 405 || err.response.status === 404)) {
      const fallback = await API.patch(`/doctors/${doctorId}`, doctorData);
      return fallback.data;
    }
    throw err;
  }
};

/**
 * Delete a doctor record by ID
 * @param {string|number} doctorId - ID of the doctor to remove
 */
export const deleteDoctor = async (doctorId) => {
  try {
    const response = await API.delete(`/doctors/${doctorId}`);
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      const fallback = await API.delete(`/doctors/${doctorId}/`);
      return fallback.data;
    }
    throw err;
  }
};

const doctorApi = {
  fetchDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};

export default doctorApi;