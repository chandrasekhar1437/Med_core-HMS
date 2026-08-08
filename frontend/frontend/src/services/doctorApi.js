// Add these functions into your src/services/api.js file:

export const fetchDoctors = async () => {
  const response = await API.get("/doctors/");
  return response.data;
};

export const createDoctor = async (doctorData) => {
  const response = await API.post("/doctors/", doctorData);
  return response.data;
};

export const updateDoctor = async (doctorId, doctorData) => {
  const response = await API.put(`/doctors/${doctorId}`, doctorData);
  return response.data;
};

export const deleteDoctor = async (doctorId) => {
  const response = await API.delete(`/doctors/${doctorId}`);
  return response.data;
};