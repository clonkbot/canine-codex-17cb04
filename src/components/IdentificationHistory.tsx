import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function IdentificationHistory() {
  const identifications = useQuery(api.identifications.list);
  const removeIdentification = useMutation(api.identifications.remove);

  const handleDelete = async (id: Id<"identifications">) => {
    if (confirm("Remove this identification from your history?")) {
      await removeIdentification({ id });
    }
  };

  if (identifications === undefined) {
    return (
      <div className="text-center py-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-terracotta animate-pulse" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-terracotta animate-pulse" style={{ animationDelay: "300ms" }} />
        </div>
        <p className="font-body text-charcoal/60">Loading your identification history...</p>
      </div>
    );
  }

  if (identifications.length === 0) {
    return (
      <div className="text-center py-12 md:py-20">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-charcoal/5 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl md:text-5xl opacity-50">📚</span>
        </div>
        <h3 className="font-display text-xl md:text-2xl text-charcoal mb-2">No identifications yet</h3>
        <p className="font-body text-charcoal/50 text-sm md:text-base max-w-md mx-auto">
          Your identified breeds will appear here. Start by uploading a photo of a dog!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8 md:mb-12">
        <h2 className="font-display text-2xl md:text-4xl text-charcoal mb-3 md:mb-4">
          Your Breed Collection
        </h2>
        <p className="font-body text-charcoal/60 text-sm md:text-base">
          {identifications.length} {identifications.length === 1 ? "breed" : "breeds"} identified
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {identifications.map((item: { _id: Id<"identifications">; breed: string; confidence: string; description: string; traits: string[]; createdAt: number }, index: number) => (
          <div
            key={item._id}
            className="group bg-white rounded-xl overflow-hidden shadow-lg border border-charcoal/10 hover:shadow-xl transition-all duration-300 animate-fadeIn"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Card header with breed info */}
            <div className="relative bg-gradient-to-br from-forest/5 to-terracotta/5 px-4 py-4 border-b border-charcoal/10">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-body text-[10px] uppercase tracking-wider text-charcoal/40 mb-1">Breed</p>
                  <h3 className="font-display text-lg md:text-xl text-charcoal truncate">{item.breed}</h3>
                </div>
                <div className={`ml-2 px-2 py-1 rounded-full text-[10px] font-body font-semibold shrink-0 ${
                  item.confidence === "High"
                    ? "bg-green-100 text-green-700"
                    : item.confidence === "Medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-charcoal/10 text-charcoal/60"
                }`}>
                  {item.confidence}
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={() => handleDelete(item._id)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-charcoal/5 text-charcoal/40 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* Description */}
            <div className="px-4 py-4">
              <p className="font-body text-charcoal/60 text-xs md:text-sm leading-relaxed line-clamp-3">
                {item.description}
              </p>
            </div>

            {/* Traits */}
            <div className="px-4 pb-4">
              <div className="flex flex-wrap gap-1.5">
                {item.traits.slice(0, 3).map((trait: string, traitIndex: number) => (
                  <span
                    key={traitIndex}
                    className="px-2 py-1 bg-cream rounded-full font-body text-[10px] md:text-xs text-charcoal/70 border border-charcoal/5"
                  >
                    {trait}
                  </span>
                ))}
                {item.traits.length > 3 && (
                  <span className="px-2 py-1 bg-cream rounded-full font-body text-[10px] md:text-xs text-charcoal/40 border border-charcoal/5">
                    +{item.traits.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Timestamp */}
            <div className="px-4 py-3 bg-cream/50 border-t border-charcoal/5">
              <p className="font-body text-[10px] text-charcoal/40">
                {new Date(item.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
