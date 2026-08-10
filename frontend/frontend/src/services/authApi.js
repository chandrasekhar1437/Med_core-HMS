import API from "./api";

/**
 * Login user via FastAPI OAuth2 form-urlencoded endpoint
 * @param {string} email
 * @param {string} password
 */
export const loginUser = async (email, password) => {
  const cleanEmail = email.toLowerCase().trim();
  const cleanPassword = password.trim();

  const formData = new URLSearchParams();
  formData.append("username", cleanEmail); // OAuth2PasswordRequestForm expects 'username'
  formData.append("password", cleanPassword);

  const response = await API.post("/auth/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (response.data.access_token) {
    // Store token under both keys to ensure full component compatibility
    localStorage.setItem("access_token", response.data.access_token);
    localStorage.setItem("token", response.data.access_token);
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
  }

  return response.data;
};

/**
 * Register a new user account
 * @param {Object} userData - Registration payload ({ name, email, password, role })
 */
export const registerUser = async ({ name, email, password, role = "Patient" }) => {
  const cleanName = name.trim();
  const cleanEmail = email.toLowerCase().trim();
  const cleanPassword = password.trim();

  const response = await API.post("/auth/register", {
    name: cleanName,
    full_name: cleanName, // Compatibility for backends expecting full_name
    email: cleanEmail,
    password: cleanPassword,
    role,
  });

  if (response.data.access_token) {
    localStorage.setItem("access_token", response.data.access_token);
    localStorage.setItem("token", response.data.access_token);
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
  }

  return response.data;
};

/**
 * Fetch profile details for current logged-in user
 */
export const getCurrentUser = async () => {
  const response = await API.get("/auth/me");
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

/**
 * Logout user by clearing active storage items
 */
export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("access");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Default export object for backwards compatibility
const authApi = {
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
};

export default authApi;