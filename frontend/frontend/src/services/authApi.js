import API from "./api";

/**
 * Login user via FastAPI OAuth2 form-urlencoded endpoint
 * @param {string} email
 * @param {string} password
 */
export const loginUser = async (email, password) => {
  const formData = new URLSearchParams();
  formData.append("username", email); // OAuth2PasswordRequestForm expects 'username'
  formData.append("password", password);

  const response = await API.post("/auth/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (response.data.access_token) {
    localStorage.setItem("access_token", response.data.access_token);
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
export const registerUser = async ({ name, email, password, role = "patient" }) => {
  const response = await API.post("/auth/register", {
    name,
    email,
    password,
    role,
  });
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