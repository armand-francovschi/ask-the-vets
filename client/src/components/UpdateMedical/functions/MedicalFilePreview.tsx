interface MedicalFilePreviewProps {
  fileUrl: string;
  onClose: () => void;
}

export default function MedicalFilePreview({ fileUrl, onClose }: MedicalFilePreviewProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-3xl h-[80vh] flex flex-col">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-red-500 font-bold px-2 py-1 hover:text-red-700">
            Close
          </button>
        </div>
        <iframe src={fileUrl} className="flex-1 w-full border rounded" title="Medical File Preview" />
      </div>
    </div>
  );
}
