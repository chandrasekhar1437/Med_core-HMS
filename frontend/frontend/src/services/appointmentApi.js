const BASE_URL = "http://127.0.0.1:8000/api/v1/appointments";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const getAppointments = async () => {
  const response = await fetch(`${BASE_URL}/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to fetch appointments.");
  }

  return await response.json();
};

export const createAppointment = async (appointmentData) => {
  const response = await fetch(`${BASE_URL}/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(appointmentData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to create appointment.");
  }

  return await response.json();
};

export const updateAppointment = async (appointmentId, appointmentData) => {
  const response = await fetch(`${BASE_URL}/${appointmentId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(appointmentData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to update appointment.");
  }

  return await response.json();
};

export const deleteAppointment = async (appointmentId) => {
  const response = await fetch(`${BASE_URL}/${appointmentId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to delete appointment.");
  }

  return await response.json();
};