export interface Client {
  id: number
  name: string
  phone?: string
  email?: string
  createdAt: string
  vehicleCount: number
}

export interface Vehicle {
  id: number
  clientId: number
  clientName: string
  brand: string
  model: string
  year?: number
  licensePlate?: string
  vin?: string
}

export interface Employee {
  id: number
  name: string
  position?: string
  phone?: string
  hireDate: string
}

export interface Service {
  id: number
  name: string
  description?: string
  price: number
  durationHours?: number
}

export interface OrderServiceItem {
  id: number
  serviceId: number
  serviceName: string
  quantity: number
  price: number
}

export interface SparePart {
  id: number
  name: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: number
  vehicleId: number
  vehicleInfo: string
  clientName: string
  employeeId: number
  employeeName: string
  status: 'Pending' | 'InProgress' | 'Completed' | 'Cancelled'
  createdAt: string
  completedAt?: string
  totalAmount: number
  notes?: string
  orderServices: OrderServiceItem[]
  spareParts: SparePart[]
}

export interface Overview {
  totalOrders: number
  activeOrders: number
  totalRevenue: number
  totalClients: number
}