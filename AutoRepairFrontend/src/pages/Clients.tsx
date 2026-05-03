import { useEffect, useState } from 'react'
import { clientsApi } from '../api'
import type { Client } from '../types'

const empty = { name: '', phone: '', email: '' }

export default function Clients() {
  const [clients,  setClients]  = useState<Client[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState<Client | null>(null)
  const [form,     setForm]     = useState(empty)

  const load = () => clientsApi.getAll().then(r => setClients(r.data))
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(empty); setShowForm(true) }
  const openEdit   = (c: Client) => { setEditing(c); setForm({ name: c.name, phone: c.phone ?? '', email: c.email ?? '' }); setShowForm(true) }
  const close      = () => setShowForm(false)

  const save = async () => {
    if (editing) await clientsApi.update(editing.id, form)
    else         await clientsApi.create(form)
    await load()
    close()
  }

  const remove = async (id: number) => {
    if (!confirm('Удалить клиента?')) return
    await clientsApi.delete(id)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Клиенты</h1>
          <p className="text-gray-500 text-sm mt-1">{clients.length} клиентов в базе</p>
        </div>
        <button onClick={openCreate}
          className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Добавить клиента
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Имя</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Телефон</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Email</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Авто</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Добавлен</th>
              <th className="py-3 px-4" />
            </tr>
          </thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-medium text-gray-800">{c.name}</td>
                <td className="py-3 px-4 text-gray-600">{c.phone || '—'}</td>
                <td className="py-3 px-4 text-gray-600">{c.email || '—'}</td>
                <td className="py-3 px-4 text-gray-600">{c.vehicleCount}</td>
                <td className="py-3 px-4 text-gray-400">
                  {new Date(c.createdAt).toLocaleDateString('ru-RU')}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => openEdit(c)}
                      className="text-xs px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                      Изменить
                    </button>
                    <button onClick={() => remove(c.id)}
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
              {editing ? 'Редактировать клиента' : 'Новый клиент'}
            </h2>
            {(['name', 'phone', 'email'] as const).map(field => (
              <div key={field}>
                <label className="block text-sm text-gray-600 mb-1 capitalize">{
                  { name: 'Имя *', phone: 'Телефон', email: 'Email' }[field]
                }</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form[field]}
                  onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                />
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={save}
                className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                Сохранить
              </button>
              <button onClick={close}
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