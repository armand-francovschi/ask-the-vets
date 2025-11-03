import { useEffect } from "react";

interface UploadSuccessNotificationProps {
  onClose?: () => void; // optional callback when notification disappears
}

export default function UploadSuccessNotification({ onClose }: UploadSuccessNotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 3000); // disappears after 3 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-green-500 text-white px-8 py-6 rounded-lg shadow-lg text-2xl font-semibold transform scale-110 transition-transform duration-300 pointer-events-auto">
        Update Successful!
      </div>
    </div>
  );
}
