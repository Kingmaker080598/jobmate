export function Button({ children, className = '', ...props }) {
    return (
      <button
        {...props}
        className={`bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded transition duration-200 ${className}`}
      >
        {children}
      </button>
    )
  }
  