const cartContainer = document.getElementById("cartContainer");
const cartMessage = document.getElementById("cartMessage");
const cartTotal = document.getElementById("cartTotal");

async function loadCart() {

    cartMessage.textContent = "Loading cart...";
    cartContainer.innerHTML = "";
    cartTotal.textContent = "";

    const userData = localStorage.getItem("joelmartUser");

    if (!userData) {
        cartMessage.textContent = "Please login first.";
        return;
    }

    const user = JSON.parse(userData);

    try {

        const cartItems = await getCart(user.id);

        cartMessage.textContent = "";

        if (!cartItems || cartItems.length === 0) {
            cartMessage.textContent = "Your cart is empty.";
            return;
        }

        let total = 0;

        cartItems.forEach(item => {

            const price = Number(item.product.price);
            const quantity = Number(item.quantity);
            const itemTotal = price * quantity;

            total += itemTotal;

            const cartItem = document.createElement("div");

            cartItem.innerHTML = `
                <h3>${item.product.name}</h3>

                <p>Price: ₹${price}</p>

                <button onclick="changeQuantity(${item.id}, ${quantity - 1})">
                    -
                </button>

                <span> ${quantity} </span>

                <button onclick="changeQuantity(${item.id}, ${quantity + 1})">
                    +
                </button>

                <p>Item Total: ₹${itemTotal}</p>

                <button onclick="removeCartItem(${item.id})">
                    Remove
                </button>

                <hr>
            `;

            cartContainer.appendChild(cartItem);
        });

        cartTotal.textContent = `Cart Total: ₹${total}`;

    } catch (error) {

        cartMessage.textContent =
            "Unable to load cart: " + error.message;
    }
}

async function changeQuantity(cartItemId, newQuantity) {

    if (newQuantity < 1) {
        return;
    }

    const userData = localStorage.getItem("joelmartUser");

    if (!userData) {
        alert("Please login first.");
        return;
    }

    const user = JSON.parse(userData);

    try {

        await apiRequest(
            `/cart/${cartItemId}?buyerId=${user.id}&quantity=${newQuantity}`,
            {
                method: "PUT"
            }
        );

        loadCart();

    } catch (error) {

        alert("Unable to update quantity: " + error.message);
    }
}

async function removeCartItem(cartItemId) {

    const userData = localStorage.getItem("joelmartUser");

    if (!userData) {
        alert("Please login first.");
        return;
    }

    const user = JSON.parse(userData);

    try {

        await apiRequest(
            `/cart/${cartItemId}?buyerId=${user.id}`,
            {
                method: "DELETE"
            }
        );

        alert("Product removed from cart successfully!");

        loadCart();

    } catch (error) {

        alert("Unable to remove product: " + error.message);
    }
}

loadCart();