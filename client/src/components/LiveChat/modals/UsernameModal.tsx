type Props = {
  inputName: string;
  setInputName: (val: string) => void;
  setUsername: (val: string) => void;
  onClose?: () => void;
};

export default function UsernameModal({ inputName, setInputName, setUsername, onClose }: Props) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
      <div className="bg-white p-6 rounded shadow-lg w-11/12 max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">Enter your username</h2>
          {onClose && (
            <button type="button" onClick={onClose} className="px-2 py-1 rounded border border-gray-300 text-sm">
              Close
            </button>
          )}
        </div>
        <input
          type="text"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          placeholder="Your name"
          className="border p-2 rounded w-full mb-4"
        />
        <button
          onClick={() => inputName.trim() && setUsername(inputName.trim())}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          Join Chat
        </button>
      </div>
    </div>
  );
}
