import { useState } from 'react';

interface AddGiftFormProps {
  onAddGift: (giftName: string) => void;
}

export function AddGiftForm({ onAddGift }: AddGiftFormProps) {
  const [giftName, setGiftName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftName.trim()) return;
    onAddGift(giftName.trim());
    setGiftName('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-x-2">
      <input
        className="border rounded p-1"
        type="text"
        placeholder="Gift name"
        value={giftName}
        onChange={(e) => setGiftName(e.target.value)}
      />
      <button
        type="submit"
        className="px-3 py-1 bg-blue-500 text-white rounded"
      >
        Add Gift
      </button>
    </form>
  );
}
