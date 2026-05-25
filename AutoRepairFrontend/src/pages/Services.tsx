import { useEffect, useState } from 'react'
import { servicesApi } from '../api'
import type { Service } from '../types'

const empty = { name: '', description: '', price: '', durationHours: '' }

export default function Services() {
  const [services, setServices] = useState<Service[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState<Service | null>(null)
  const [form,     setForm]     = useState(empty)

  const load = () => servicesApi.getAll().then(r => setServices(r.data))
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(empty); setShowForm(true) }
  const openEdit   = (s: Service) => {
    setEditing(s)
    setForm({ name: s.name, description: s.description ?? '', price: String(s.price), durationHours: String(s.durationHours ?? '') })
    setShowForm(true)
  }

  const save = async () => {
    const payload = { name: form.name, description: form.description || undefined,
                      price: Number(form.price), durationHours: form.durationHours ? Number(form.durationHours) : undefined }
    if (editing) await servicesApi.update(editing.id, payload)
    else         await servicesApi.create(payload)
    await load()
    setShowForm(false)
  }

  const remove = async (id: number) => {
    if (!confirm('Удалить услугу?')) return
    await servicesApi.delete(id)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Каталог услуг</h1>
          <p className="text-gray-500 text-sm mt-1">{services.length} услуг</p>
        </div>
        <button onClick={openCreate}
          className="bg-brand-500 hover:bg-brand-600 text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Добавить услугу
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(s => (
          <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-800 text-sm leading-tight">{s.name}</h3>
              <span className="ml-2 text-brand-600 font-bold text-sm whitespace-nowrap">
                {s.price.toLocaleString('ru-RU')} б.р.
              </span>
            </div>
            {s.description && <p className="text-xs text-gray-500 mb-3">{s.description}</p>}
            {s.durationHours && (
              <p className="text-xs text-gray-400 mb-3">⏱ {s.durationHours} ч.</p>
            )}
            <div className="flex gap-2">
              <button onClick={() => openEdit(s)}
                className="flex-1 text-xs px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                Изменить
              </button>
              <button onClick={() => remove(s.id)}
                className="flex-1 text-xs px-3 py-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-600 transition-colors">
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">
              {editing ? 'Редактировать услугу' : 'Новая услуга'}
            </h2>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Название *</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Описание</label>
              <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Цена (б.р.) *</label>
                <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Часов</label>
                <input type="number" step="0.5" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.durationHours} onChange={e => setForm(p => ({ ...p, durationHours: e.target.value }))} />
              </div>
            </div>
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