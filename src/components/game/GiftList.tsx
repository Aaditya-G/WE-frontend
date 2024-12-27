interface GiftListProps {
  gifts: any[]; // adjust this to match your actual gift data structure
}

export function GiftList({ gifts }: GiftListProps) {
  if (!gifts?.length) {
    return (
      <div className="p-2 border rounded-md">
        <p className="text-sm text-gray-600">No gifts have been added yet.</p>
      </div>
    );
  }

  return (
    <div className="p-2 border rounded-md">
      <p className="text-sm font-bold mb-2">Gifts:</p>
      <ul className="list-disc ml-5 space-y-1">
        {gifts.map((gift, idx) => (
          <li key={idx}>{gift.name || `Gift #${idx + 1}`}</li>
        ))}
      </ul>
    </div>
  );
}
