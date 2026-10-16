import { whatsappLink } from '@/lib/whatsapp';
import { Icon } from './Icon';

export function WhatsAppButton({ phone, message, label, small }: { phone: string | null; message: string; label?: string; small?: boolean }) {
  if (!phone) return null;
  return (
    <a href={whatsappLink(phone, message)} target="_blank" rel="noopener noreferrer"
      title={`WhatsApp ${phone}`} aria-label={label ? undefined : `WhatsApp ${phone}`}
      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-[8px] border border-[#25d366]/35 bg-[#25d366]/10 text-[12.5px] font-semibold text-whatsapp hover:bg-[#25d366]/20 ${small ? 'h-7 min-w-7' : 'h-9'} ${label ? 'px-3' : ''}`}>
      <Icon name="message" size={small ? 14 : 15} />{label}
    </a>
  );
}
