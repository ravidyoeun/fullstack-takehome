type LoadingSpinnerProps = {
  label?: string
  size?: 'sm' | 'md'
}

export const LoadingSpinner = ({ label = 'Loading...', size = 'md' }: LoadingSpinnerProps) => {
  const spinnerSize = size === 'sm' ? 'h-4 w-4 border-2' : 'h-6 w-6 border-2'
  return (
    <div className="flex items-center gap-2 text-blue-600">
      <span
        className={`${spinnerSize} animate-spin rounded-full border-blue-500 border-t-transparent`}
        aria-label="Loading"
      />
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}
