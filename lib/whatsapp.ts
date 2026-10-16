/** Click-to-chat link: https://wa.me/<digits>?text=<message> */
export function whatsappLink(phone: string, message: string) {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}
