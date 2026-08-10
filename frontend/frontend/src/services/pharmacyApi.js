import API from "./api";

/**
 * Fetch all medicine items from pharmacy inventory
 */
export const getMedicines = async () => {
  try {
    const response = await API.get("/pharmacy/");
    return response.data;
  } catch (err) {
    if (err.response && (err.response.status === 404 || err.response.status === 307)) {
      const fallback = await API.get("/pharmacy");
      return fallback.data;
    }
    throw err;
  }
};

/**
 * Add a new medicine record to inventory
 * @param {Object} medicineData - Medicine details payload
 */
export const createMedicine = async (medicineData) => {
  try {
    const response = await API.post("/pharmacy/", medicineData);
    return response.data;
  } catch (err) {
    if (err.response && (err.response.status === 404 || err.response.status === 307)) {
      const fallback = await API.post("/pharmacy", medicineData);
      return fallback.data;
    }
    throw err;
  }
};

/**
 * Update an existing medicine record (supports both PATCH and PUT)
 * @param {string|number} medicineId - ID of the medicine record
 * @param {Object} medicineData - Updated fields
 */
export const updateMedicine = async (medicineId, medicineData) => {
  try {
    const response = await API.patch(`/pharmacy/${medicineId}`, medicineData);
    return response.data;
  } catch (err) {
    if (err.response && (err.response.status === 405 || err.response.status === 404)) {
      const fallbackResponse = await API.put(`/pharmacy/${medicineId}`, medicineData);
      return fallbackResponse.data;
    }
    throw err;
  }
};

/**
 * Remove a medicine record from inventory
 * @param {string|number} medicineId - ID of the medicine to remove
 */
export const deleteMedicine = async (medicineId) => {
  try {
    const response = await API.delete(`/pharmacy/${medicineId}`);
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      const fallback = await API.delete(`/pharmacy/${medicineId}/`);
      return fallback.data;
    }
    throw err;
  }
};

const pharmacyApi = {
  getMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
};

export default pharmacyApi;