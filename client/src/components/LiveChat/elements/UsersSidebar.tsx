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
      className="bg-primary-light/45 border-primary-dark/15 border-b md:border-b-0 md:border-r p-2 md:p-4 overflow-y-auto z-20 md:w-[250px] md:flex-shrink-0 max-h-44 md:max-h-none text-primary-dark" 
    >
      {/* Mobile Header */}
      <div className="flex md:hidden justify-between items-center mb-2">
        <span className="font-bold">Users</span>
        <button className="px-2 py-1 border border-primary-dark/20 bg-accent/70 rounded text-primary-dark" onClick={() => setShowUserDropdown(!showUserDropdown)}>
          {showUserDropdown ? "Close" : "Open"}
        </button>
      </div>

      {/* User List */}
      <div className={`transition-all duration-300 overflow-hidden ${showUserDropdown ? "max-h-[36vh] opacity-100" : "max-h-0 opacity-0"} md:max-h-full md:opacity-100`}>
        {users.map(u => (
          <div key={u} className="cursor-pointer p-2 rounded hover:bg-accent/70" onClick={() => openPrivateTab(u)}>
            {u} {u === username && "(You)"}
          </div>
        ))}
      </div>
    </aside>
  );
}
