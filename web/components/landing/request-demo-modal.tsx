"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

const demoFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  companySize: z.string().min(1, "Please select company size"),
})

type DemoFormValues = z.infer<typeof demoFormSchema>

interface RequestDemoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RequestDemoModal({ open, onOpenChange }: RequestDemoModalProps) {
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DemoFormValues>({
    resolver: zodResolver(demoFormSchema),
  })

  const onSubmit = async (data: DemoFormValues) => {
    // TODO: Implement actual API call
    console.log("Demo request:", data)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    toast({
      title: "Demo request received",
      description: "We'll reach out within 24 hours to schedule your demo.",
    })
    
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request a demo</DialogTitle>
          <DialogDescription>
            See how ShopMule can transform your shop operations.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="john@company.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="companySize">Company size</Label>
            <select
              id="companySize"
              {...register("companySize")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select size</option>
              <option value="1-5">1-5 employees</option>
              <option value="6-20">6-20 employees</option>
              <option value="21-50">21-50 employees</option>
              <option value="51+">51+ employees</option>
            </select>
            {errors.companySize && (
              <p className="text-sm text-destructive">{errors.companySize.message}</p>
            )}
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Sending..." : "Request demo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
