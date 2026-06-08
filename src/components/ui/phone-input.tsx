"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface Country {
  code: string;
  dialCode: string;
  flag: string;
  name: string;
}

export const COUNTRIES: Country[] = [
  { code: "MA", dialCode: "+212", flag: "🇲🇦", name: "Maroc" },
  { code: "FR", dialCode: "+33", flag: "🇫🇷", name: "France" },
  { code: "ES", dialCode: "+34", flag: "🇪🇸", name: "Espagne" },
  { code: "BE", dialCode: "+32", flag: "🇧🇪", name: "Belgique" },
  { code: "CH", dialCode: "+41", flag: "🇨🇭", name: "Suisse" },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  error?: string;
}

export function PhoneInput({
  value,
  onChange,
  placeholder = "612345678",
  className,
  required,
  error,
}: PhoneInputProps) {
  // Extract dial code and number from full value
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    COUNTRIES[0] // Default to Morocco
  );
  const [localNumber, setLocalNumber] = useState("");

  // Parse incoming value
  const parseValue = (fullValue: string) => {
    const found = COUNTRIES.find((c) => fullValue.startsWith(c.dialCode));
    if (found) {
      setSelectedCountry(found);
      setLocalNumber(fullValue.slice(found.dialCode.length));
    } else if (fullValue.startsWith("0")) {
      // Moroccan number without code
      setSelectedCountry(COUNTRIES[0]);
      setLocalNumber(fullValue.slice(1));
    } else {
      setLocalNumber(fullValue);
    }
  };

  // Initialize from value prop
  if (value && localNumber === "" && value !== selectedCountry.dialCode) {
    parseValue(value);
  }

  const handleCountryChange = (countryCode: string) => {
    const country = COUNTRIES.find((c) => c.code === countryCode)!;
    setSelectedCountry(country);

    // Rebuild full phone number
    const newValue = country.dialCode + localNumber;
    onChange(newValue);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let num = e.target.value.replace(/\D/g, ""); // Only digits

    // Limit length
    if (num.length > 9) num = num.slice(0, 9);

    setLocalNumber(num);

    const fullValue = selectedCountry.dialCode + num;
    onChange(fullValue);
  };

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex gap-2">
        {/* Country Selector */}
        <div className="relative w-[110px]">
          <select
            value={selectedCountry.code}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="h-10 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            required={required}
          >
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.dialCode}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            ▼
          </div>
        </div>

        {/* Phone Number Input */}
        <div className="relative flex-1">
          <input
            type="tel"
            value={localNumber}
            onChange={handleNumberChange}
            placeholder={placeholder}
            className={cn(
              "h-10 w-full rounded-md border border-input bg-background px-3 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-ring",
              error && "border-red-500 focus:ring-red-500"
            )}
            required={required}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
