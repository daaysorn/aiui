"use client"

import type { ComponentProps, ComponentType, ReactNode } from "react"
import { CaretDownIcon } from "@phosphor-icons/react"
import PhoneInput, { type Value as PhoneValue } from "react-phone-number-input"
import flags from "react-phone-number-input/flags"
import "react-phone-number-input/style.css"

import { Input } from "@/components/ui/input"
import { authCopy } from "@/lib/site"
import { cn } from "@/lib/utils"

type CountrySelectOption = {
  value?: string
  label: string
  divider?: boolean
}

function PhoneTextInput(props: ComponentProps<typeof Input>) {
  return (
    <Input
      {...props}
      className={cn(
        "h-full w-0 min-w-0 flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:border-0",
        props.className
      )}
    />
  )
}

function CountrySelect({
  value,
  onChange,
  options,
  disabled,
  readOnly,
  iconComponent: Icon,
}: {
  value?: string
  onChange: (value?: string) => void
  options: CountrySelectOption[]
  disabled?: boolean
  readOnly?: boolean
  iconComponent?: ComponentType<{ country?: string; label?: string }>
}) {
  return (
    <div className="relative flex h-full shrink-0 items-center gap-1 px-2.5">
      <span className="flex h-4 w-5 items-center overflow-hidden">
        {value && Icon ? <Icon country={value} label={value} /> : null}
      </span>
      <CaretDownIcon className="size-3 text-muted-foreground" weight="bold" />
      <select
        aria-label="Country"
        className="absolute inset-0 cursor-pointer opacity-0"
        disabled={disabled || readOnly}
        value={value || "ZZ"}
        onChange={(event) => {
          const next = event.target.value
          onChange(next === "ZZ" ? undefined : next)
        }}
      >
        {options.map((option) => (
          <option
            key={option.divider ? `|${option.label}` : option.value || "ZZ"}
            value={option.divider ? "|" : option.value || "ZZ"}
            disabled={option.divider}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function PhoneNumberField({
  id = "telephone",
  name = "telephone",
  value,
  onChange,
  placeholder = authCopy.placeholders.telephone,
  invalid,
  children,
}: {
  id?: string
  name?: string
  value: PhoneValue | undefined
  onChange: (value?: PhoneValue) => void
  placeholder?: string
  invalid?: boolean
  children?: ReactNode
}) {
  return (
    <div
      className={cn(
        "flex h-9 w-full min-w-0 overflow-hidden rounded-md border bg-transparent text-sm shadow-xs transition-colors focus-within:border-ring",
        invalid ? "border-destructive focus-within:border-destructive" : "border-input"
      )}
    >
      <PhoneInput
        id={id}
        name={name}
        flags={flags}
        international
        withCountryCallingCode
        countryCallingCodeEditable={false}
        defaultCountry="NG"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        inputComponent={PhoneTextInput}
        countrySelectComponent={CountrySelect}
        className="flex min-w-0 flex-1 items-center [&_.PhoneInputCountry]:relative [&_.PhoneInputCountry]:mr-0 [&_.PhoneInputCountry]:flex [&_.PhoneInputCountry]:h-full [&_.PhoneInputCountry]:items-center [&_.PhoneInputInput]:min-w-0 [&_.PhoneInputInput]:flex-1"
      />
      {children}
    </div>
  )
}

export { PhoneNumberField, type PhoneValue }
