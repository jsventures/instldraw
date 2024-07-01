import { useState } from "react";

export function useDialog(open?: boolean) {
  const [isOpen, setIsOpen] = useState(open ?? false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}

export function PromptDialog({
  title,
  onClose,
  onSubmit,
}: {
  title: string;
  onClose: () => void;
  onSubmit: (v: string) => void;
}) {
  const [value, setValue] = useState("");

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        className="bg-white p-4 rounded-sm shadow-xl flex flex-col gap-2 w-full max-w-sm"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(value);
          onClose();
        }}
      >
        <h3 className="font-bold text-lg">{title}</h3>
        <input
          autoFocus
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="border px-3 py-0.5"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-black text-white py-0.5 px-3 rounded text-sm flex-1"
          >
            Submit
          </button>
          <button
            onClick={() => {
              onClose();
              setValue("");
            }}
            className="bg-gray-400 text-white py-0.5 px-3 rounded text-sm flex-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
