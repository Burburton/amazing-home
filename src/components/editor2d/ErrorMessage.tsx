interface ErrorMessageProps {
  message: string
  onDismiss: () => void
}

function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div className="px-4 py-2 bg-red-50 border-b border-red-200 flex items-center justify-between">
      <span className="text-sm text-red-600">{message}</span>
      <button
        onClick={onDismiss}
        className="text-sm text-red-400 hover:text-red-600"
      >
        Dismiss
      </button>
    </div>
  )
}

export default ErrorMessage