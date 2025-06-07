"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    console.log('ThemeToggle: Button clicked, current theme:', theme)
    if (theme === "light") {
      console.log('ThemeToggle: Switching from light to dark')
      setTheme("dark")
    } else if (theme === "dark") {
      console.log('ThemeToggle: Switching from dark to system')
      setTheme("system")
    } else {
      console.log('ThemeToggle: Switching from system to light')
      setTheme("light")
    }
  }

  const getThemeIcon = () => {
    if (theme === "light") {
      return <Sun className="h-4 w-4" />
    } else if (theme === "dark") {
      return <Moon className="h-4 w-4" />
    } else {
      // system theme
      return <Sun className="h-4 w-4" />
    }
  }

  const getThemeLabel = () => {
    if (theme === "light") {
      return "Switch to dark theme"
    } else if (theme === "dark") {
      return "Switch to system theme"
    } else {
      return "Switch to light theme"
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      title={getThemeLabel()}
      className="relative"
    >
      {getThemeIcon()}
      <span className="sr-only">{getThemeLabel()}</span>
    </Button>
  )
}