// Emergency contacts: stored in Supabase + helpers to trigger tel:/sms: links.

import { supabase } from '@/integrations/supabase/client';

export type EmergencyContact = {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

export async function listContacts(): Promise<EmergencyContact[]> {
  const { data, error } = await supabase
    .from('blind_eye_emergency_contacts')
    .select('*')
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []) as EmergencyContact[];
}

export async function addContact(input: { name: string; phone: string; is_primary?: boolean }) {
  const { data: auth } = await supabase.auth.getUser();
  const user_id = auth.user?.id;
  if (!user_id) throw new Error('not_authenticated');
  if (input.is_primary) {
    await supabase.from('blind_eye_emergency_contacts').update({ is_primary: false }).eq('user_id', user_id);
  }
  const { error } = await supabase.from('blind_eye_emergency_contacts').insert({
    user_id, name: input.name, phone: input.phone, is_primary: !!input.is_primary,
  });
  if (error) throw error;
}

export async function deleteContact(id: string) {
  const { error } = await supabase.from('blind_eye_emergency_contacts').delete().eq('id', id);
  if (error) throw error;
}

export async function getPrimaryContact(): Promise<EmergencyContact | null> {
  const all = await listContacts();
  return all.find(c => c.is_primary) || all[0] || null;
}

export type EmergencyLocation = { lat: number; lng: number } | null;

export function buildEmergencyMessage(loc: EmergencyLocation, userName?: string): string {
  const prefix = userName ? `طوارئ من ${userName}.` : 'طوارئ — أحتاج مساعدة.';
  if (loc) {
    return `${prefix} موقعي: https://maps.google.com/?q=${loc.lat.toFixed(6)},${loc.lng.toFixed(6)}`;
  }
  return `${prefix} (الموقع غير متوفر)`;
}

export async function getCurrentLocation(timeoutMs = 6000): Promise<EmergencyLocation> {
  if (!('geolocation' in navigator)) return null;
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(null), timeoutMs);
    navigator.geolocation.getCurrentPosition(
      (pos) => { clearTimeout(t); resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
      () => { clearTimeout(t); resolve(null); },
      { enableHighAccuracy: true, timeout: timeoutMs },
    );
  });
}

export function openSms(phone: string, message: string) {
  const sep = /android/i.test(navigator.userAgent) ? '?' : '&';
  window.location.href = `sms:${phone}${sep}body=${encodeURIComponent(message)}`;
}

export function openCall(phone: string) {
  window.location.href = `tel:${phone}`;
}

export async function triggerEmergency(opts: { mode: 'sms' | 'call' } = { mode: 'sms' }) {
  const contact = await getPrimaryContact();
  if (!contact) throw new Error('no_contact');
  if (opts.mode === 'call') { openCall(contact.phone); return contact; }
  const loc = await getCurrentLocation();
  openSms(contact.phone, buildEmergencyMessage(loc));
  return contact;
}
