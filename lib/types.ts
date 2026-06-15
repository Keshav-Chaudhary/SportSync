export type UserRole = 'Admin' | 'Staff' | 'Student'

export interface UserAccount {
  user_id: string
  email: string
  role_id: number
  created_at: string
  role?: UserRoleRecord
}

export interface UserRoleRecord {
  role_id: number
  role_name: UserRole
}

export interface Student {
  student_id: string
  user_id: string
  first_name: string
  last_name: string
  phone_number: string | null
  department: string
  enrollment_year: number
}

export interface Staff {
  staff_id: string
  user_id: string
  first_name: string
  last_name: string
  phone_number: string | null
  position: string
  hire_date: string
}

export interface EquipmentCategory {
  category_id: number
  category_name: string
  description: string | null
}

export interface Equipment {
  equipment_id: string
  name: string
  category_id: number
  total_quantity: number
  available_quantity: number
  condition: string
  location: string | null
  category?: EquipmentCategory
}

export interface GymEntry {
  entry_id: string
  user_id: string
  check_in_time: string
  check_out_time: string | null
  user?: UserAccount
  student?: Student
  staff?: Staff
}

export interface EquipmentLoan {
  loan_id: string
  user_id: string
  equipment_id: string
  quantity_borrowed: number
  borrow_date: string
  expected_return_date: string
  actual_return_date: string | null
  status: 'Borrowed' | 'Returned' | 'Overdue'
  equipment?: Equipment
  user?: UserAccount
  student?: Student
  staff?: Staff
}



