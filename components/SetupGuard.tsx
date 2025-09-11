import { useGlobalContext } from '@/lib/global-provider'
import { Redirect } from 'expo-router'
import React from 'react'

interface SetupGuardProps {
  children: React.ReactNode
}

export default function SetupGuard({ children }: SetupGuardProps) {
  const { user, loading } = useGlobalContext()

  // Show loading while checking user status
  if (loading) {
    return null // or a loading component
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return <Redirect href="/login" />
  }

  // If user is logged in but hasn't completed setup, redirect to setup
  if (user && !user.setupCompleted) {
    return <Redirect href="/account-setup" />
  }

  // User is logged in and setup is completed, show the protected content
  return <>{children}</>
}
