export default function Loading() {
  return (
    <div className="flex flex-1 flex-col" aria-busy="true" aria-label="Loading">
      <div className="h-[62px] border-b border-line bg-deep/70" />
      <div className="grid gap-4 p-[22px] md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <div key={i} className="card h-24 animate-pulse bg-panel/60" />)}
        <div className="card h-80 animate-pulse bg-panel/60 md:col-span-4" />
      </div>
    </div>
  );
}
