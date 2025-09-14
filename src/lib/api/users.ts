import api from "../api"

export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Change user password


// Delete user account
export const deleteAccount = () => {
  return api.put("/users/delete/account")
}