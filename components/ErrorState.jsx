export default function ErrorState({ message, onRetry }) {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center my-6">
      <p className="text-red-700 font-medium mb-3">
        {message || 'Failed to load products. Please try again.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}