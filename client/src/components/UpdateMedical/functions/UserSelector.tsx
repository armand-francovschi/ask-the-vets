import type { User } from "../../../types"

interface UserSelectorProps {
  users: User[];
  selectedUser: User | null;
  onChange: (userId: number) => void;
}

export default function UserSelector({ users, selectedUser, onChange }: UserSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = Number(e.target.value);
    onChange(userId);
  };

  return (
    <div className="flex items-center gap-3 mb-4">
      <label className="text-lg font-semibold text-primary-dark">Select User:</label>
      <select
        className="border rounded p-2"
        value={selectedUser?.id || ""}
        onChange={handleChange}
      >
        <option value="">-- Choose a User --</option>
        {users.map(user => (
          <option key={user.id} value={user.id}>
            {user.name} ({user.role})
          </option>
        ))}
      </select>
    </div>
  );
}
