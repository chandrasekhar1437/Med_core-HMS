import API from "./api";

/**
 * Fetch all medicine items from pharmacy inventory
 */
export const getMedicines = async () => {
  const response = await API.get("/pharmacy");
  return response.data;
};

/**
 * Add a new medicine record to inventory
 * @param {Object} medicineData
 */
export const createMedicine = async (medicineData) => {
  const response = await API.post("/pharmacy", medicineData);
  return response.data;
};

/**
 * Update an existing medicine record (supports both PATCH and PUT)
 * @param {string|number} medicineId
 * @param {Object} medicineData
 */
export const updateMedicine = async (medicineId, medicineData) => {
  try {
    const response = await API.patch(`/pharmacy/${medicineId}`, medicineData);
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 405) {
      const fallbackResponse = await API.put(`/pharmacy/${medicineId}`, medicineData);
      return fallbackResponse.data;
    }
    throw err;
  }
};

/**
 * Remove a medicine record from inventory
 * @param {string|number} medicineId
 */
export const deleteMedicine = async (medicineId) => {
  const response = await API.delete(`/pharmacy/${medicineId}`);
  return response.data;
};

const pharmacyApi = {
  getMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
};

export default pharmacyApi;