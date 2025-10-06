class ErrorHandler {
    static init() {
        window.onerror = function(msg, url, lineNo, columnNo, error) {
            ErrorHandler.logError({
                message: msg,
                url: url,
                lineNo: lineNo,
                columnNo: columnNo,
                error: error?.stack
            });
            return false;
        };

        window.addEventListener('unhandledrejection', function(event) {
            ErrorHandler.logError({
                message: 'Unhandled Promise Rejection',
                error: event.reason
            });
        });
    }

    static logError(errorData) {
        fetch('/api/log-error', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(errorData)
        }).catch(console.error);

        // Show user-friendly error message
        this.showErrorNotification();
    }

    static showErrorNotification() {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.textContent = 'An error occurred. Please try again or contact support.';
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 5000);
    }
}

ErrorHandler.init();
