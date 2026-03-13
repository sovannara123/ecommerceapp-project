import { Button } from "@/shared/ui/forms/Button";

export function Pagination({ hasNext, onNext, loading }: { hasNext: boolean; onNext: () => void; loading?: boolean }) {
  return (
    <div className="mt-8 flex justify-center">
      <Button onClick={onNext} disabled={!hasNext || loading} loading={loading}>Load more</Button>
    </div>
  );
}
