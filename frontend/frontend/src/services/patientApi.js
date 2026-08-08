const BASE_URL = "http://127.0.0.1:8000/api/v1/patients";

// Helper function to attach Authorization headers automatically
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// 1. GET ALL PATIENTS
export const getPatients = async () => {
  const response = await fetch(`${BASE_URL}/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to fetch patients.");
  }

  return await response.json();
};

// 2. CREATE A NEW PATIENT
export const createPatient = async (patientData) => {
  const response = await fetch(`${BASE_URL}/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(patientData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to create patient.");
  }

  return await response.json();
};

// 3. UPDATE AN EXISTING PATIENT
export const updatePatient = async (patientId, patientData) => {
  const response = await fetch(`${BASE_URL}/${patientId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(patientData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to update patient.");
  }

  return await response.json();
};

// 4. DELETE A PATIENT
export const deletePatient = async (patientId) => {
  const response = await fetch(`${BASE_URL}/${patientId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to delete patient.");
  }

  return await response.json();
};
