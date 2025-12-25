const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

// ---------------- helpers ----------------

async function request(url, options = {}) {
  const res = await fetch(url, options);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  return res.json();
}

// ---------------- API ----------------

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return request(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });
};

// sends api key and model to backend
export const storeApiKey = async (apiKey, model) => {
  try {
    const response = await fetch(`${API_BASE}/api-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        model: model
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error storing API key:', error);
    throw error;
  }
};

// Returns the model along with the status
export const checkApiKeyStatus = async () => {
  try {
    const response = await fetch(`${API_BASE}/api-key-status`);
    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        has_api_key: data.has_api_key,
        model: data.model || null // Include model in response
      };
    } else {
      return { success: false, error: data.detail || `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error('API key status check failed:', error);
    return { success: false, error: error.message || 'Network connection failed' };
  }
};

export const sendMessage = async (sessionId, content) => {
  return request(`${API_BASE}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      content,
    }),
  });
};

export const getMessages = async (sessionId) => {
  return request(`${API_BASE}/messages/${sessionId}`);
};

export const getDocumentInfo = async (sessionId) => {
  return request(`${API_BASE}/document/${sessionId}`);
};

export const queryDocument = async (sessionId, question) => {
  const data = await request(`${API_BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      question,
      n_results: 3,
    }),
  });

  // Normalize ALL possible backend shapes
  const text =
    data?.text ||
    data?.response ||
    data?.reply ||
    data?.content ||
    data?.answer ||
    "";

  return { text };
};

export const healthCheck = async () => {
  return request(`${API_BASE}/health`);
};
