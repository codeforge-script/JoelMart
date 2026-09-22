const addProductForm = document.getElementById("addProductForm");
const addProductMessage = document.getElementById("addProductMessage");
const sellerProductsContainer =
    document.getElementById("sellerProductsContainer");
const sellerProductsMessage =
    document.getElementById("sellerProductsMessage");
const sellerOrdersContainer =
    document.getElementById("sellerOrdersContainer");

function getLoggedInUser() {

    const userData = localStorage.getItem("joelmartUser");

    if (!userData) {
        return null;
    }

    try {
        return JSON.parse(userData);
    } catch {
        return null;
    }
}

function logoutUser() {

    localStorage.removeItem("joelmartUser");
    localStorage.removeItem("joelmartOrderId");

    window.location.href = "index.html";
}

const currentUser = getLoggedInUser();

if (!currentUser) {

    window.location.href = "index.html";

} else if (currentUser.role !== "SELLER") {

    window.location.href = "dashboard.html";
}

if (addProductForm) {

    addProductForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const user = getLoggedInUser();

        if (!user) {
            addProductMessage.textContent = "Please login first.";
            return;
        }

        if (user.role !== "SELLER") {
            addProductMessage.textContent =
                "Only sellers can add products.";
            return;
        }

        const product = {
            name: document.getElementById("productName").value.trim(),
            description:
                document.getElementById("productDescription").value.trim(),
            price: Number(
                document.getElementById("productPrice").value
            ),
            stock: Number(
                document.getElementById("productStock").value
            ),
            category:
                document.getElementById("productCategory").value.trim(),
            imageUrl:
                document.getElementById("productImage").value.trim()
        };

        addProductMessage.textContent = "Adding product...";

        try {

            const response = await apiRequest(
                `/products?sellerId=${user.id}`,
                {
                    method: "POST",
                    body: JSON.stringify(product)
                }
            );

            addProductMessage.textContent =
                `Product added successfully! Product ID: ${response.id}`;

            addProductForm.reset();

            loadSellerProducts();

        } catch (error) {

            addProductMessage.textContent =
                "Unable to add product: " + error.message;
        }
    });
}

async function loadSellerProducts() {

    const user = getLoggedInUser();

    if (!user) {
        sellerProductsMessage.textContent = "Please login first.";
        return;
    }

    if (user.role !== "SELLER") {
        sellerProductsMessage.textContent =
            "Only sellers can view this page.";
        return;
    }

    sellerProductsMessage.textContent = "Loading products...";
    sellerProductsContainer.innerHTML = "";

    try {

        const products = await getProducts();

        const myProducts = products.filter(product =>
            product.seller &&
            product.seller.id === user.id
        );

        sellerProductsMessage.textContent = "";

        if (myProducts.length === 0) {
            sellerProductsMessage.textContent =
                "You have no products.";
            return;
        }

        myProducts.forEach(product => {

            const productCard = document.createElement("div");

            productCard.innerHTML = `
                <h3>${product.name}</h3>

                <p>Description: ${product.description}</p>

                <p>Price: ₹${product.price}</p>

                <p>Stock: ${product.stock}</p>

                <p>Category: ${product.category}</p>

                <button onclick="editSellerProduct(${product.id})">
                    Edit
                </button>

                <button onclick="deleteSellerProduct(${product.id})">
                    Delete
                </button>

                <hr>
            `;

            sellerProductsContainer.appendChild(productCard);
        });

    } catch (error) {

        sellerProductsMessage.textContent =
            "Unable to load products: " + error.message;
    }
}

async function editSellerProduct(productId) {

    const user = getLoggedInUser();

    if (!user) {
        alert("Please login first.");
        return;
    }

    const name = prompt("Enter new product name:");

    if (name === null) {
        return;
    }

    const description = prompt("Enter new description:");

    if (description === null) {
        return;
    }

    const price = prompt("Enter new price:");

    if (price === null) {
        return;
    }

    const stock = prompt("Enter new stock:");

    if (stock === null) {
        return;
    }

    const category = prompt("Enter new category:");

    if (category === null) {
        return;
    }

    const imageUrl = prompt("Enter new image URL:");

    if (imageUrl === null) {
        return;
    }

    const product = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        stock: Number(stock),
        category: category.trim(),
        imageUrl: imageUrl.trim()
    };

    try {

        await apiRequest(
            `/products/${productId}?sellerId=${user.id}`,
            {
                method: "PUT",
                body: JSON.stringify(product)
            }
        );

        alert("Product updated successfully!");

        loadSellerProducts();

    } catch (error) {

        alert("Unable to update product: " + error.message);
    }
}

async function deleteSellerProduct(productId) {

    const user = getLoggedInUser();

    if (!user) {
        alert("Please login first.");
        return;
    }

    const confirmed =
        confirm("Are you sure you want to delete this product?");

    if (!confirmed) {
        return;
    }

    try {

        await apiRequest(
            `/products/${productId}?sellerId=${user.id}`,
            {
                method: "DELETE"
            }
        );

        alert("Product deleted successfully!");

        loadSellerProducts();

    } catch (error) {

        alert("Unable to delete product: " + error.message);
    }
}

async function loadSellerOrders() {

    const user = getLoggedInUser();

    if (!user) {
        sellerOrdersContainer.textContent =
            "Please login first.";
        return;
    }

    if (user.role !== "SELLER") {
        sellerOrdersContainer.textContent =
            "Only sellers can view customer orders.";
        return;
    }

    sellerOrdersContainer.textContent =
        "Loading customer orders...";

    try {

        const orderItems = await apiRequest(
            `/orders/seller?sellerId=${user.id}`
        );

        sellerOrdersContainer.innerHTML = "";

        if (!orderItems || orderItems.length === 0) {
            sellerOrdersContainer.textContent =
                "No customer orders found.";
            return;
        }

        orderItems.forEach(item => {

            const orderCard = document.createElement("div");

            orderCard.innerHTML = `
                <h3>Order #${item.order.id}</h3>

                <p>Product: ${item.product.name}</p>

                <p>Quantity: ${item.quantity}</p>

                <p>Price: ₹${item.price}</p>

                <p>Order Status: ${item.order.status}</p>

                <button onclick="updateSellerOrderStatus(${item.order.id})">
                    Update Status
                </button>

                <hr>
            `;

            sellerOrdersContainer.appendChild(orderCard);
        });

    } catch (error) {

        sellerOrdersContainer.textContent =
            "Unable to load orders: " + error.message;
    }
}

async function updateSellerOrderStatus(orderId) {

    const user = getLoggedInUser();

    if (!user) {
        alert("Please login first.");
        return;
    }

    const status = prompt(
        "Enter status: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED"
    );

    if (!status) {
        return;
    }

    try {

        await apiRequest(
            `/orders/${orderId}/status?sellerId=${user.id}&status=${encodeURIComponent(status)}`,
            {
                method: "PUT"
            }
        );

        alert("Order status updated successfully!");

        loadSellerOrders();

    } catch (error) {

        alert("Unable to update order status: " + error.message);
    }
}

loadSellerProducts();