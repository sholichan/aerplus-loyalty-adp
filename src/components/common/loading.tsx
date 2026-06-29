export function PulseLoading() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-dark">
            <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                    <div className="w-16 h-16 bg-blue-600 rounded-full animate-ping absolute"></div>
                    <div className="w-16 h-16 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
                <p className="text-gray-600 text-sm">Loading content...</p>
            </div>
        </div>
    )
}