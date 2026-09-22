const ordersContainer = document.getElementById("ordersContainer");
const ordersMessage = document.getElementById("ordersMessage");

async function loadOrders() {

    const userData = localStorage.getItem("joelmartUser");

    if (!userData) {
        ordersMessage.textContent = "Please login first.";
        return;
    }

    const user = JSON.parse(userData);

    ordersMessage.textContent = "Loading orders...";
    ordersContainer.innerHTML = "";

    try {

        const orders = await apiRequest(
            `/orders?buyerId=${user.id}`
        );

        ordersMessage.textContent = "";

        if (!orders || orders.length === 0) {
            ordersMessage.textContent = "You have no orders yet.";
            return;
        }

        orders.forEach(order => {

            const orderCard = document.createElement("div");

            orderCard.innerHTML = `
                <h3>Order #${order.id}</h3>

                <p>Total Amount: ₹${order.totalAmount}</p>

                <p>Status: ${order.status}</p>

                <p>Shipping Address: ${order.shippingAddress}</p>

                <p>Order Date: ${order.createdAt}</p>

                <hr>
            `;

            ordersContainer.appendChild(orderCard);
        });

    } catch (error) {

        ordersMessage.textContent =
            "Unable to load orders: " + error.message;
    }
}

loadOrders();