'use client';

import { usePathname, useRouter } from 'next/navigation';

/** Lets teachers and admins switch which student a learning screen shows. */
export function StudentPicker({ options, value }: { options: { id: string; name: string }[]; value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  if (options.length < 2) return null;
  return (
    <>
      <label htmlFor="student-picker" className="sr-only">Student</label>
      <select id="student-picker" className="input h-9 w-auto min-w-[190px] text-[12.5px]" value={value}
        onChange={(e) => router.push(`${pathname}?student=${e.target.value}`)}>
        {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
    </>
  );
}
