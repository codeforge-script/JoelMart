const paymentForm = document.getElementById("paymentForm");
const paymentMessage = document.getElementById("paymentMessage");
const orderDetails = document.getElementById("orderDetails");
const paymentResult = document.getElementById("paymentResult");

const orderId = localStorage.getItem("joelmartOrderId");

if (!orderId) {
    paymentMessage.textContent = "No order found. Please place an order first.";
    paymentForm.style.display = "none";
} else {

    const userData = localStorage.getItem("joelmartUser");

    if (!userData) {
        paymentMessage.textContent = "Please login first.";
        paymentForm.style.display = "none";
    }
}

paymentForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const userData = localStorage.getItem("joelmartUser");

    if (!userData) {
        paymentMessage.textContent = "Please login first.";
        return;
    }

    const user = JSON.parse(userData);

    const paymentMethod =
        document.getElementById("paymentMethod").value;

    if (!paymentMethod) {
        paymentMessage.textContent =
            "Please select a payment method.";
        return;
    }

    paymentMessage.textContent = "Processing payment...";
    paymentResult.innerHTML = "";

    try {

        const payment = await apiRequest(
            `/payments?orderId=${orderId}&buyerId=${user.id}&paymentMethod=${paymentMethod}`,
            {
                method: "POST"
            }
        );

        paymentMessage.textContent = "Payment completed successfully!";

        paymentResult.innerHTML = `
            <h3>Payment Successful</h3>

            <p>Payment ID: ${payment.id}</p>
            <p>Payment Method: ${payment.paymentMethod}</p>
            <p>Amount: ₹${payment.amount}</p>
            <p>Status: ${payment.status}</p>
            <p>Transaction ID: ${payment.transactionId || "COD"}</p>

            <br>

            <a href="products.html">Continue Shopping</a>
        `;

        paymentForm.style.display = "none";

    } catch (error) {

        paymentMessage.textContent =
            "Payment failed: " + error.message;
    }
});