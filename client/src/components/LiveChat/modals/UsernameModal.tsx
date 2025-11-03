type Props = {
  inputName: string;
  setInputName: (val: string) => void;
  setUsername: (val: string) => void;
};

export default function UsernameModal({ inputName, setInputName, setUsername }: Props) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
      <div className="bg-white p-6 rounded shadow-lg w-11/12 max-w-sm">
        <h2 className="text-xl font-bold mb-2">Enter your username</h2>
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
