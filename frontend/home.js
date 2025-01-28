document.getElementById('donationForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const fullname = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const amount = document.getElementById('amount').value;
    const currency = document.getElementById('currency').value;
    const data = { fullname, email, amount, currency };
    try {
        const response = await fetch('http://localhost:3000/api/donate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (response.ok) {
            const result = await response.json();
            alert('Donation recorded successfully! Donation ID: ' + result.donationId);
            alert('ThanYour for the donation!!');
            document.getElementById('donationForm').reset();
        } else {
            const errorData = await response.json();
            alert('Error: ' + (errorData.message || 'An error occurred.'));
        }
    } catch (error) {
        console.error('Error submitting donation:', error);
        alert('An error occurred while submitting the donation: ' + error.message);
    }
});
