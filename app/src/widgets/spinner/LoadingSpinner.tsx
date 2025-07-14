const LoadingSpinner = ({
    message = "Loading...",
    size = "md",
    fullScreen = true,
    className = "",
}: LoadingSpinnerProps) => {
    const sizeClasses = {
        sm: "h-6 w-6 border-2",
        md: "h-12 w-12 border-4",
        lg: "h-16 w-16 border-4",
    };

    const textSizeClasses = {
        sm: "text-sm",
        md: "text-lg",
        lg: "text-xl",
    };

    const containerClasses = fullScreen
        ? "flex h-screen w-screen items-center justify-center"
        : "flex items-center justify-center py-20";

    return (
        <div className={`${containerClasses} ${className}`}>
            <div className="flex flex-col items-center gap-4">
                <div
                    className={`${sizeClasses[size]} animate-spin rounded-full border-gray-300 border-t-black`}
                ></div>
                <p
                    className={`font-amstel font-[400] text-gray-700 ${textSizeClasses[size]}`}
                >
                    {message}
                </p>
            </div>
        </div>
    );
};

export default LoadingSpinner;
