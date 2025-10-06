function initializePaystack(orderDetails) {
    let handler = PaystackPop.setup({
        key: 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Replace with your Paystack public key
        email: orderDetails.email,
        amount: orderDetails.amount * 100, // Paystack expects amount in kobo
        currency: 'GHS', // Ghana Cedis
        ref: 'EPC_' + Math.floor((Math.random() * 1000000000) + 1),
        metadata: {
            custom_fields: [
                {
                    display_name: "Book Title",
                    variable_name: "book_title",
                    value: orderDetails.bookTitle
                },
                {
                    display_name: "Format",
                    variable_name: "format",
                    value: orderDetails.format
                }
            ]
        },
        callback: function(response) {
            // Handle successful payment
            handlePaymentSuccess(response, orderDetails);
        },
        onClose: function() {
            // Handle popup closed
            console.log('Payment window closed');
        }
    });
    handler.openIframe();
}

function handlePaymentSuccess(response, orderDetails) {
    // Verify payment on your server (implement this endpoint)
    fetch('/verify-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            reference: response.reference,
            orderDetails: orderDetails
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            // Show success modal
            showSuccessModal(orderDetails);
            // If digital product, provide download link
            if (orderDetails.format === 'digital') {
                provideDigitalDownload(orderDetails.bookId);
            }
        }
    })
    .catch(error => {
        console.error('Payment verification failed:', error);
        alert('Payment verification failed. Please contact support.');
    });
}
