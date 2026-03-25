
export type User = {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  account_id: string;
  balance: number;
  interest_gained: number;
}

export interface UserResponse {
  user: User
}

export const UserObject: User = {
  user_id: "JohnDoe",
  email: "test@email.com",
  first_name: "John",
  last_name: "Doe",
  account_id: "PV-10234",
  balance: 12000,
  interest_gained: 8500,
}


export interface LoginResponse  {
  token?: string
  user_id?: string
  message: string
  status?: number
}
