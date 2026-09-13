export type UserType = "SUPER_ADMIN" | "SCHOOL_ADMIN"

export type UserResponse = {
  id: number
  email: string
  username?: string
  phonenumber?: string
  tenant_id?: string
  user_type: UserType
  avatar?: string
  status: "ACTIVE" | "INACTIVE"
  created_at?: string
  updated_at?: string
}