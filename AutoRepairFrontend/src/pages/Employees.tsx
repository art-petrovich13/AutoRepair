import { useEffect, useState } from 'react'
import { employeesApi } from '../api'
import type { Employee } from '../types'

const empty = { name: '', position: '', phone: '', hireDate: '' }

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [showForm,  setShowForm]  = useState(false)
  const [editing,   setEditing]   = useState<Employee | null>(null)
  const [form,      setForm]      = useState(empty)

  const load = () => employeesApi.getAll().then(r => setEmployees(r.data))
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(empty); setShowForm(true) }
  const openEdit   = (e: Employee) => {
    setEditing(e)
    setForm({ name: e.name, position: e.position ?? '', phone: e.phone ?? '', hireDate: e.hireDate })
    setShowForm(true)
  }

  const save = async () => {
    const payload = { ...form, hireDate: form.hireDate }
    if (editing) await employeesApi.update(editing.id, payload)
    else         await employeesApi.create(payload)
    await load()
    setShowForm(false)
  }

  const remove = async (id: number) => {
    if (!confirm('Удалить сотрудника?')) return
    await employeesApi.delete(id)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Сотрудники</h1>
          <p className="text-gray-500 text-sm mt-1">{employees.length} сотрудников</p>
        </div>
        <button onClick={openCreate}
          className="bg-brand-500 hover:bg-brand-600 text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Добавить сотрудника
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map(e => (
          <div key={e.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm">
                {e.name.split(' ').map(n => n[0]).slice(0,2).join('')}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{e.name}</p>
                <p className="text-xs text-gray-500">{e.position || '—'}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1">📞 {e.phone || '—'}</p>
            <p className="text-xs text-gray-400">
              Работает с {new Date(e.hireDate).toLocaleDateString('ru-RU')}
            </p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => openEdit(e)}
                className="flex-1 text-xs px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                Изменить
              </button>
              <button onClick={() => remove(e.id)}
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
              {editing ? 'Редактировать сотрудника' : 'Новый сотрудник'}
            </h2>
            {([['name','Имя *'],['position','Должность'],['phone','Телефон'],['hireDate','Дата приёма']] as const).map(([f, l]) => (
              <div key={f}>
                <label className="block text-sm text-gray-600 mb-1">{l}</label>
                <input
                  type={f === 'hireDate' ? 'date' : 'text'}
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