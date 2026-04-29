'use client';

// react-hook-form manages the form state and wires inputs to React.
// zod defines the validation rules as a schema.
// zodResolver is the bridge - it runs your zod schema when the form submits
// and passes errors back to react-hook-form in the right format.

/// <reference types="@types/google.maps" />
import { useEffect, useRef } from 'react';
import { useController, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ShippingAddress } from '@/lib/types/order';
import { useAddressAutocomplete } from '@/lib/hooks/useAddressAutocomplete';

// ============================================================
// VALIDATION SCHEMA
// Define the rules each field must meet before the form submits.
// zod methods: z.string(), .min(n, 'message'), .email('message'), .optional()
// ============================================================

const shippingSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(6, 'Phone is required'),
  address_line1: z.string().min(5, 'Address is required'),
  address_line2: z.string().nullable(),
  city: z.string().min(2, 'City is required'),
  state: z.string().nullable(),
  postal_code: z.string().min(4, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
})

// Infer the TypeScript type directly from the schema
// This means we don't need to maintain a separate type for form values
type ShippingFormValues = z.infer<typeof shippingSchema>

type Props = {
  onSubmit: (data: ShippingAddress) => void
  defaultValues?: Partial<ShippingFormValues>
}

export const ShippingAddressForm = ({ onSubmit, defaultValues }: Props) => {
  const { register, handleSubmit, reset, setValue, control, formState: { errors, isSubmitting } } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: { country: 'AU', ...defaultValues },
  })

  const inputRef = useRef<HTMLInputElement>(null);
  const { ref: registerRef, ...rest } = register('address_line1');

  const address = useAddressAutocomplete(inputRef);
  const { field: cityField } = useController({ name: 'city', control });
  const { field: stateField } = useController({ name: 'state', control });
  const { field: postalCodeField } = useController({ name: 'postal_code', control });
  const { field: countryField } = useController({ name: 'country', control });

  useEffect(() => {
    if (!address.address_line1) return;

    setValue('address_line1', address.address_line1);
    setValue('city', address.city);
    setValue('state', address.state);
    setValue('postal_code', address.postal_code);
    setValue('country', address.country)
  }, [address]);

  // defaultValues arrive asynchronously (fetched after mount in the parent).
  // useForm only reads defaultValues on first render, so we reset whenever
  // the prop changes to populate the fields once the data is available.
  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      reset({ country: 'AU', ...defaultValues })
    }
  }, [defaultValues, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 bg-card p-4 sm:p-6 border">
      <h2 className="text-xl sm:text-2xl font-bold">Shipping Address</h2>

      <div className="grid gap-4 md:grid-cols-2">

        {/* Full name */}
        <div className="md:col-span-2 space-y-1">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" {...register('name')} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" {...register('phone')} />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
        </div>

        {/* Address line 1 */}
        <div className="md:col-span-2 space-y-1">
          <Label htmlFor="address_line1">Street Address</Label>
          <Input id="address_line1" {...rest} ref={(el) => {
            registerRef(el)
            inputRef.current = el
          }}
          />
          {errors.address_line1 && <p className="text-sm text-destructive">{errors.address_line1.message}</p>}
        </div>

        {/* Address line 2 */}
        <div className="md:col-span-2 space-y-1">
          <Label htmlFor="address_line2">Apartment, suite, etc. (optional)</Label>
          <Input id="address_line2" {...register('address_line2')} />
        </div>

        {/* City */}
        <div className="space-y-1">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...cityField} />
          {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
        </div>

        {/* State */}
        <div className="space-y-1">
          <Label htmlFor="state">State (optional)</Label>
          <Input id="state" {...stateField} />
        </div>

        {/* Postal code */}
        <div className="space-y-1">
          <Label htmlFor="postal_code">Postal Code</Label>
          <Input id="postal_code" {...postalCodeField} />
          {errors.postal_code && <p className="text-sm text-destructive">{errors.postal_code.message}</p>}
        </div>

        {/* Country */}
        <div className="space-y-1">
          <Label htmlFor="country">Country</Label>
          <Input id="country" {...countryField} />
          {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
        </div>

      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        Continue to Payment
      </Button>
    </form>
  )
}
