import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard  from './pages/Dashboard'
import Clients    from './pages/Clients'
import Vehicles   from './pages/Vehicles'
import Employees  from './pages/Employees'
import Services   from './pages/Services'
import Orders     from './pages/Orders'
import Reports    from './pages/Reports'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"  element={<Dashboard />} />
        <Route path="orders"     element={<Orders />} />
        <Route path="clients"    element={<Clients />} />
        <Route path="vehicles"   element={<Vehicles />} />
        <Route path="employees"  element={<Employees />} />
        <Route path="services"   element={<Services />} />
        <Route path="reports"    element={<Reports />} />
      </Route>
    </Routes>
  )
}