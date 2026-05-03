import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Главная' },
  { to: '/orders',    label: 'Заказы' },
  { to: '/clients',   label: 'Клиенты' },
  { to: '/vehicles',  label: 'Автомобили' },
  { to: '/employees', label: 'Сотрудники' },
  { to: '/services',  label: 'Услуги' },
  { to: '/reports',   label: 'Отчёты' },
]

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-slate-900 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-8 h-16">
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-2xl">🔧</span>
            <span className="text-white font-bold text-lg tracking-tight">AutoRepair</span>
          </div>
          <nav className="flex items-center gap-1 overflow-x-auto">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-brand-500 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}