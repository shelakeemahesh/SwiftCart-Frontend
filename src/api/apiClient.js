export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

async function request(path, options = {}) {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (options.params) {
    Object.entries(options.params).forEach(([key, val]) => {
      url.searchParams.append(key, val);
    });
  }

  const headers = new Headers(options.headers || {});
  // Set Auth token if available
  const token = localStorage.getItem("sc_access_token");
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Set Content-Type default if method is POST/PUT and not FormData
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const fetchOptions = {
    ...options,
    headers,
  };

  let response = await fetch(url.toString(), fetchOptions);

  // If unauthorized, try to refresh token once
  if (response.status === 418 || response.status === 401) {
    const refreshToken = localStorage.getItem("sc_refresh_token");
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(
          `${API_BASE_URL}/api/v1/auth/refresh-token?refreshToken=${encodeURIComponent(refreshToken)}`,
          {
            method: "POST",
          },
        );
        if (refreshResponse.ok) {
          const authData = await refreshResponse.json();
          const tokenData = authData.data || authData;
          localStorage.setItem("sc_access_token", tokenData.accessToken);
          localStorage.setItem("sc_refresh_token", tokenData.refreshToken);
          // Retry the original request with the new token
          headers.set("Authorization", `Bearer ${tokenData.accessToken}`);
          response = await fetch(url.toString(), fetchOptions);
        } else {
          // Refresh failed, clear session
          clearSession();
        }
      } catch (err) {
        console.error("Token refresh failed", err);
        clearSession();
      }
    }
  }

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      // response is not JSON
      try {
        const text = await response.text();
        if (text) errorMessage = text;
      } catch (e2) {}
    }
    throw new Error(errorMessage);
  }

  // Handle empty responses
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const json = await response.json();
    if (
      json &&
      typeof json === "object" &&
      "status" in json &&
      "message" in json &&
      "data" in json
    ) {
      return json.data;
    }
    return json;
  }
  return await response.text();
}

function clearSession() {
  localStorage.removeItem("sc_logged_in");
  localStorage.removeItem("sc_user_name");
  localStorage.removeItem("sc_user_phone");
  localStorage.removeItem("sc_user_role");
  localStorage.removeItem("sc_user_email");
  localStorage.removeItem("sc_user_provider");
  localStorage.removeItem("sc_user_avatar_url");
  localStorage.removeItem("sc_access_token");
  localStorage.removeItem("sc_refresh_token");
  window.dispatchEvent(new Event("auth-logout"));
}

export const apiClient = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) =>
    request(path, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: (path, body, options) =>
    request(path, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};
