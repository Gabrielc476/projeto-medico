import { api } from "./api";
import { RegisterPatientDto, LoginDto, AuthResponseDto } from "../types";

export const authService = {
  async register(data: RegisterPatientDto): Promise<AuthResponseDto> {
    const response = await api.post<AuthResponseDto>("/auth/register", data);
    return response.data;
  },

  async login(data: LoginDto): Promise<AuthResponseDto> {
    const response = await api.post<AuthResponseDto>("/auth/login", data);
    return response.data;
  },
};
