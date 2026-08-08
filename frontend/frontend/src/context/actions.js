import API from "../services/api"; // Corrected path to point to the services folder

export const fetchDoctors = async () => {
  try {
    const response = await API.get("/doctors/");
    return response.data;
  } catch (error) {
    console.error("Error fetching doctors:", error.response?.data || error.message);
    throw error;
  }
};

export const createDoctor = async (doctorData) => {
  try {
    const response = await API.post("/doctors/", doctorData);
    return response.data;
  } catch (error) {
    console.error("Error creating doctor:", error.response?.data || error.message);
    throw error;
  }
};

export const updateDoctor = async (doctorId, doctorData) => {
  try {
    const response = await API.put(`/doctors/${doctorId}`, doctorData);
    return response.data;
  } catch (error) {
    console.error("Error updating doctor:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteDoctor = async (doctorId) => {
  try {
    const response = await API.delete(`/doctors/${doctorId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting doctor:", error.response?.data || error.message);
    throw error;
  }
};