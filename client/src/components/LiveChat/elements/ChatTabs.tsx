import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import type { ChatTab } from "../functions/useLiveChat";

type Props = {
  tabs: ChatTab[];
  moveTab: (dragIndex: number, hoverIndex: number) => void;
  activeTab: string;
  switchTab: (name: string) => void;
  closeTab: (name: string) => void;
};

const TabItem: React.FC<{
  tab: ChatTab;
  index: number;
  moveTab: (dragIndex: number, hoverIndex: number) => void;
  activeTab: string;
  switchTab: (name: string) => void;
  closeTab: (name: string) => void;
  isDraggable: boolean;
}> = ({ tab, index, moveTab, activeTab, switchTab, closeTab, isDraggable }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop<{ index: number }>({
    accept: "TAB",
    hover(item, monitor) {
      if (!isDraggable || !ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;

      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) return;
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) return;

      moveTab(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [, drag] = useDrag({
    type: "TAB",
    item: { index },
    canDrag: isDraggable,
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`flex items-center px-3 py-1 cursor-pointer relative select-none text-sm md:text-base ${
        activeTab === tab.name ? "bg-white border-t border-l border-r rounded-t" : ""
      }`}
      onClick={() => switchTab(tab.name)}
    >
      {tab.name}
      {tab.unread && <span className="ml-1 w-2 h-2 bg-red-500 rounded-full inline-block"></span>}
      {tab.name !== "General" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            closeTab(tab.name);
          }}
          className="ml-1 text-gray-500 hover:text-red-500 font-bold"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default function ChatTabs({ tabs, moveTab, activeTab, switchTab, closeTab }: Props) {
  return (
    <div className="flex border-b bg-gray-100 overflow-x-auto z-10">
      {tabs.map((tab, index) => (
        <TabItem
          key={tab.name}
          tab={tab}
          index={index}
          moveTab={moveTab}
          activeTab={activeTab}
          switchTab={switchTab}
          closeTab={closeTab}
          isDraggable={tab.name !== "General"}
        />
      ))}
    </div>
  );
}
