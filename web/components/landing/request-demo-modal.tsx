"use client"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle2, AlertCircle } from "lucide-react"

const demoFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  company: z.string().optional(),
  shopSize: z.enum(["1-5", "6-15", "16-50", "50+"], {
    required_error: "Please select your shop size",
  }),
  message: z.string().max(2000).optional(),
})

type DemoFormValues = z.infer<typeof demoFormSchema>

interface RequestDemoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RequestDemoModal({ open, onOpenChange }: RequestDemoModalProps) {
  const { toast } = useToast()
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DemoFormValues>({
    resolver: zodResolver(demoFormSchema),
  })

  const onSubmit = async (data: DemoFormValues) => {
    setError(null)

    try {
      const response = await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          source: "website",
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          setError("Too many requests. Please try again later.")
          return
        }
        if (response.status === 409) {
          setError("You've already requested a demo. We'll contact you soon!")
          return
        }
        throw new Error(result.error || "Failed to submit request")
      }

      setSubmitted(true)
      toast({
        title: "Demo request received!",
        description: "We'll reach out within 24 hours to schedule your demo.",
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      setError(message)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset state after animation
    setTimeout(() => {
      setSubmitted(false)
      setError(null)
      reset()
    }, 200)
  }

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Thank you!
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
              We've received your demo request. A ShopMule specialist will reach out within 24 hours.
            </p>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request a Demo</DialogTitle>
          <DialogDescription>
            See how ShopMule can transform your shop operations. Fill out the form and we'll schedule a personalized demo.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name *</Label>
              <Input
                id="firstName"
                {...register("firstName")}
                placeholder="John"
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name *</Label>
              <Input
                id="lastName"
                {...register("lastName")}
                placeholder="Doe"
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Work email *</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="john@yourshop.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Shop/Company name</Label>
            <Input
              id="company"
              {...register("company")}
              placeholder="ABC Truck Repair"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shopSize">Shop size *</Label>
            <select
              id="shopSize"
              {...register("shopSize")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">How many employees?</option>
              <option value="1-5">1-5 employees</option>
              <option value="6-15">6-15 employees</option>
              <option value="16-50">16-50 employees</option>
              <option value="50+">50+ employees</option>
            </select>
            {errors.shopSize && (
              <p className="text-sm text-destructive">{errors.shopSize.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">
              Anything specific you'd like to see? <span className="text-neutral-400">(optional)</span>
            </Label>
            <Textarea
              id="message"
              {...register("message")}
              placeholder="Tell us about your shop and what challenges you're facing..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#ee7a14] hover:bg-[#d96a0a]"
            >
              {isSubmitting ? "Submitting..." : "Request Demo"}
            </Button>
          </div>

          <p className="text-xs text-center text-neutral-500 dark:text-neutral-400">
            By submitting, you agree to receive emails from ShopMule. You can unsubscribe at any time.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
