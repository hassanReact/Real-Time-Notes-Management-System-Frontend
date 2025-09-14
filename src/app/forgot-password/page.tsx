"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Mail } from "lucide-react"
import Link from "next/link"
import { toast } from 'sonner'
import { authService } from "@/lib/services"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await authService.forgotPassword(email)

            toast.success("Check your email", {
                description: "If an account exists with this email, you will receive a password reset link."
            })

            // Clear form
            setEmail("")
        } catch (error: any) {
            toast.error("Error", {
                description: error.response?.data?.message || "Failed to send reset email. Please try again."
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">Forgot Password</h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your email address and we&apos;ll send you a reset link
                    </p>

                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>
                    <Button className="w-full" type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {!isLoading && <Mail className="mr-2 h-4 w-4" />}
                        Send Reset Link
                    </Button>
                </form>

                <Link
                    href="/"
                    className="flex items-center text-sm text-muted-foreground hover:text-primary"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                </Link>
            </div>
        </div>
    )
}
