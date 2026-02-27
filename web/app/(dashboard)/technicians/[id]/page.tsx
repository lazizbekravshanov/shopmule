'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Edit2,
  UserX,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  MapPin,
  Shield,
  Clock,
  Wrench,
  Zap,
  TrendingUp,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Award,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
  useAddCertification,
  useRemoveCertification,
  useEmployeePerformance,
} from '@/lib/queries/employees'
import { useEmployeePayroll, useDeductions, useLoans } from '@/lib/queries/payroll'
import { cn, formatCurrency } from '@/lib/utils'

export default function TechnicianDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { data: employee, isLoading } = useEmployee(id)
  const [performancePeriod, setPerformancePeriod] = useState('month')
  const { data: performance } = useEmployeePerformance(id, performancePeriod)
  const { data: payroll } = useEmployeePayroll(id, 'month')
  const { data: deductionsList } = useDeductions(id)
  const { data: loansList } = useLoans(id)
  const updateEmployee = useUpdateEmployee()
  const deleteEmployee = useDeleteEmployee()
  const addCert = useAddCertification()
  const removeCert = useRemoveCertification()

  const [editOpen, setEditOpen] = useState(false)
  const [certOpen, setCertOpen] = useState(false)
  const [deactivateOpen, setDeactivateOpen] = useState(false)

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    phoneNumber: '',
    payRate: '',
    payType: 'HOURLY',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    notes: '',
  })

  // Cert form state
  const [certForm, setCertForm] = useState({
    name: '',
    issuingOrg: '',
    certNumber: '',
    level: '',
    issuedDate: '',
    expiryDate: '',
  })

  const openEdit = () => {
    if (!employee) return
    setEditForm({
      name: employee.name,
      phoneNumber: employee.phoneNumber || '',
      payRate: String(employee.payRate),
      payType: employee.payType || 'HOURLY',
      address: employee.address || '',
      emergencyContact: employee.emergencyContact || '',
      emergencyPhone: employee.emergencyPhone || '',
      notes: employee.notes || '',
    })
    setEditOpen(true)
  }

  const handleUpdate = () => {
    updateEmployee.mutate(
      {
        id,
        data: {
          name: editForm.name,
          phoneNumber: editForm.phoneNumber || null,
          payRate: parseFloat(editForm.payRate),
          payType: editForm.payType,
          address: editForm.address || null,
          emergencyContact: editForm.emergencyContact || null,
          emergencyPhone: editForm.emergencyPhone || null,
          notes: editForm.notes || null,
        } as any,
      },
      { onSuccess: () => setEditOpen(false) }
    )
  }

  const handleDeactivate = () => {
    deleteEmployee.mutate(id, {
      onSuccess: () => {
        setDeactivateOpen(false)
        router.push('/technicians')
      },
    })
  }

  const handleAddCert = () => {
    if (!certForm.name) return
    addCert.mutate(
      {
        employeeId: id,
        data: {
          name: certForm.name,
          issuingOrg: certForm.issuingOrg || null,
          certNumber: certForm.certNumber || null,
          level: certForm.level || null,
          issuedDate: certForm.issuedDate || null,
          expiryDate: certForm.expiryDate || null,
        },
      },
      {
        onSuccess: () => {
          setCertOpen(false)
          setCertForm({ name: '', issuingOrg: '', certNumber: '', level: '', issuedDate: '', expiryDate: '' })
        },
      }
    )
  }

  const handleRemoveCert = (certId: string) => {
    removeCert.mutate({ employeeId: id, certId })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-900">Technician not found</h3>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push('/technicians')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Technicians
        </Button>
      </div>
    )
  }

  const initials = employee.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const stats = employee.stats || {
    todayHours: 0,
    weekHours: 0,
    jobsCompleted: 0,
    billableEfficiency: 0,
    revenueGenerated: 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push('/technicians')}
          className="text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Technicians
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={openEdit} className="border-neutral-200">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => setDeactivateOpen(true)}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            <UserX className="w-4 h-4 mr-2" />
            Deactivate
          </Button>
        </div>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-neutral-200 rounded-xl p-6"
      >
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ee7a14] to-[#d96a0a] flex items-center justify-center text-white font-bold text-2xl shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-semibold text-neutral-900">{employee.name}</h1>
              <Badge
                variant={employee.status === 'active' ? 'default' : 'secondary'}
                className={
                  employee.status === 'active'
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-neutral-100 text-neutral-500'
                }
              >
                {employee.status}
              </Badge>
            </div>
            <p className="text-neutral-500 mb-4">
              {employee.role.replace('_', ' ')}
              {employee.specializations && employee.specializations.length > 0 && (
                <span className="ml-2 text-neutral-400">
                  &middot; {employee.specializations.join(', ')}
                </span>
              )}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {employee.email && (
                <div className="flex items-center gap-2 text-neutral-600">
                  <Mail className="w-4 h-4 text-neutral-400" />
                  <span className="truncate">{employee.email}</span>
                </div>
              )}
              {employee.phoneNumber && (
                <div className="flex items-center gap-2 text-neutral-600">
                  <Phone className="w-4 h-4 text-neutral-400" />
                  <span>{employee.phoneNumber}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-neutral-600">
                <DollarSign className="w-4 h-4 text-neutral-400" />
                <span>
                  ${employee.payRate}/hr
                  {employee.payType && employee.payType !== 'HOURLY' && (
                    <span className="text-neutral-400 ml-1">({employee.payType.replace('_', ' ').toLowerCase()})</span>
                  )}
                </span>
              </div>
              {employee.hireDate && (
                <div className="flex items-center gap-2 text-neutral-600">
                  <Calendar className="w-4 h-4 text-neutral-400" />
                  <span>Hired {new Date(employee.hireDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Performance Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-neutral-200 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <Zap className="h-4 w-4" />
            <span className="text-sm">Efficiency</span>
          </div>
          <div className="text-2xl font-bold text-neutral-900">{stats.billableEfficiency}%</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white border border-neutral-200 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Hours This Week</span>
          </div>
          <div className="text-2xl font-bold text-neutral-900">{stats.weekHours}h</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-neutral-200 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <Wrench className="h-4 w-4" />
            <span className="text-sm">Jobs This Month</span>
          </div>
          <div className="text-2xl font-bold text-neutral-900">{stats.jobsCompleted}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white border border-neutral-200 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm">Revenue</span>
          </div>
          <div className="text-2xl font-bold text-neutral-900">
            ${stats.revenueGenerated.toLocaleString()}
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-neutral-100 border border-neutral-200">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="timelog">Time Log</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Performance Chart */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-neutral-900">Hours Breakdown</h3>
              <Select value={performancePeriod} onValueChange={setPerformancePeriod}>
                <SelectTrigger className="w-[120px] border-neutral-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {performance?.dailyBreakdown && performance.dailyBreakdown.length > 0 ? (
              <div className="space-y-4">
                {/* Summary stats */}
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-neutral-500">Total Hours</p>
                    <p className="font-semibold text-neutral-900">{performance.totalWorkHours}h</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Billable</p>
                    <p className="font-semibold text-neutral-900">{performance.billableHours}h</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Efficiency</p>
                    <p className="font-semibold text-neutral-900">{performance.billableEfficiency}%</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Revenue</p>
                    <p className="font-semibold text-neutral-900">
                      ${performance.revenueGenerated.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Simple bar chart */}
                <div className="flex items-end gap-1 h-32">
                  {performance.dailyBreakdown.slice(-14).map((day) => {
                    const maxHours = Math.max(...performance.dailyBreakdown.map((d) => d.hours), 1)
                    const height = (day.hours / maxHours) * 100
                    return (
                      <div
                        key={day.date}
                        className="flex-1 flex flex-col items-center gap-1"
                      >
                        <div
                          className="w-full bg-[#ee7a14] rounded-t-sm min-h-[2px] transition-all"
                          style={{ height: `${height}%` }}
                          title={`${day.date}: ${day.hours}h`}
                        />
                        <span className="text-[9px] text-neutral-400 truncate w-full text-center">
                          {new Date(day.date + 'T12:00:00').toLocaleDateString('en', { weekday: 'narrow' })}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <p className="text-neutral-500 text-sm py-8 text-center">
                No hours data for this period
              </p>
            )}
          </div>

          {/* Recent Work Orders */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6">
            <h3 className="font-semibold text-neutral-900 mb-4">Recent Work Orders</h3>
            {employee.recentWorkOrders && employee.recentWorkOrders.length > 0 ? (
              <div className="space-y-3">
                {employee.recentWorkOrders.map((wo) => (
                  <div
                    key={wo.id}
                    onClick={() => router.push(`/work-orders/${wo.id}`)}
                    className="flex items-center justify-between p-3 border border-neutral-100 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {wo.description}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {wo.workOrderNumber}
                        {wo.vehicle && (
                          <span>
                            {' '}
                            &middot; {wo.vehicle.year} {wo.vehicle.make} {wo.vehicle.model}
                            {wo.vehicle.unitNumber && ` (${wo.vehicle.unitNumber})`}
                          </span>
                        )}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-xs shrink-0',
                        wo.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-700'
                          : wo.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-neutral-100 text-neutral-600'
                      )}
                    >
                      {wo.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-sm py-4 text-center">
                No recent work orders
              </p>
            )}
          </div>

          {/* Details section */}
          {(employee.address || employee.emergencyContact || employee.notes) && (
            <div className="bg-white border border-neutral-200 rounded-xl p-6">
              <h3 className="font-semibold text-neutral-900 mb-4">Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {employee.address && (
                  <div>
                    <p className="text-neutral-500 mb-1">Address</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-neutral-400 mt-0.5" />
                      <p className="text-neutral-900">{employee.address}</p>
                    </div>
                  </div>
                )}
                {employee.emergencyContact && (
                  <div>
                    <p className="text-neutral-500 mb-1">Emergency Contact</p>
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-neutral-400 mt-0.5" />
                      <div>
                        <p className="text-neutral-900">{employee.emergencyContact}</p>
                        {employee.emergencyPhone && (
                          <p className="text-neutral-500">{employee.emergencyPhone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {employee.notes && (
                  <div className="md:col-span-2">
                    <p className="text-neutral-500 mb-1">Notes</p>
                    <p className="text-neutral-900">{employee.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Payroll Tab */}
        <TabsContent value="payroll" className="space-y-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-neutral-900">Current Period Pay Summary</h3>
              <Button
                variant="outline"
                size="sm"
                className="border-neutral-200"
                onClick={() => router.push(`/payroll/${id}`)}
              >
                View Full Payroll
              </Button>
            </div>
            {payroll ? (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-500">Gross Pay</p>
                  <p className="text-xl font-bold text-neutral-900">{formatCurrency(payroll.pay.grossPay)}</p>
                </div>
                <div className="text-center p-4 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-500">Deductions</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(payroll.pay.totalDeductions + payroll.pay.loanRepayments)}
                  </p>
                </div>
                <div className="text-center p-4 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-500">Net Pay</p>
                  <p className="text-xl font-bold text-emerald-600">{formatCurrency(payroll.pay.netPay)}</p>
                </div>
              </div>
            ) : (
              <p className="text-neutral-400 text-sm text-center py-4">No payroll data available</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-neutral-200 rounded-xl p-6">
              <h3 className="font-semibold text-neutral-900 mb-3">Active Deductions</h3>
              <p className="text-3xl font-bold text-neutral-900">
                {(deductionsList ?? []).filter((d) => d.isActive).length}
              </p>
              <p className="text-sm text-neutral-400 mt-1">configured deductions</p>
            </div>
            <div className="bg-white border border-neutral-200 rounded-xl p-6">
              <h3 className="font-semibold text-neutral-900 mb-3">Active Loans</h3>
              {(loansList ?? []).filter((l) => l.isActive).length > 0 ? (
                <>
                  <p className="text-3xl font-bold text-neutral-900">
                    {formatCurrency(
                      (loansList ?? []).filter((l) => l.isActive).reduce((sum, l) => sum + l.remainingBalance, 0)
                    )}
                  </p>
                  <p className="text-sm text-neutral-400 mt-1">
                    {(loansList ?? []).filter((l) => l.isActive).length} active loan(s) remaining
                  </p>
                </>
              ) : (
                <p className="text-neutral-400 text-sm">No active loans</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="space-y-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-neutral-900">Certifications</h3>
              <Button
                onClick={() => setCertOpen(true)}
                className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Certification
              </Button>
            </div>

            {employee.certifications && employee.certifications.length > 0 ? (
              <div className="space-y-3">
                {employee.certifications.map((cert) => {
                  const isExpired = cert.expiryDate && new Date(cert.expiryDate) < new Date()
                  const expiresSoon =
                    cert.expiryDate &&
                    !isExpired &&
                    new Date(cert.expiryDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)

                  return (
                    <div
                      key={cert.id}
                      className={cn(
                        'flex items-center justify-between p-4 border rounded-lg',
                        isExpired
                          ? 'border-red-200 bg-red-50'
                          : expiresSoon
                          ? 'border-amber-200 bg-amber-50'
                          : 'border-neutral-200'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Award
                          className={cn(
                            'w-5 h-5',
                            isExpired ? 'text-red-500' : expiresSoon ? 'text-amber-500' : 'text-purple-500'
                          )}
                        />
                        <div>
                          <p className="font-medium text-neutral-900">{cert.name}</p>
                          <div className="flex items-center gap-2 text-xs text-neutral-500">
                            {cert.issuingOrg && <span>{cert.issuingOrg}</span>}
                            {cert.certNumber && <span>&middot; #{cert.certNumber}</span>}
                            {cert.level && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {cert.level}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {cert.expiryDate && (
                          <div className="text-right text-xs">
                            <p className="text-neutral-500">Expires</p>
                            <p
                              className={cn(
                                'font-medium',
                                isExpired ? 'text-red-600' : expiresSoon ? 'text-amber-600' : 'text-neutral-900'
                              )}
                            >
                              {new Date(cert.expiryDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {isExpired && (
                          <Badge className="bg-red-100 text-red-700 border-red-200">Expired</Badge>
                        )}
                        {expiresSoon && !isExpired && (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                            Expiring
                          </Badge>
                        )}
                        <button
                          onClick={() => handleRemoveCert(cert.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500 text-sm">No certifications yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setCertOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Certification
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Time Log Tab */}
        <TabsContent value="timelog" className="space-y-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-6">
            <h3 className="font-semibold text-neutral-900 mb-4">This Week&apos;s Hours</h3>
            {performance?.dailyBreakdown ? (
              <div className="space-y-2">
                {performance.dailyBreakdown.slice(-7).map((day) => (
                  <div
                    key={day.date}
                    className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0"
                  >
                    <span className="text-sm text-neutral-700">
                      {new Date(day.date + 'T12:00:00').toLocaleDateString('en', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#ee7a14] rounded-full"
                          style={{ width: `${Math.min(100, (day.hours / 10) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-neutral-900 w-12 text-right">
                        {day.hours}h
                      </span>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
                  <span className="text-sm font-semibold text-neutral-900">Total</span>
                  <span className="text-sm font-semibold text-neutral-900">
                    {performance.totalWorkHours}h
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-neutral-500 text-sm py-4 text-center">
                No time data available
              </p>
            )}
          </div>

          {performance && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border border-neutral-200 rounded-xl p-4 text-center">
                <p className="text-sm text-neutral-500">Overtime</p>
                <p className="text-xl font-bold text-neutral-900">{performance.overtimeHours}h</p>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-4 text-center">
                <p className="text-sm text-neutral-500">Avg Job Time</p>
                <p className="text-xl font-bold text-neutral-900">{performance.avgJobTime}h</p>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-4 text-center">
                <p className="text-sm text-neutral-500">Jobs Done</p>
                <p className="text-xl font-bold text-neutral-900">{performance.jobsCompleted}</p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-6">
            <h3 className="font-semibold text-neutral-900 mb-4">Work Order History</h3>
            {employee.recentWorkOrders && employee.recentWorkOrders.length > 0 ? (
              <div className="space-y-2">
                {employee.recentWorkOrders.map((wo) => (
                  <div
                    key={wo.id}
                    onClick={() => router.push(`/work-orders/${wo.id}`)}
                    className="flex items-center justify-between p-3 border border-neutral-100 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-neutral-400">
                          {wo.workOrderNumber}
                        </span>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-[10px]',
                            wo.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-700'
                              : wo.status === 'IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-neutral-100 text-neutral-600'
                          )}
                        >
                          {wo.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-neutral-900 mt-1 truncate">{wo.description}</p>
                      {wo.vehicle && (
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {wo.vehicle.year} {wo.vehicle.make} {wo.vehicle.model}
                          {wo.vehicle.unitNumber && ` (${wo.vehicle.unitNumber})`}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-neutral-400 shrink-0 ml-4">
                      {new Date(wo.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-sm py-8 text-center">
                No work order history
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[500px] border-neutral-200">
          <DialogHeader>
            <DialogTitle>Edit Technician</DialogTitle>
            <DialogDescription>Update profile information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Pay Rate ($/hr)</Label>
                <Input
                  type="number"
                  value={editForm.payRate}
                  onChange={(e) => setEditForm({ ...editForm, payRate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Emergency Contact</Label>
                <Input
                  value={editForm.emergencyContact}
                  onChange={(e) =>
                    setEditForm({ ...editForm, emergencyContact: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Emergency Phone</Label>
                <Input
                  value={editForm.emergencyPhone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, emergencyPhone: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateEmployee.isPending}
              className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white"
            >
              {updateEmployee.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Certification Modal */}
      <Dialog open={certOpen} onOpenChange={setCertOpen}>
        <DialogContent className="sm:max-w-[500px] border-neutral-200">
          <DialogHeader>
            <DialogTitle>Add Certification</DialogTitle>
            <DialogDescription>Add a professional certification for this technician</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Certification Name *</Label>
              <Input
                value={certForm.name}
                onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                placeholder="e.g. ASE T1 - Gasoline Engines"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Issuing Organization</Label>
                <Input
                  value={certForm.issuingOrg}
                  onChange={(e) => setCertForm({ ...certForm, issuingOrg: e.target.value })}
                  placeholder="e.g. ASE, Cummins"
                />
              </div>
              <div className="space-y-2">
                <Label>Certificate Number</Label>
                <Input
                  value={certForm.certNumber}
                  onChange={(e) => setCertForm({ ...certForm, certNumber: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Level</Label>
              <Select
                value={certForm.level}
                onValueChange={(v) => setCertForm({ ...certForm, level: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                  <SelectItem value="master">Master</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Issued Date</Label>
                <Input
                  type="date"
                  value={certForm.issuedDate}
                  onChange={(e) => setCertForm({ ...certForm, issuedDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Input
                  type="date"
                  value={certForm.expiryDate}
                  onChange={(e) => setCertForm({ ...certForm, expiryDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCertOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddCert}
              disabled={!certForm.name || addCert.isPending}
              className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white"
            >
              {addCert.isPending ? 'Adding...' : 'Add Certification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation */}
      <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Deactivate Technician</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate {employee.name}? They will no longer be able to
              log in or be assigned to work orders.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={deleteEmployee.isPending}
            >
              {deleteEmployee.isPending ? 'Deactivating...' : 'Deactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
