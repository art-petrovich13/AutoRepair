import axios from 'axios'
import type { Client, Vehicle, Employee, Service, Order } from '../types'

const api = axios.create({
  baseURL: 'http://localhost:5258/api',
})

export const clientsApi = {
  getAll:    ()                        => api.get<Client[]>('/clients'),
  getById:   (id: number)              => api.get<Client>(`/clients/${id}`),
  create:    (data: Omit<Client, 'id' | 'createdAt' | 'vehicleCount'>) => api.post('/clients', data),
  update:    (id: number, data: Omit<Client, 'id' | 'createdAt' | 'vehicleCount'>) => api.put(`/clients/${id}`, data),
  delete:    (id: number)              => api.delete(`/clients/${id}`),
}

export const vehiclesApi = {
  getAll:    ()                        => api.get<Vehicle[]>('/vehicles'),
  getById:   (id: number)              => api.get<Vehicle>(`/vehicles/${id}`),
  create:    (data: Omit<Vehicle, 'id' | 'clientName'>) => api.post('/vehicles', data),
  update:    (id: number, data: Omit<Vehicle, 'id' | 'clientName'>) => api.put(`/vehicles/${id}`, data),
  delete:    (id: number)              => api.delete(`/vehicles/${id}`),
}

export const employeesApi = {
  getAll:    ()                        => api.get<Employee[]>('/employees'),
  create:    (data: Omit<Employee, 'id'>) => api.post('/employees', data),
  update:    (id: number, data: Omit<Employee, 'id'>) => api.put(`/employees/${id}`, data),
  delete:    (id: number)              => api.delete(`/employees/${id}`),
}

export const servicesApi = {
  getAll:    ()                        => api.get<Service[]>('/services'),
  create:    (data: Omit<Service, 'id'>) => api.post('/services', data),
  update:    (id: number, data: Omit<Service, 'id'>) => api.put(`/services/${id}`, data),
  delete:    (id: number)              => api.delete(`/services/${id}`),
}

export const ordersApi = {
  getAll:    ()                        => api.get<Order[]>('/orders'),
  getById:   (id: number)              => api.get<Order>(`/orders/${id}`),
  create:    (data: unknown)           => api.post('/orders', data),
  updateStatus: (id: number, status: string) => api.patch(`/orders/${id}/status`, { status }),
  delete:    (id: number)              => api.delete(`/orders/${id}`),
}

export const statisticsApi = {
  getOverview:         () => api.get('/statistics/overview'),
  getOrdersByStatus:   () => api.get('/statistics/orders-by-status'),
  getRevenueByMonth:   () => api.get('/statistics/revenue-by-month'),
  getTopServices:      () => api.get('/statistics/top-services'),
  getOrdersByEmployee: () => api.get('/statistics/orders-by-employee'),
  getOrdersForExport:  () => api.get('/statistics/export-orders'),
}