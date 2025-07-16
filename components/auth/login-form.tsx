"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import CountrySelect from "./country-select"

// Separate schemas for each step
const phoneSchema = z.object({
  countryCode: z.string().min(1, "Please select a country"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
})

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
})

const fullLoginSchema = z.object({
  countryCode: z.string().min(1, "Please select a country"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  otp: z.string().length(6, "OTP must be 6 digits"),
})

type PhoneFormData = z.infer<typeof phoneSchema>
type OtpFormData = z.infer<typeof otpSchema>
type LoginFormData = z.infer<typeof fullLoginSchema>

export default function LoginForm() {
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [loading, setLoading] = useState(false)
  const [phoneData, setPhoneData] = useState<PhoneFormData | null>(null)
  const { login, sendOTP } = useAuth()

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      countryCode: "",
      phone: "",
    },
  })

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  })

  const onSendOTP = async (data: PhoneFormData) => {
    setLoading(true)
    try {
      const success = await sendOTP(data.phone, data.countryCode)
      if (success) {
        setPhoneData(data)
        setStep("otp")
      }
    } catch (error) {
      console.error("Failed to send OTP:", error)
    } finally {
      setLoading(false)
    }
  }

  const onVerifyOTP = async (data: OtpFormData) => {
    if (!phoneData) return

    setLoading(true)
    try {
      const success = await login(phoneData.phone, phoneData.countryCode, data.otp)
      if (!success) {
        otpForm.setError("otp", { message: "Invalid OTP. Please try again." })
      }
    } catch (error) {
      console.error("Login failed:", error)
      otpForm.setError("otp", { message: "Login failed. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  const handleBackToPhone = () => {
    setStep("phone")
    setPhoneData(null)
    otpForm.reset()
  }

  return (
    <div className="space-y-4">
      {step === "phone" ? (
        <Form {...phoneForm}>
          <form onSubmit={phoneForm.handleSubmit(onSendOTP)} className="space-y-4">
            <FormField
              control={phoneForm.control}
              name="countryCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <CountrySelect value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={phoneForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" placeholder="Enter your phone number" disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...otpForm}>
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Verify Your Phone</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Enter the 6-digit code sent to{" "}
                <span className="font-medium">
                  {phoneData?.countryCode}
                  {phoneData?.phone}
                </span>
              </p>
            </div>

            <form onSubmit={otpForm.handleSubmit(onVerifyOTP)} className="space-y-4">
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        disabled={loading}
                        className="text-center text-lg tracking-widest"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={handleBackToPhone}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Login"
                  )}
                </Button>
              </div>
            </form>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-sm"
                onClick={() => phoneData && onSendOTP(phoneData)}
                disabled={loading}
              >
                Didn't receive code? Resend
              </Button>
            </div>
          </div>
        </Form>
      )}
    </div>
  )
}


// "use client"

// import { useState } from "react"
// import { useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import * as z from "zod"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
// import { useAuth } from "@/contexts/auth-context"
// import { Loader2 } from "lucide-react"
// import CountrySelect from "./country-select"

// const loginSchema = z.object({
//   countryCode: z.string().min(1, "Please select a country"),
//   phone: z.string().min(10, "Phone number must be at least 10 digits"),
//   otp: z.string().length(6, "OTP must be 6 digits"),
// })

// type LoginFormData = z.infer<typeof loginSchema>

// export default function LoginForm() {
//   const [step, setStep] = useState<"phone" | "otp">("phone")
//   const [loading, setLoading] = useState(false)
//   const { login, sendOTP } = useAuth()

//   const form = useForm<LoginFormData>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: {
//       countryCode: "",
//       phone: "",
//       otp: "",
//     },
//   })

//   const onSendOTP = async (data: Pick<LoginFormData, "phone" | "countryCode">) => {
//     setLoading(true)
//     try {
//       await sendOTP(data.phone, data.countryCode)
//       setStep("otp")
//     } catch (error) {
//       console.error("Failed to send OTP:", error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const onSubmit = async (data: LoginFormData) => {
//     setLoading(true)
//     try {
//       const success = await login(data.phone, data.countryCode, data.otp)
//       if (!success) {
//         form.setError("otp", { message: "Invalid OTP" })
//       }
//     } catch (error) {
//       console.error("Login failed:", error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(step === "phone" ? onSendOTP : onSubmit)} className="space-y-4">
//         {step === "phone" ? (
//           <>
//             <FormField
//               control={form.control}
//               name="countryCode"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Country</FormLabel>
//                   <FormControl>
//                     <CountrySelect value={field.value} onChange={field.onChange} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="phone"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Phone Number</FormLabel>
//                   <FormControl>
//                     <Input {...field} type="tel" placeholder="Enter your phone number" disabled={loading} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <Button type="submit" className="w-full" disabled={loading}>
//               {loading ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Sending OTP...
//                 </>
//               ) : (
//                 "Send OTP"
//               )}
//             </Button>
//           </>
//         ) : (
//           <>
//             <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
//               Enter the 6-digit code sent to {form.getValues("countryCode")}
//               {form.getValues("phone")}
//             </div>

//             <FormField
//               control={form.control}
//               name="otp"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Verification Code</FormLabel>
//                   <FormControl>
//                     <Input {...field} type="text" placeholder="Enter 6-digit code" maxLength={6} disabled={loading} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <div className="flex space-x-2">
//               <Button
//                 type="button"
//                 variant="outline"
//                 className="flex-1 bg-transparent"
//                 onClick={() => setStep("phone")}
//                 disabled={loading}
//               >
//                 Back
//               </Button>
//               <Button type="submit" className="flex-1" disabled={loading}>
//                 {loading ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Verifying...
//                   </>
//                 ) : (
//                   "Verify & Login"
//                 )}
//               </Button>
//             </div>
//           </>
//         )}
//       </form>
//     </Form>
//   )
// }
