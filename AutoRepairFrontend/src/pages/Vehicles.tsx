import { useEffect, useState } from 'react'
import { vehiclesApi, clientsApi } from '../api'
import type { Vehicle, Client } from '../types'

const empty = { clientId: 0, brand: '', model: '', year: '', licensePlate: '', vin: '' }

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [clients,  setClients]  = useState<Client[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState<Vehicle | null>(null)
  const [form,     setForm]     = useState(empty)

  const load = () => vehiclesApi.getAll().then(r => setVehicles(r.data))
  useEffect(() => {
    load()
    clientsApi.getAll().then(r => setClients(r.data))
  }, [])

  const openCreate = () => { setEditing(null); setForm(empty); setShowForm(true) }
  const openEdit   = (v: Vehicle) => {
    setEditing(v)
    setForm({ clientId: v.clientId, brand: v.brand, model: v.model,
              year: String(v.year ?? ''), licensePlate: v.licensePlate ?? '', vin: v.vin ?? '' })
    setShowForm(true)
  }

  const save = async () => {
    const payload = { ...form, clientId: Number(form.clientId), year: form.year ? Number(form.year) : undefined }
    if (editing) await vehiclesApi.update(editing.id, payload)
    else         await vehiclesApi.create(payload)
    await load()
    setShowForm(false)
  }

  const remove = async (id: number) => {
    if (!confirm('Удалить автомобиль?')) return
    await vehiclesApi.delete(id)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Автомобили</h1>
          <p className="text-gray-500 text-sm mt-1">{vehicles.length} транспортных средств</p>
        </div>
        <button onClick={openCreate}
          className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Добавить автомобиль
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Марка / Модель</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Клиент</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Год</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Гос. номер</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">VIN</th>
              <th className="py-3 px-4" />
            </tr>
          </thead>
          <tbody>
            {vehicles.map(v => (
              <tr key={v.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-medium text-gray-800">{v.brand} {v.model}</td>
                <td className="py-3 px-4 text-gray-600">{v.clientName}</td>
                <td className="py-3 px-4 text-gray-600">{v.year || '—'}</td>
                <td className="py-3 px-4 text-gray-600">{v.licensePlate || '—'}</td>
                <td className="py-3 px-4 text-gray-400 text-xs">{v.vin || '—'}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => openEdit(v)}
                      className="text-xs px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                      Изменить
                    </button>
                    <button onClick={() => remove(v.id)}
                      className="text-xs px-3 py-1 rounded-md bg-red-50 hover:bg-red-100 text-red-600 transition-colors">
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">
              {editing ? 'Редактировать автомобиль' : 'Новый автомобиль'}
            </h2>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Клиент *</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={form.clientId}
                onChange={e => setForm(p => ({ ...p, clientId: Number(e.target.value) }))}>
                <option value={0}>Выбрать клиента...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {([['brand','Марка *'],['model','Модель *'],['year','Год'],['licensePlate','Гос. номер'],['vin','VIN']] as const).map(([f, l]) => (
              <div key={f}>
                <label className="block text-sm text-gray-600 mb-1">{l}</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form[f]}
                  onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
                />
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={save}
                className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                Сохранить
              </button>
              <button onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-600 py-2 rounded-lg text-sm transition-colors">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}