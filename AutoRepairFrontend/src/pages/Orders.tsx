import { useEffect, useState } from 'react'
import { ordersApi, vehiclesApi, employeesApi, servicesApi } from '../api'
import type { Order, Vehicle, Employee, Service } from '../types'

const statusLabel: Record<string, { label: string; cls: string }> = {
  Pending:    { label: 'Ожидает',   cls: 'bg-yellow-100 text-yellow-800' },
  InProgress: { label: 'В работе',  cls: 'bg-blue-100 text-blue-800' },
  Completed:  { label: 'Завершён',  cls: 'bg-green-100 text-green-800' },
  Cancelled:  { label: 'Отменён',   cls: 'bg-red-100 text-red-800' },
}

interface OrderForm {
  vehicleId: number
  employeeId: number
  notes: string
  services: { serviceId: number; quantity: number; price: number }[]
  parts: { name: string; quantity: number; unitPrice: number }[]
}

const emptyForm: OrderForm = {
  vehicleId: 0, employeeId: 0, notes: '',
  services: [], parts: []
}

export default function Orders() {
  const [orders,    setOrders]    = useState<Order[]>([])
  const [vehicles,  setVehicles]  = useState<Vehicle[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [services,  setServices]  = useState<Service[]>([])
  const [showForm,  setShowForm]  = useState(false)
  const [detail,    setDetail]    = useState<Order | null>(null)
  const [form,      setForm]      = useState<OrderForm>(emptyForm)

  const load = () => ordersApi.getAll().then(r => setOrders(r.data))

  useEffect(() => {
    load()
    vehiclesApi.getAll().then(r => setVehicles(r.data))
    employeesApi.getAll().then(r => setEmployees(r.data))
    servicesApi.getAll().then(r => setServices(r.data))
  }, [])

  const addService = (svc: Service) => {
    setForm(p => ({ ...p, services: [...p.services, { serviceId: svc.id, quantity: 1, price: svc.price }] }))
  }

  const removeService = (idx: number) => {
    setForm(p => ({ ...p, services: p.services.filter((_, i) => i !== idx) }))
  }

  const addPart = () => {
    setForm(p => ({ ...p, parts: [...p.parts, { name: '', quantity: 1, unitPrice: 0 }] }))
  }

  const removePart = (idx: number) => {
    setForm(p => ({ ...p, parts: p.parts.filter((_, i) => i !== idx) }))
  }

  const updatePart = (idx: number, field: string, value: string) => {
    setForm(p => ({
      ...p,
      parts: p.parts.map((pt, i) => i === idx ? { ...pt, [field]: field === 'name' ? value : Number(value) } : pt)
    }))
  }

  const total = form.services.reduce((s, x) => s + x.price * x.quantity, 0)
             + form.parts.reduce((s, x) => s + x.unitPrice * x.quantity, 0)

  const save = async () => {
    await ordersApi.create({ vehicleId: form.vehicleId, employeeId: form.employeeId,
                              notes: form.notes, services: form.services, parts: form.parts })
    await load()
    setShowForm(false)
    setForm(emptyForm)
  }

  const changeStatus = async (id: number, status: string) => {
    await ordersApi.updateStatus(id, status)
    load()
  }

  const remove = async (id: number) => {
    if (!confirm('Удалить заказ?')) return
    await ordersApi.delete(id)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Заказы</h1>
          <p className="text-gray-500 text-sm mt-1">{orders.length} заказов</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setShowForm(true) }}
          className="bg-brand-500 hover:bg-brand-600 text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Новый заказ
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">№</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Клиент / Авто</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Мастер</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Статус</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Дата</th>
              <th className="text-right py-3 px-4 text-gray-500 font-medium">Сумма</th>
              <th className="py-3 px-4" />
            </tr>
          </thead>
          <tbody>
            {orders.map(o => {
              const s = statusLabel[o.status]
              return (
                <tr key={o.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-gray-400">#{o.id}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-800">{o.clientName}</p>
                    <p className="text-xs text-gray-400">{o.vehicleInfo}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{o.employeeName}</td>
                  <td className="py-3 px-4">
                    <select
                      value={o.status}
                      onChange={e => changeStatus(o.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${s.cls}`}
                    >
                      {Object.entries(statusLabel).map(([v, { label }]) => (
                        <option key={v} value={v}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-gray-400 text-xs">
                    {new Date(o.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-gray-800">
                    {o.totalAmount.toLocaleString('ru-RU')} б.р.
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => setDetail(o)}
                        className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                        Детали
                      </button>
                      <button onClick={() => remove(o.id)}
                        className="text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 transition-colors">
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Создание заказа */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <h2 className="text-lg font-bold text-gray-900">Новый заказ</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Автомобиль *</label>
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.vehicleId}
                  onChange={e => setForm(p => ({ ...p, vehicleId: Number(e.target.value) }))}>
                  <option value={0}>Выбрать...</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model} — {v.clientName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Мастер *</label>
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.employeeId}
                  onChange={e => setForm(p => ({ ...p, employeeId: Number(e.target.value) }))}>
                  <option value={0}>Выбрать...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Заметки</label>
              <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </div>

            {/* Услуги */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Услуги</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {services.filter(s => !form.services.find(x => x.serviceId === s.id)).map(s => (
                  <button key={s.id} onClick={() => addService(s)}
                    className="text-xs px-3 py-1.5 rounded-full border border-gray-200 hover:border-brand-500 hover:text-brand-600 transition-colors">
                    + {s.name} ({s.price.toLocaleString('ru-RU')} б.р.)
                  </button>
                ))}
              </div>
              {form.services.map((item, i) => {
                const svc = services.find(s => s.id === item.serviceId)
                return (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 mb-2">
                    <span className="flex-1 text-sm text-gray-700">{svc?.name}</span>
                    <span className="text-sm text-gray-500">{item.price.toLocaleString('ru-RU')} б.р.</span>
                    <button onClick={() => removeService(i)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
                  </div>
                )
              })}
            </div>

            {/* Запчасти */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Запчасти</p>
                <button onClick={addPart} className="text-xs text-brand-600 hover:underline">+ Добавить</button>
              </div>
              {form.parts.map((pt, i) => (
                <div key={i} className="grid grid-cols-5 gap-2 mb-2">
                  <input placeholder="Название" className="col-span-2 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                    value={pt.name} onChange={e => updatePart(i, 'name', e.target.value)} />
                  <input type="number" placeholder="Кол." className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                    value={pt.quantity} onChange={e => updatePart(i, 'quantity', e.target.value)} />
                  <input type="number" placeholder="Цена б.р." className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                    value={pt.unitPrice || ''} onChange={e => updatePart(i, 'unitPrice', e.target.value)} />
                  <button onClick={() => removePart(i)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="font-semibold text-gray-800">Итого: {total.toLocaleString('ru-RU')} б.р.</span>
              <div className="flex gap-3">
                <button onClick={() => setShowForm(false)}
                  className="border border-gray-200 hover:bg-gray-50 text-gray-600 px-4 py-2 rounded-lg text-sm transition-colors">
                  Отмена
                </button>
                <button onClick={save}
                  className="bg-brand-500 hover:bg-brand-600 text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Создать заказ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Детали заказа */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Заказ #{detail.id}</h2>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="space-y-1 text-sm">
              <p><span className="text-gray-500">Клиент:</span> <span className="font-medium">{detail.clientName}</span></p>
              <p><span className="text-gray-500">Автомобиль:</span> {detail.vehicleInfo}</p>
              <p><span className="text-gray-500">Мастер:</span> {detail.employeeName}</p>
              <p><span className="text-gray-500">Дата:</span> {new Date(detail.createdAt).toLocaleDateString('ru-RU')}</p>
              {detail.notes && <p><span className="text-gray-500">Заметки:</span> {detail.notes}</p>}
            </div>
            {detail.orderServices.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Услуги</p>
                {detail.orderServices.map(s => (
                  <div key={s.id} className="flex justify-between text-sm py-1 border-b border-gray-50">
                    <span>{s.serviceName} × {s.quantity}</span>
                    <span className="font-medium">{(s.price * s.quantity).toLocaleString('ru-RU')} б.р.</span>
                  </div>
                ))}
              </div>
            )}
            {detail.spareParts.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Запчасти</p>
                {detail.spareParts.map(p => (
                  <div key={p.id} className="flex justify-between text-sm py-1 border-b border-gray-50">
                    <span>{p.name} × {p.quantity}</span>
                    <span className="font-medium">{(p.unitPrice * p.quantity).toLocaleString('ru-RU')} б.р.</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-gray-500 text-sm">Итого</span>
              <span className="text-xl font-bold text-brand-600">{detail.totalAmount.toLocaleString('ru-RU')} б.р.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}