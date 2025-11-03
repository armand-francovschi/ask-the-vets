type Props = { 
  users: string[]; 
  openPrivateTab: (user: string) => void; 
  showUserDropdown: boolean; 
  setShowUserDropdown: (b: boolean) => void; 
  username: string; 
};

export default function UserSidebar({ users, openPrivateTab, showUserDropdown, setShowUserDropdown, username }: Props) {
  return (
    <aside 
      className="bg-gray-300 border-r p-2 md:p-4 overflow-y-auto z-50" 
      style={{ flexBasis: "min(25%, 250px)" }}
    >
      {/* Mobile Header */}
      <div className="flex md:hidden justify-between items-center mb-2">
        <span className="font-bold">Users</span>
        <button className="px-2 py-1 border rounded" onClick={() => setShowUserDropdown(!showUserDropdown)}>
          {showUserDropdown ? "Close" : "Open"}
        </button>
      </div>

      {/* User List */}
      <div className={`transition-all duration-300 overflow-hidden ${showUserDropdown ? "max-h-[calc(100vh-4rem)] opacity-100" : "max-h-0 opacity-0"} md:max-h-full md:opacity-100`}>
        {users.map(u => (
          <div key={u} className="cursor-pointer p-2 rounded hover:bg-gray-100" onClick={() => openPrivateTab(u)}>
            {u} {u === username && "(You)"}
          </div>
        ))}
      </div>
    </aside>
  );
}
