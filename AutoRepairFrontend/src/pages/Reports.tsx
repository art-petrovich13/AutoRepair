import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import * as XLSX from 'xlsx'
import { Document, Packer, Paragraph, Table, TableRow, TableCell,
         HeadingLevel, TextRun, WidthType, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'
import { statisticsApi } from '../api'

const MONTHS = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек']
const STATUS_COLORS: Record<string, string> = {
  Pending: '#facc15', InProgress: '#3b82f6', Completed: '#22c55e', Cancelled: '#ef4444'
}
const STATUS_RU: Record<string, string> = {
  Pending: 'Ожидает', InProgress: 'В работе', Completed: 'Завершён', Cancelled: 'Отменён'
}
const CHART_COLORS = ['#f97316','#3b82f6','#22c55e','#a855f7','#ec4899']

interface RevenuePoint  { year: number; month: number; revenue: number; count: number }
interface StatusPoint   { status: string; count: number }
interface ServicePoint  { serviceName: string; count: number }
interface EmployeePoint { employeeName: string; count: number }
interface ExportRow     { id: number; client: string; vehicle: string; licensePlate: string;
                          employee: string; status: string; createdAt: string; totalAmount: number }

export default function Reports() {
  const [revenue,   setRevenue]   = useState<RevenuePoint[]>([])
  const [byStatus,  setByStatus]  = useState<StatusPoint[]>([])
  const [services,  setServices]  = useState<ServicePoint[]>([])
  const [byEmp,     setByEmp]     = useState<EmployeePoint[]>([])
  const [overview,  setOverview]  = useState<{ totalOrders: number; activeOrders: number; totalRevenue: number; totalClients: number } | null>(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      statisticsApi.getOverview().then(r => setOverview(r.data)),
      statisticsApi.getRevenueByMonth().then(r => setRevenue(r.data)),
      statisticsApi.getOrdersByStatus().then(r => setByStatus(r.data)),
      statisticsApi.getTopServices().then(r => setServices(r.data)),
      statisticsApi.getOrdersByEmployee().then(r => setByEmp(r.data)),
    ]).finally(() => setLoading(false))
  }, [])

  const revenueChartData = revenue.map(r => ({
    name: `${MONTHS[r.month - 1]} ${r.year}`,
    revenue: r.revenue,
    count: r.count
  }))

  const statusChartData = byStatus.map(s => ({
    name: STATUS_RU[s.status] ?? s.status,
    value: s.count,
    fill: STATUS_COLORS[s.status] ?? '#94a3b8'
  }))

  const exportToExcel = async () => {
    const exportData = await statisticsApi.getOrdersForExport()
    const rows: ExportRow[] = exportData.data

    const ws = XLSX.utils.json_to_sheet(rows.map(r => ({
      '№ Заказа':   r.id,
      'Клиент':     r.client,
      'Автомобиль': r.vehicle,
      'Гос. номер': r.licensePlate,
      'Мастер':     r.employee,
      'Статус':     STATUS_RU[r.status] ?? r.status,
      'Дата':       new Date(r.createdAt).toLocaleDateString('ru-RU'),
      'Сумма (₽)':  r.totalAmount,
    })))

    ws['!cols'] = [8, 20, 16, 14, 20, 12, 12, 12].map(w => ({ wch: w }))

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Заказы')

    const summary = XLSX.utils.aoa_to_sheet([
      ['Сводка по заказам', ''],
      ['Всего заказов',    overview?.totalOrders ?? 0],
      ['Активных',         overview?.activeOrders ?? 0],
      ['Клиентов',         overview?.totalClients ?? 0],
      ['Выручка (₽)',      overview?.totalRevenue ?? 0],
    ])
    XLSX.utils.book_append_sheet(wb, summary, 'Сводка')

    XLSX.writeFile(wb, `autorepair_report_${new Date().toISOString().slice(0,10)}.xlsx`)
  }

  const exportToWord = async () => {
    const exportData = await statisticsApi.getOrdersForExport()
    const rows: ExportRow[] = exportData.data

    const headerRow = new TableRow({
      children: ['№', 'Клиент', 'Автомобиль', 'Мастер', 'Статус', 'Дата', 'Сумма'].map(text =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
          width: { size: 14, type: WidthType.PERCENTAGE }
        })
      )
    })

    const dataRows = rows.slice(0, 50).map(r =>
      new TableRow({
        children: [
          String(r.id),
          r.client,
          r.vehicle,
          r.employee,
          STATUS_RU[r.status] ?? r.status,
          new Date(r.createdAt).toLocaleDateString('ru-RU'),
          `${r.totalAmount.toLocaleString('ru-RU')} ₽`
        ].map(text =>
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text, size: 20 })] })],
            width: { size: 14, type: WidthType.PERCENTAGE }
          })
        )
      })
    )

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            text: 'Отчёт по заказам — AutoRepair',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: `Дата формирования: ${new Date().toLocaleDateString('ru-RU')}`, size: 22 })],
            spacing: { after: 200 }
          }),
          new Paragraph({ text: 'Сводка', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ children: [new TextRun({ text: `Всего заказов: ${overview?.totalOrders ?? 0}`, size: 22 })] }),
          new Paragraph({ children: [new TextRun({ text: `Активных: ${overview?.activeOrders ?? 0}`, size: 22 })] }),
          new Paragraph({ children: [new TextRun({ text: `Клиентов: ${overview?.totalClients ?? 0}`, size: 22 })] }),
          new Paragraph({
            children: [new TextRun({ text: `Выручка: ${overview?.totalRevenue?.toLocaleString('ru-RU') ?? 0} ₽`, size: 22 })],
            spacing: { after: 300 }
          }),
          new Paragraph({ text: 'Список заказов', heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }),
          new Table({
            rows: [headerRow, ...dataRows],
            width: { size: 100, type: WidthType.PERCENTAGE }
          }),
        ]
      }]
    })

    const blob = await Packer.toBlob(doc)
    saveAs(blob, `autorepair_report_${new Date().toISOString().slice(0,10)}.docx`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm">Загрузка данных...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Аналитика и отчёты</h1>
          <p className="text-gray-500 text-sm mt-1">Статистика по работе автосервиса</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportToExcel}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            <span>📊</span> Экспорт в Excel
          </button>
          <button onClick={exportToWord}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            <span>📄</span> Экспорт в Word
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Всего заказов',    val: overview?.totalOrders,   icon: '📋', color: 'text-slate-700' },
          { label: 'Активных заказов', val: overview?.activeOrders,  icon: '⚙️', color: 'text-blue-600' },
          { label: 'Клиентов',         val: overview?.totalClients,  icon: '👥', color: 'text-purple-600' },
          { label: 'Выручка (₽)',      val: overview ? `${overview.totalRevenue.toLocaleString('ru-RU')}` : '—', icon: '💰', color: 'text-emerald-600' },
        ].map(({ label, val, icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
              <span className="text-xl">{icon}</span>
            </div>
            <p className={`text-3xl font-bold ${color}`}>{val ?? '—'}</p>
          </div>
        ))}
      </div>

      {/* Выручка по месяцам */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-1">Выручка по месяцам</h2>
        <p className="text-xs text-gray-400 mb-5">За последние 6 месяцев</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={revenueChartData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                   tickFormatter={v => `${(v/1000).toFixed(0)}к`} />
            <Tooltip formatter={(value: any) => [`${(value ?? 0).toLocaleString('ru-RU')} ₽`, 'Выручка']}
                     contentStyle={{ borderRadius: 8, border: '1px solid #f1f5f9', fontSize: 12 }} />
            <Bar dataKey="revenue" fill="#f97316" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Статусы */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-5">Заказы по статусам</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusChartData} dataKey="value" nameKey="name"
                   cx="50%" cy="50%" outerRadius={80} paddingAngle={3}>
                {statusChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Legend iconType="circle" iconSize={10}
                      formatter={(v: string) => <span className="text-sm text-gray-600">{v}</span>} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #f1f5f9', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Топ услуг */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">Популярные услуги</h2>
          <p className="text-xs text-gray-400 mb-5">Топ-5 по количеству применений</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={services} layout="vertical" margin={{ left: 0, right: 10 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="serviceName" width={150}
                     tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #f1f5f9', fontSize: 12 }} />
              <Bar dataKey="count" radius={[0,6,6,0]}>
                {services.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Заказы по сотрудникам */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-1">Заказы по сотрудникам</h2>
        <p className="text-xs text-gray-400 mb-5">Количество заказов у каждого мастера</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byEmp} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
            <XAxis dataKey="employeeName" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #f1f5f9', fontSize: 12 }} />
            <Bar dataKey="count" radius={[6,6,0,0]}>
              {byEmp.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}