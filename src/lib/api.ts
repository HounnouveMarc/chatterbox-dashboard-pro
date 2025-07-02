const API_URL = 'https://chatterbox-dashboard-pro.onrender.com/api';

export interface SignupData {
  phone: string;
  password: string;
  companyName: string;
  metaId: string;
  whatsappToken: string;
}

export interface LoginData {
  phone: string;
  password: string;
}

export interface PromptData {
  prompt: string;
  companyId: number;
}

export const api = {
  signup: async (data: SignupData) => {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de l\'inscription');
    }

    return response.json();
  },

  login: async (data: LoginData) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la connexion');
    }

    return response.json();
  },

  uploadFile: async (file: File, companyId: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('companyId', companyId.toString());

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de l\'upload du fichier');
    }

    return response.json();
  },

  updatePrompt: async (data: PromptData) => {
    const response = await fetch(`${API_URL}/prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la mise à jour du prompt');
    }

    return response.json();
  },
}; 
