"use client"

import { memo } from "react"
import { cn } from "@/lib/utils"
import { Check, AlertTriangle, XCircle, Wrench } from "lucide-react"
import { STATUS_CONFIG, type ComponentStatus as ComponentStatusType, type StatusLevel } from "@/lib/status"

interface ComponentStatusProps {
  components: ComponentStatusType[]
}

const getStatusIcon = (status: StatusLevel) => {
  switch (status) {
    case "operational":
      return <Check className="w-4 h-4 text-green-600" />
    case "degraded":
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />
    case "outage":
      return <XCircle className="w-4 h-4 text-red-600" />
    case "maintenance":
      return <Wrench className="w-4 h-4 text-blue-600" />
  }
}

const ComponentItem = memo(function ComponentItem({
  component,
}: {
  component: ComponentStatusType
}) {
  const config = STATUS_CONFIG[component.status]

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border",
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="flex items-center gap-3">
        {getStatusIcon(component.status)}
        <span className="font-medium text-sm">{component.name}</span>
      </div>
      <span className={cn("text-xs font-medium", config.color)}>
        {config.label}
      </span>
    </div>
  )
})

export const ComponentStatusList = memo(function ComponentStatusList({
  components,
}: ComponentStatusProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">
        System Components
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {components.map((component) => (
          <ComponentItem key={component.id} component={component} />
        ))}
      </div>
    </div>
  )
})
