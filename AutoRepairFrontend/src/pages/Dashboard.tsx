import { useEffect, useState } from 'react'
import { statisticsApi, ordersApi } from '../api'
import type { Overview, Order } from '../types'

const statusLabel: Record<string, { label: string; cls: string }> = {
  Pending:    { label: 'Ожидает',   cls: 'bg-yellow-100 text-yellow-800' },
  InProgress: { label: 'В работе',  cls: 'bg-blue-100 text-blue-800' },
  Completed:  { label: 'Завершён',  cls: 'bg-green-100 text-green-800' },
  Cancelled:  { label: 'Отменён',   cls: 'bg-red-100 text-red-800' },
}

function StatCard({ label, value, icon, sub }: { label: string; value: string; icon: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500 font-medium">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [recent,   setRecent]   = useState<Order[]>([])

  useEffect(() => {
    statisticsApi.getOverview().then(r => setOverview(r.data))
    ordersApi.getAll().then(r => setRecent(r.data.slice(0, 6)))
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Панель управления</h1>
        <p className="text-gray-500 text-sm mt-1">Обзор текущего состояния автосервиса</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Всего заказов"    value={String(overview?.totalOrders ?? '—')}  icon="📋" />
        <StatCard label="Активных заказов" value={String(overview?.activeOrders ?? '—')} icon="⚙️" sub="В работе и ожидают" />
        <StatCard label="Клиентов"         value={String(overview?.totalClients ?? '—')} icon="👥" />
        <StatCard
          label="Выручка (завершённые)"
          value={overview ? `${overview.totalRevenue.toLocaleString('ru-RU')} б.р.` : '—'}
          icon="💰"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Последние заказы</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">№</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Клиент</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Автомобиль</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Мастер</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Статус</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(order => {
                const s = statusLabel[order.status]
                return (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 text-gray-400">#{order.id}</td>
                    <td className="py-3 px-3 font-medium text-gray-800">{order.clientName}</td>
                    <td className="py-3 px-3 text-gray-600">{order.vehicleInfo}</td>
                    <td className="py-3 px-3 text-gray-600">{order.employeeName}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-gray-800">
                      {order.totalAmount.toLocaleString('ru-RU')} б.р.
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}