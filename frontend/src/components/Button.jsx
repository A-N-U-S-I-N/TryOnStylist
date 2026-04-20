export default function Button({ variant = 'primary', size = 'md', loading = false, children, className = '', disabled, ...rest }) {
    const baseStyles = 'font-semibold tracking-wider uppercase transition-colors duration-200 flex items-center justify-center rounded-sm';
  
    const variantStyles = {
      primary: 'bg-black text-white hover:opacity-90',
      secondary: 'border border-black text-black bg-white hover:bg-gray-50',
      success: 'bg-green-600 hover:bg-green-700 text-white',
      danger: 'bg-red-600 hover:bg-red-700 text-white'
    };
  
    const sizeStyles = {
      sm: 'py-1 px-3 text-sm',
      md: 'py-2 px-5 text-sm',
      lg: 'py-3 px-8 text-base',
    };
  
    return (
      <button
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className} ${
          (disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={disabled || loading}
        {...rest}
      >
        {loading ? (
          <svg className="w-5 h-5 mr-3 -ml-1 text-current animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : children}
      </button>
    );
  }