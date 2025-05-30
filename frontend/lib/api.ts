const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ChargingStation {
  _id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  status: "Active" | "Inactive" | "Maintenance";
  powerOutput: number;
  connectorType: "Type 1" | "Type 2" | "CCS" | "CHAdeMO" | "Tesla Supercharger";
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class ApiClient {
  private getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeader(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "API request failed");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.request<{ user: User; token: string }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );

    if (response.success && response.data?.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response;
  }

  async register(name: string, email: string, password: string) {
    const response = await this.request<{ user: User; token: string }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      }
    );

    if (response.success && response.data?.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response;
  }

  async getCurrentUser() {
    return this.request<{ user: User }>("/auth/me");
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  // Charging station methods
  async getChargingStations(params?: {
    page?: number;
    limit?: number;
    status?: string;
    connectorType?: string;
    search?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value.toString());
      });
    }

    const query = searchParams.toString();
    return this.request<ChargingStation[]>(
      `/charging-stations${query ? `?${query}` : ""}`
    );
  }

  async getChargingStation(id: string) {
    return this.request<ChargingStation>(`/charging-stations/${id}`);
  }

  async createChargingStation(
    data: Omit<ChargingStation, "_id" | "createdBy" | "createdAt" | "updatedAt">
  ) {
    return this.request<ChargingStation>("/charging-stations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateChargingStation(
    id: string,
    data: Partial<
      Omit<ChargingStation, "_id" | "createdBy" | "createdAt" | "updatedAt">
    >
  ) {
    return this.request<ChargingStation>(`/charging-stations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteChargingStation(id: string) {
    return this.request(`/charging-stations/${id}`, {
      method: "DELETE",
    });
  }

  async getNearbyChargingStations(
    latitude: number,
    longitude: number,
    radius?: number
  ) {
    const query = radius ? `?radius=${radius}` : "";
    return this.request<ChargingStation[]>(
      `/charging-stations/nearby/${latitude}/${longitude}${query}`
    );
  }
}

export const apiClient = new ApiClient();
