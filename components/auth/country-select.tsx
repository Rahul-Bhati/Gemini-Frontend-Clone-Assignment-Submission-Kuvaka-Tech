"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface Country {
  name: string
  code: string
  dialCode: string
  flag: string
}

interface CountrySelectProps {
  value: string
  onChange: (value: string) => void
}

export default function CountrySelect({ value, onChange }: CountrySelectProps) {
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,idd,flag")
        const data = await response.json()

        const formattedCountries: Country[] = data
          .filter((country: any) => country.idd?.root && country.idd?.suffixes)
          .map((country: any) => ({
            name: country.name.common,
            code: country.cca2,
            dialCode: country.idd.root + (country.idd.suffixes[0] || ""),
            flag: country.flag,
          }))
          .sort((a: Country, b: Country) => a.name.localeCompare(b.name))

        // Remove duplicates based on dial code, keeping the first occurrence
        const uniqueCountries = formattedCountries.filter(
          (country, index, self) => index === self.findIndex((c) => c.dialCode === country.dialCode),
        )

        setCountries(uniqueCountries)
      } catch (error) {
        console.error("Failed to fetch countries:", error)
        // Fallback to some common countries
        setCountries([
          { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸" },
          { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧" },
          { name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳" },
          { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦" },
          { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺" },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchCountries()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-10 border rounded-md">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    )
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select country" />
      </SelectTrigger>
      <SelectContent>
        {countries.map((country) => (
          <SelectItem key={country.code} value={country.dialCode}>
            <div className="flex items-center space-x-2">
              <span>{country.flag}</span>
              <span>{country.name}</span>
              <span className="text-gray-500">({country.dialCode})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
