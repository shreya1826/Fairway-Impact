import Image from "next/image";
import type { Charity } from "@/types/database";

export default function CharityCard({ charity }: { charity: Charity }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-ink/10 bg-white transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-40 w-full bg-moss/10">
        {charity.image_url && (
          <Image src={charity.image_url} alt={charity.name} fill className="object-cover" />
        )}
        {charity.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-ink">
            Spotlight
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold">{charity.name}</h3>
        <p className="mt-1 text-sm text-ink/70 line-clamp-3">{charity.description}</p>
      </div>
    </div>
  );
}
