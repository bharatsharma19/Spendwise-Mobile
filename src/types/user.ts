export interface UserPreferences {
  currency: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  theme: "light" | "dark" | "system";
  budgetAlerts: boolean;
  monthlyBudget?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  phone_number: string;
  display_name: string;
  photo_url: string;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  status: "active" | "inactive" | "suspended";
  last_login_at?: string;
  last_logout_at?: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  displayName: string;
  phoneNumber?: string;
}

export interface RegisterResponse {
  uid: string;
  email: string;
  phoneNumber?: string;
  displayName: string;
  message: string;
}

export interface UpdateProfileDto {
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
}

export interface UpdatePreferencesDto {
  currency?: string;
  language?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  theme?: "light" | "dark" | "system";
  budgetAlerts?: boolean;
  monthlyBudget?: number;
}
