export const AUTH_TOKEN_KEY = "auth_token"

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3001"

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: unknown
  token?: string
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const fetchWithRetry = async (attempt = 1): Promise<Response> => {
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method: options.method ?? "GET",
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      if (!response.ok && attempt < 3 && response.status >= 500) {
        const delay = 500 * Math.pow(2, attempt - 1);
        await new Promise((res) => setTimeout(res, delay));
        return fetchWithRetry(attempt + 1);
      }
      return response;
    } catch (err) {
      if (attempt < 3) {
        const delay = 500 * Math.pow(2, attempt - 1);
        await new Promise((res) => setTimeout(res, delay));
        return fetchWithRetry(attempt + 1);
      }
      throw new Error(`Failed to fetch: ${(err as Error).message}. Please check your connection.`);
    }
  };

  const response = await fetchWithRetry();

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status} ${response.statusText}`;
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        const msg = errorData.message || errorData.error || errorData.detail;
        errorMessage = Array.isArray(msg) ? msg.join("\n") : msg || errorMessage;
      } else {
        const text = await response.text();
        if (text) {
          errorMessage = text;
        }
      }
    } catch {
      // ignore parsing errors
    }
    throw new Error(errorMessage);
  }

  return (await response.json()) as T;
}

// ==================== AUTH TYPES & API ====================

export type UserType = "SUPER_ADMIN" | "SCHOOL_ADMIN"

export type LoginResponse = { token: string; message: string }

export type UserResponse = {
  id: number
  email: string
  username?: string
  phonenumber?: string
  tenant_id?: string
  user_type: UserType
  avatar?: string
  status: "ACTIVE" | "INACTIVE" | "PENDING"
  created_at?: string
  updated_at?: string
}

export type RegisterResponse = UserResponse

export function login(email: string, password: string) {
  return request<LoginResponse>("/api/login", {
    method: "POST",
    body: {
      email,
      password
    },
  })
}

export function register(payload: {
  email: string
  password: string
  user_type?: "SUPER_ADMIN" | "SCHOOL_ADMIN"
  username?: string
  phonenumber?: string
  tenant_id?: string
  avatar?: string
  status?: "ACTIVE" | "INACTIVE"
  // School info for SCHOOL_ADMIN
  school_enname?: string
  school_khname?: string
  school_zhname?: string
  school_short?: string
  student_code_prefix?: string
  student_code_suffix?: string
  student_code_digit?: string | number
}) {
  return request<RegisterResponse>("/api/register", {
    method: "POST",
    body: payload,
  })
}


export function logout(token: string) {
  return request<{ message: string }>("/api/logout", {
    method: "POST",
    token,
  })
}

export function getUser(token: string) {
  return request<UserResponse>("/api/user", {
    method: "GET",
    token,
  })
}

export function forgotPassword(email: string) {
  return request<{ message: string; reset_token: string }>("/api/forgot-password", {
    method: "POST",
    body: { email },
  })
}

export function resetPassword(token: string, password: string) {
  return request<{ message: string }>("/api/reset-password", {
    method: "POST",
    body: { token, password },
  })
}

// ==================== STUDENT TYPES & API ====================

export type ApiStudent = {
  id: number
  user_id?: number
  tenant_id?: string
  school_id?: number
  branch_id?: number
  level_id?: number
  photo?: string
  studentcode: string
  enname: string
  khname: string
  zhname?: string
  gender: string
  date_of_birth: string
  nationality: string
  religion?: string
  pob_province?: string
  pob_district?: string
  pob_commune?: string
  pob_village?: string
  cur_province?: string
  cur_district?: string
  cur_commune?: string
  cur_village?: string
  joinschool: string
  leftschool?: string
  status: "ACTIVE" | "INACTIVE"
  father_name?: string
  father_phone?: string
  mother_name?: string
  mother_phone?: string
  created_at?: string
  updated_at?: string
}

export type StudentPayload = {
  tenant_id?: string
  school_id?: number
  branch_id?: number
  photo?: string
  studentcode: string
  enname: string
  khname: string
  zhname?: string
  gender: string
  date_of_birth: string
  nationality: string
  religion?: string
  pob_province?: string
  pob_district?: string
  pob_commune?: string
  pob_village?: string
  cur_province?: string
  cur_district?: string
  cur_commune?: string
  cur_village?: string
  joinschool?: string
  leftschool?: string
  father_name?: string
  father_phone?: string
  mother_name?: string
  mother_phone?: string
  status?: "ACTIVE" | "INACTIVE"

  level_id?: number

  created_at?: string;
  updated_at?: string;
}

type StudentsResponse = {
  message: string
  data: ApiStudent[]
}

type StudentResponse = {
  message: string
  data: ApiStudent
}

export function getStudents(token?: string) {
  return request<StudentsResponse>("/api/students", { token })
}

export function createStudent(token: string, payload: StudentPayload) {
  return request<StudentResponse>("/api/students", {
    method: "POST",
    token,
    body: payload,
  })
}

export function updateStudent(
  token: string,
  id: number,
  payload: Partial<StudentPayload>,
) {
  return request<StudentResponse>(`/api/students/${id}`, {
    method: "PUT",
    token,
    body: payload,
  })
}

export function deleteStudent(token: string, id: number) {
  return request<{ message: string }>(`/api/students/${id}`, {
    method: "DELETE",
    token,
  })
}
// ==================== EMPLOYEE (TEACHER) TYPES & API ====================

export type ApiEmployee = {
  id: number
  user_id?: number
  tenant_id?: string
  school_id?: number
  branch_id?: number
  photo?: string
  teachercode: string
  enname: string
  khname: string
  zhname?: string
  gender: string
  date_of_birth: string
  nationality: string
  religion?: string
  pob_province?: string
  pob_district?: string
  pob_commune?: string
  pob_village?: string
  cur_province?: string
  cur_district?: string
  cur_commune?: string
  cur_village?: string
  is_active: boolean
  joinwork: string
  leftwork?: string
  father_name?: string
  father_phone?: string
  mother_name?: string
  mother_phone?: string
  created_at?: string
  updated_at?: string
}

export type EmployeePayload = {
  tenant_id?: string
  school_id?: number
  branch_id?: number
  photo?: string
  teachercode: string
  enname: string
  khname: string
  zhname?: string
  gender: string
  date_of_birth: string
  nationality: string
  religion?: string
  pob_province?: string
  pob_district?: string
  pob_commune?: string
  pob_village?: string
  cur_province?: string
  cur_district?: string
  cur_commune?: string
  cur_village?: string
  is_active?: boolean
  joinwork: string
  leftwork?: string
  father_name?: string
  father_phone?: string
  mother_name?: string
  mother_phone?: string
}

type EmployeesResponse = {
  message: string
  data: ApiEmployee[]
}

type EmployeeResponse = {
  message: string
  data: ApiEmployee
}

export function getEmployees(token?: string) {
  return request<EmployeesResponse>("/api/employees", { token })
}

export function createEmployee(token: string, payload: EmployeePayload) {
  return request<EmployeeResponse>("/api/employees", {
    method: "POST",
    token,
    body: payload,
  })
}

export function updateEmployee(
  token: string,
  id: number,
  payload: Partial<EmployeePayload>,
) {
  return request<EmployeeResponse>(`/api/employees/${id}`, {
    method: "PUT",
    token,
    body: payload,
  })
}

export function deleteEmployee(token: string, id: number) {
  return request<{ message: string }>(`/api/employees/${id}`, {
    method: "DELETE",
    token,
  })
}

// ==================== BRANCH TYPES & API ====================

export type ApiBranch = {
  id: number
  tenant_id?: string
  khname?: string
  enname?: string
  zhname?: string
  student_code_prefix?: string
  student_code_suffix?: string
  student_code_digit?: number
  status?: "active" | "inactive"
  phone?: string
  address?: string
  school_id: number
  created_at?: string
  updated_at?: string
}

export type BranchPayload = {
  tenant_id?: string
  khname?: string
  enname?: string
  zhname?: string
  student_code_prefix?: string
  student_code_suffix?: string
  student_code_digit?: number
  status?: "active" | "inactive"
  phone?: string
  address?: string
  school_id?: number
}

type BranchesResponse = {
  message: string
  data: ApiBranch[]
}

type BranchResponse = {
  message: string
  data: ApiBranch
}

export function getBranches(token?: string) {
  return request<BranchesResponse>("/api/branches", { token })
}

export function createBranch(token: string, payload: BranchPayload) {
  return request<BranchResponse>("/api/branches", {
    method: "POST",
    token,
    body: payload,
  })
}

export function updateBranch(
  token: string,
  id: number,
  payload: Partial<BranchPayload>,
) {
  return request<BranchResponse>(`/api/branches/${id}`, {
    method: "PUT",
    token,
    body: payload,
  })
}

export function deleteBranch(token: string, id: number) {
  return request<{ message: string }>(`/api/branches/${id}`, {
    method: "DELETE",
    token,
  })
}

// ==================== LEVEL TYPES & API ====================

export type ApiLevel = {
  id: number
  school_id: number
  name: string
  description?: string
  display_order: number
  status: "active" | "inactive"
  created_at?: string
  updated_at?: string
}

export type LevelPayload = {
  school_id?: number
  name: string
  description?: string
  display_order?: number
  status?: "active" | "inactive"
}

type LevelsResponse = {
  message: string
  data: ApiLevel[]
}

type LevelResponse = {
  message: string
  data: ApiLevel
}

export function getLevels(token?: string, school_id?: number) {
  const params = school_id ? `?school_id=${school_id}` : ""
  return request<LevelsResponse>(`/api/levels${params}`, { token })
}

export function createLevel(token: string, payload: LevelPayload) {
  return request<LevelResponse>("/api/levels", {
    method: "POST",
    token,
    body: payload,
  })
}

export function updateLevel(
  token: string,
  id: number,
  payload: Partial<LevelPayload>,
) {
  return request<LevelResponse>(`/api/levels/${id}`, {
    method: "PUT",
    token,
    body: payload,
  })
}

export function deleteLevel(token: string, id: number) {
  return request<{ message: string }>(`/api/levels/${id}`, {
    method: "DELETE",
    token,
  })
}

// ==================== SCHOOL TYPES & API ====================
// Aligned with backend School entity:
// id, tenant_id, user_id, khname, enname, zhname,
// student_code_prefix, student_code_suffix, student_code_digit, short_school

export type ApiSchool = {
  id: number
  tenant_id?: string
  user_id?: number
  khname?: string
  enname?: string
  zhname?: string
  student_code_prefix?: string
  student_code_suffix?: string
  student_code_digit?: number
  short_school?: string
  created_at?: string
  updated_at?: string
  user?: {
    email: string
    username: string
    phonenumber: string
  }
}

export type SchoolPayload = {
  tenant_id?: string
  khname?: string
  enname?: string
  zhname?: string
  student_code_prefix?: string
  student_code_suffix?: string
  student_code_digit?: number
  short_school?: string
}

type SchoolsResponse = {
  message: string
  data: ApiSchool[]
}

type SchoolResponse = {
  message: string
  data: ApiSchool
}

export function getSchools(token?: string) {
  return request<SchoolsResponse>("/api/schools", { token })
}

export function createSchool(token: string, payload: SchoolPayload) {
  return request<SchoolResponse>("/api/schools", {
    method: "POST",
    token,
    body: payload,
  })
}

export function updateSchool(token: string, id: number, payload: Partial<SchoolPayload>) {
  return request<SchoolResponse>(`/api/schools/${id}`, {
    method: "PUT",
    token,
    body: payload,
  })
}

export function updateSchoolProfile(token: string, payload: Partial<SchoolPayload>) {
  return request<SchoolResponse>(`/api/schools/profile`, {
    method: "PUT",
    token,
    body: payload,
  })
}

export function deleteSchool(token: string, id: number) {
  return request<{ message: string }>(`/api/schools/${id}`, {
    method: "DELETE",
    token,
  })
}

export function getSchool(token: string, id: number) {
  return request<SchoolResponse>(`/api/schools/${id}`, { token })
}

// ==================== REPORT TYPES & API ====================
// Aligned with backend Report entity:
// id, tenant_id, school_id, branch_id, teacher_id, student_id,
// title, type (academic|behavior|progress), score, date,
// status (draft|published|archived), description, notes, created_by

export type ApiReport = {
  id: number
  tenant_id?: string
  school_id: number
  branch_id?: number
  teacher_id?: number
  student_id?: number
  title: string
  type: "academic" | "behavior" | "progress"
  score?: number
  date: string
  status: "draft" | "published" | "archived"
  description?: string
  notes?: string
  created_by?: number
  created_at?: string
  updated_at?: string
}

export type ReportPayload = {
  tenant_id?: string
  school_id: number
  branch_id?: number
  teacher_id?: number
  student_id?: number
  title: string
  type: "academic" | "behavior" | "progress"
  score?: number
  date: string
  status?: "draft" | "published" | "archived"
  description?: string
  notes?: string
}

type ReportsResponse = {
  message: string
  data: ApiReport[]
}

type ReportResponse = {
  message: string
  data: ApiReport
}

export function getReports(token?: string) {
  return request<ReportsResponse>("/api/reports", { token })
}

export function createReport(token: string, payload: ReportPayload) {
  return request<ReportResponse>("/api/reports", {
    method: "POST",
    token,
    body: payload,
  })
}

export function updateReport(token: string, id: number, payload: Partial<ReportPayload>) {
  return request<ReportResponse>(`/api/reports/${id}`, {
    method: "PUT",
    token,
    body: payload,
  })
}

export function deleteReport(token: string, id: number) {
  return request<{ message: string }>(`/api/reports/${id}`, {
    method: "DELETE",
    token,
  })
}

// ==================== USER TYPES & API (placeholder) ====================

// ==================== USER MANAGEMENT API (Admin) ====================

export type ApiUser = {
  id: number
  tenant_id?: string
  username?: string
  email: string
  phonenumber?: string
  user_type: "SUPER_ADMIN" | "SCHOOL_ADMIN"
  avatar?: string
  status: "ACTIVE" | "INACTIVE" | "PENDING"
  created_at: string
  updated_at: string
  school_name?: string
}

type UsersResponse = {
  message: string
  data: ApiUser[]
}

export function getUsers(token: string) {
  return request<UsersResponse>("/api/users", { token })
}

export function getPendingUsers(token?: string) {
  return request<UsersResponse>("/api/users?status=PENDING", { token })
}

export function createUserByAdmin(token: string, payload: {
  tenant_id?: string
  username?: string
  email: string
  password: string
  user_type: "SUPER_ADMIN" | "SCHOOL_ADMIN"
}) {
  return request<{ message: string; user: ApiUser }>("/api/admin/create-user", {
    method: "POST",
    token,
    body: payload,
  })
}

export function updateUserByAdmin(token: string, id: number, payload: {
  email?: string
  username?: string
  phonenumber?: string
  user_type?: "SUPER_ADMIN" | "SCHOOL_ADMIN"
  status?: "ACTIVE" | "INACTIVE"
}) {
  return request<{ message: string; user: ApiUser }>(`/api/admin/update-user/${id}`, {
    method: "PUT",
    token,
    body: payload,
  })
}

export function deleteUserApi(token: string, id: number) {
  return request<{ message: string }>(`/api/user/${id}`, {
    method: "DELETE",
    token,
  })
}

export function approveUser(token: string, id: number) {
  return request<{ message: string; user: ApiUser }>(`/api/admin/approve-user/${id}`, {
    method: "POST",
    token,
  })
}

export function rejectUser(token: string, id: number) {
  return request<{ message: string; user: ApiUser }>(`/api/admin/reject-user/${id}`, {
    method: "POST",
    token,
  })
}

// ==================== GLOBAL SEARCH API ====================

export type SearchResult = {
  students: ApiStudent[]
  employees: ApiEmployee[]
  branches: ApiBranch[]
  levels: ApiLevel[]
  reports: ApiReport[]
  schools: ApiSchool[]
  users: ApiUser[]
}

export function globalSearch(token: string, query: string) {
  const params = query ? `?q=${encodeURIComponent(query)}` : ""
  return request<SearchResult>(`/api/search${params}`, { token })
}

export function updateUserProfile(token: string, userId: number, payload: {
  username?: string
  email?: string
  phonenumber?: string
}) {
  return request<{ message: string; user: UserResponse }>(`/api/userupdate/${userId}`, {
    method: "PUT",
    token,
    body: payload,
  })
}

export function updateUser(token: string, userId: number, payload: { password?: string }) {
  return request<{ message: string; user: UserResponse }>(`/api/userupdate/${userId}`, {
    method: "PUT",
    token,
    body: payload,
  })
}

export function checkUserActive(token: string) {
  return request<{ active: boolean; status: string }>("/api/user/check-active", { token })
}

// ==================== MESSAGE API ====================

export type ApiMessageUser = {
  id: number
  email: string
  username?: string
  user_type: string
  tenant_id?: string
}

export type RecipientType = "individual" | "all_schools" | "school"

export type ApiMessage = {
  id: number
  sender_id: number
  sender_email?: string
  recipient_id?: number
  recipient_email?: string
  recipient_type: RecipientType
  recipient_school_id?: number
  recipient_school_name?: string
  title: string
  message: string
  created_at: string
  read_at: string | null
}

export type ApiSentMessage = {
  id: number
  recipient_type: RecipientType
  recipient_school_id?: number
  recipient_school_name?: string
  title: string
  message: string
  created_at: string
  read_count: number
  total_count: number
  sample_recipient_email?: string
}

type InboxResponse = {
  message: string
  data: ApiMessage[]
  unread_count: number
}

type SentResponse = {
  message: string
  data: ApiSentMessage[]
}

export function sendMessage(token: string, payload: {
  recipient_id?: number
  school_id?: number
  recipient_type: RecipientType
  title: string
  message: string
}) {
  return request<{ message: string; data: ApiMessage | ApiMessage[] }>("/api/messages", {
    method: "POST",
    token,
    body: payload,
  })
}

export function getInbox(token: string) {
  return request<InboxResponse>("/api/messages/inbox", { token })
}

export function getSentMessages(token: string) {
  return request<SentResponse>("/api/messages/sent", { token })
}

export function getUnreadCount(token: string) {
  return request<{ unread_count: number }>("/api/messages/unread-count", { token })
}

export function markMessageRead(token: string, id: number) {
  return request<{ message: string }>(`/api/messages/${id}/read`, {
    method: "PUT",
    token,
  })
}

export function deleteSentMessage(token: string, id: number) {
  return request<{ message: string }>(`/api/messages/sent/${id}`, {
    method: "DELETE",
    token,
  })
}

export function deleteInboxMessage(token: string, id: number) {
  return request<{ message: string }>(`/api/messages/inbox/${id}`, {
    method: "DELETE",
    token,
  })
}



export function getMessageUsers(token: string) {
  return request<{ message: string; data: ApiMessageUser[] }>("/api/messages/users", { token })
}

// ==================== FILE UPLOAD API ====================

export async function uploadPhoto(token: string, file: File, name?: string): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  if (name) formData.append("name", name)

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    let errorMessage = "Failed to upload photo"
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
    } catch {
      // ignore
    }
    throw new Error(errorMessage)
  }

  const data = await response.json()
  return data.url as string
}

export function getImageUrl(photo?: string) {
  if (!photo) return "";
  if (photo.startsWith("http://") || photo.startsWith("https://") || photo.startsWith("data:")) {
    return photo;
  }
  return `${API_BASE_URL}${photo}`;
}
