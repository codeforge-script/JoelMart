const checkoutForm = document.getElementById("checkoutForm");
const checkoutMessage = document.getElementById("checkoutMessage");
const orderResult = document.getElementById("orderResult");

checkoutForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const userData = localStorage.getItem("joelmartUser");

    if (!userData) {
        checkoutMessage.textContent = "Please login first.";
        return;
    }

    const user = JSON.parse(userData);

    const shippingAddress =
        document.getElementById("shippingAddress").value.trim();

    if (!shippingAddress) {
        checkoutMessage.textContent =
            "Please enter your shipping address.";
        return;
    }

    checkoutMessage.textContent = "Placing order...";
    orderResult.innerHTML = "";

    try {

        const order = await apiRequest(
            `/orders?buyerId=${user.id}&shippingAddress=${encodeURIComponent(shippingAddress)}`,
            {
                method: "POST"
            }
        );

        localStorage.setItem("joelmartOrderId", order.id);

        checkoutMessage.textContent =
            "Order placed successfully!";

        orderResult.innerHTML = `
            <h3>Order Created</h3>

            <p>Order ID: ${order.id}</p>
            <p>Total Amount: ₹${order.totalAmount}</p>
            <p>Status: ${order.status}</p>
            <p>Shipping Address: ${order.shippingAddress}</p>

            <br>

            <a href="payment.html">
                <button type="button">Proceed to Payment</button>
            </a>
        `;

        checkoutForm.style.display = "none";

    } catch (error) {

        checkoutMessage.textContent =
            "Unable to place order: " + error.message;
    }
});