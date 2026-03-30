'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createSupplier, updateSupplier } from '@/lib/actions/admin/suppliers';
import type { Supplier } from '@/lib/types';

type Props = {
  supplier?: Supplier;
};

export function SupplierForm({ supplier }: Props) {
  const router  = useRouter();
  const isEdit  = !!supplier;

  const [name,        setName]        = useState(supplier?.name        ?? '');
  const [contactName, setContactName] = useState(supplier?.contact_name ?? '');
  const [email,       setEmail]       = useState(supplier?.email        ?? '');
  const [phone,       setPhone]       = useState(supplier?.phone        ?? '');
  const [address,     setAddress]     = useState(supplier?.address      ?? '');
  const [notes,       setNotes]       = useState(supplier?.notes        ?? '');

  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError('Name is required.');

    setSaving(true);
    setError(null);

    const input = {
      name:         name.trim(),
      contact_name: contactName.trim() || null,
      email:        email.trim()       || null,
      phone:        phone.trim()       || null,
      address:      address.trim()     || null,
      notes:        notes.trim()       || null,
    };

    const result = isEdit
      ? await updateSupplier(supplier.id, input)
      : await createSupplier(input);

    setSaving(false);

    if (result) {
      setError(result);
    } else {
      router.push('/admin/suppliers');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">

      <div className="space-y-1.5">
        <Label htmlFor="sup-name">Company name *</Label>
        <Input
          id="sup-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. ProFit Equipment Pty Ltd"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sup-contact">Contact name</Label>
        <Input
          id="sup-contact"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          placeholder="e.g. Jane Smith"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="sup-email">Email</Label>
          <Input
            id="sup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="orders@supplier.com"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sup-phone">Phone</Label>
          <Input
            id="sup-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="02 xxxx xxxx"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sup-address">Address</Label>
        <Input
          id="sup-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="123 Warehouse St, Melbourne VIC 3000"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sup-notes">Notes</Label>
        <Textarea
          id="sup-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Payment terms, lead times, special instructions..."
          rows={3}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add supplier'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/suppliers')}
        >
          Cancel
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
