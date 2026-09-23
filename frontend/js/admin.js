const adminData =
    localStorage.getItem("joelmartUser");

if (!adminData) {

    window.location.href =
        "index.html";
}

const currentAdmin =
    JSON.parse(adminData);

if (currentAdmin.role !== "ADMIN") {

    alert(
        "Access denied. Admin only."
    );

    window.location.href =
        "dashboard.html";
}

const ADMIN_API_URL =
    "http://localhost:8080/api";

let adminProductsCache = [];

const adminWelcome =
    document.getElementById(
        "adminWelcome"
    );

if (adminWelcome) {

    adminWelcome.textContent =
        `Welcome, ${currentAdmin.fullName}`;
}

function logoutAdmin() {

    localStorage.removeItem(
        "joelmartUser"
    );

    window.location.href =
        "index.html";
}

async function loadUsers() {

    const container =
        document.getElementById(
            "usersContainer"
        );

    container.innerHTML =
        "<p>Loading users...</p>";

    try {

        const response =
            await fetch(
                `${ADMIN_API_URL}/admin/users?adminId=${currentAdmin.id}`
            );

        if (!response.ok) {

            throw new Error(
                await response.text()
            );
        }

        const users =
            await response.json();

        if (users.length === 0) {

            container.innerHTML =
                "<p>No users found.</p>";

            return;
        }

        let html = `
            <div class="admin-table-wrapper">

                <table>

                    <thead>

                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Action</th>
                        </tr>

                    </thead>

                    <tbody>
        `;

        users.forEach(user => {

            let action = "";

            if (
                user.id ===
                currentAdmin.id
            ) {

                action = `
                    <span>
                        Current Admin
                    </span>
                `;

            } else {

                action = `
                    <select
                        onchange="
                            changeUserRole(
                                ${user.id},
                                this.value
                            )
                        "
                    >

                        <option value="BUYER"
                            ${user.role === "BUYER" ? "selected" : ""}>
                            BUYER
                        </option>

                        <option value="SELLER"
                            ${user.role === "SELLER" ? "selected" : ""}>
                            SELLER
                        </option>

                        <option value="ADMIN"
                            ${user.role === "ADMIN" ? "selected" : ""}>
                            ADMIN
                        </option>

                    </select>
                `;
            }

            html += `
                <tr>

                    <td>
                        ${user.id}
                    </td>

                    <td>
                        ${user.fullName}
                    </td>

                    <td>
                        ${user.email}
                    </td>

                    <td>
                        ${user.role}
                    </td>

                    <td>
                        ${action}
                    </td>

                </tr>
            `;
        });

        html += `
                    </tbody>

                </table>

            </div>
        `;

        container.innerHTML =
            html;

    } catch (error) {

        container.innerHTML =
            `<p>Error loading users: ${error.message}</p>`;
    }
}

async function changeUserRole(
    userId,
    role
) {

    try {

        const response =
            await fetch(
                `${ADMIN_API_URL}/admin/users/${userId}/role?adminId=${currentAdmin.id}&role=${role}`,
                {
                    method: "PUT"
                }
            );

        if (!response.ok) {

            throw new Error(
                await response.text()
            );
        }

        alert(
            "User role updated successfully."
        );

        loadUsers();

        loadDashboardStats();

    } catch (error) {

        alert(
            "Unable to update user role: " +
            error.message
        );
    }
}

async function loadAllProducts() {

    const container =
        document.getElementById(
            "adminProductsContainer"
        );

    container.innerHTML =
        "<p>Loading products...</p>";

    try {

        const response =
            await fetch(
                `${ADMIN_API_URL}/admin/products?adminId=${currentAdmin.id}`
            );

        if (!response.ok) {

            throw new Error(
                await response.text()
            );
        }

        const products =
            await response.json();

        adminProductsCache =
            products;

        loadProductCategories();

        renderAdminProducts(
            adminProductsCache
        );

    } catch (error) {

        container.innerHTML =
            `<p>Error loading products: ${error.message}</p>`;
    }
}

function loadProductCategories() {

    const categorySelect =
        document.getElementById(
            "adminProductCategory"
        );

    if (!categorySelect) {
        return;
    }

    const currentCategory =
        categorySelect.value;

    const categories =
        [...new Set(
            adminProductsCache
                .map(product =>
                    product.category
                )
                .filter(category =>
                    category
                )
        )].sort();

    categorySelect.innerHTML = `
        <option value="">
            All Categories
        </option>
    `;

    categories.forEach(category => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            category;

        option.textContent =
            category;

        categorySelect.appendChild(
            option
        );
    });

    if (
        categories.includes(
            currentCategory
        )
    ) {

        categorySelect.value =
            currentCategory;
    }
}

function renderAdminProducts(
    products
) {

    const container =
        document.getElementById(
            "adminProductsContainer"
        );

    const count =
        document.getElementById(
            "adminProductCount"
        );

    if (count) {

        count.textContent =
            `Showing ${products.length} product${products.length === 1 ? "" : "s"}`;
    }

    if (
        !products ||
        products.length === 0
    ) {

        container.innerHTML =
            "<p>No matching products found.</p>";

        return;
    }

    let html = `
        <div class="admin-table-wrapper">

            <table>

                <thead>

                    <tr>

                        <th>Image</th>
                        <th>ID</th>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Category</th>
                        <th>Seller</th>
                        <th>Action</th>

                    </tr>

                </thead>

                <tbody>
    `;

    products.forEach(product => {

        const imageUrl =
            product.imageUrl ||
            "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=300&q=80";

        html += `
            <tr>

                <td>

                    <img
                        src="${imageUrl}"
                        alt="${product.name}"
                        class="admin-product-image"
                        onerror="
                            this.src='https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=300&q=80'
                        "
                    >

                </td>

                <td>
                    ${product.id}
                </td>

                <td>

                    <strong>
                        ${product.name}
                    </strong>

                    <br>

                    ${product.description || ""}

                </td>

                <td>
                    ₹${product.price}
                </td>

                <td>
                    ${product.stock}
                </td>

                <td>
                    ${product.category}
                </td>

                <td>
                    ${product.sellerName}
                </td>

                <td>

                    <button
                        type="button"
                        class="edit-button"
                        onclick="
                            openEditProductModal(
                                ${product.id}
                            )
                        "
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="delete-button"
                        onclick="
                            deleteAdminProduct(
                                ${product.id}
                            )
                        "
                    >
                        Delete
                    </button>

                </td>

            </tr>
        `;
    });

    html += `
                </tbody>

            </table>

        </div>
    `;

    container.innerHTML =
        html;
}

function filterAdminProducts() {

    const searchInput =
        document.getElementById(
            "adminProductSearch"
        );

    const categorySelect =
        document.getElementById(
            "adminProductCategory"
        );

    const searchText =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";

    const selectedCategory =
        categorySelect
            ? categorySelect.value
            : "";

    const filteredProducts =
        adminProductsCache.filter(
            product => {

                const productName =
                    (
                        product.name || ""
                    ).toLowerCase();

                const productCategory =
                    (
                        product.category || ""
                    ).toLowerCase();

                const sellerName =
                    (
                        product.sellerName || ""
                    ).toLowerCase();

                const matchesSearch =
                    !searchText ||
                    productName.includes(
                        searchText
                    ) ||
                    productCategory.includes(
                        searchText
                    ) ||
                    sellerName.includes(
                        searchText
                    );

                const matchesCategory =
                    !selectedCategory ||
                    product.category ===
                    selectedCategory;

                return (
                    matchesSearch &&
                    matchesCategory
                );
            }
        );

    renderAdminProducts(
        filteredProducts
    );
}

function clearProductFilters() {

    const searchInput =
        document.getElementById(
            "adminProductSearch"
        );

    const categorySelect =
        document.getElementById(
            "adminProductCategory"
        );

    if (searchInput) {
        searchInput.value = "";
    }

    if (categorySelect) {
        categorySelect.value = "";
    }

    renderAdminProducts(
        adminProductsCache
    );
}

function openEditProductModal(
    productId
) {

    const product =
        adminProductsCache.find(
            item =>
                item.id === productId
        );

    if (!product) {

        alert(
            "Product information not found."
        );

        return;
    }

    document.getElementById(
        "editProductId"
    ).value =
        product.id;

    document.getElementById(
        "editProductIdDisplay"
    ).textContent =
        `#${product.id}`;

    document.getElementById(
        "editProductName"
    ).value =
        product.name || "";

    document.getElementById(
        "editProductDescription"
    ).value =
        product.description || "";

    document.getElementById(
        "editProductPrice"
    ).value =
        product.price || 0;

    document.getElementById(
        "editProductStock"
    ).value =
        product.stock || 0;

    document.getElementById(
        "editProductCategory"
    ).value =
        product.category || "";

    document.getElementById(
        "editProductImageUrl"
    ).value =
        product.imageUrl || "";

    updateEditImagePreview();

    document.getElementById(
        "editProductModal"
    ).classList.remove(
        "hidden"
    );
}

function closeEditProductModal() {

    document.getElementById(
        "editProductModal"
    ).classList.add(
        "hidden"
    );
}

function updateEditImagePreview() {

    const imageUrl =
        document.getElementById(
            "editProductImageUrl"
        ).value.trim();

    const preview =
        document.getElementById(
            "editProductImagePreview"
        );

    if (!preview) {
        return;
    }

    if (!imageUrl) {

        preview.style.display =
            "none";

        preview.src =
            "";

        return;
    }

    preview.src =
        imageUrl;

    preview.style.display =
        "block";
}

async function saveAdminProduct(
    event
) {

    event.preventDefault();

    const productId =
        document.getElementById(
            "editProductId"
        ).value;

    const name =
        document.getElementById(
            "editProductName"
        ).value.trim();

    const description =
        document.getElementById(
            "editProductDescription"
        ).value.trim();

    const price =
        parseFloat(
            document.getElementById(
                "editProductPrice"
            ).value
        );

    const stock =
        parseInt(
            document.getElementById(
                "editProductStock"
            ).value
        );

    const category =
        document.getElementById(
            "editProductCategory"
        ).value.trim();

    const imageUrl =
        document.getElementById(
            "editProductImageUrl"
        ).value.trim();

    if (!name) {

        alert(
            "Product name is required."
        );

        return;
    }

    if (!description) {

        alert(
            "Product description is required."
        );

        return;
    }

    if (
        isNaN(price) ||
        price < 0
    ) {

        alert(
            "Please enter a valid price."
        );

        return;
    }

    if (
        isNaN(stock) ||
        stock < 0
    ) {

        alert(
            "Please enter a valid stock."
        );

        return;
    }

    if (!category) {

        alert(
            "Product category is required."
        );

        return;
    }

    const updatedProduct = {

        name: name,

        description: description,

        price: price,

        stock: stock,

        category: category,

        imageUrl: imageUrl
    };

    try {

        const response =
            await fetch(
                `${ADMIN_API_URL}/admin/products/${productId}?adminId=${currentAdmin.id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            updatedProduct
                        )
                }
            );

        if (!response.ok) {

            throw new Error(
                await response.text()
            );
        }

        alert(
            "Product updated successfully!"
        );

        closeEditProductModal();

        await loadAllProducts();

        await loadDashboardStats();

    } catch (error) {

        alert(
            "Unable to update product: " +
            error.message
        );
    }
}

async function deleteAdminProduct(
    productId
) {

    const confirmation =
        confirm(
            "Are you sure you want to delete this product?"
        );

    if (!confirmation) {
        return;
    }

    try {

        const response =
            await fetch(
                `${ADMIN_API_URL}/admin/products/${productId}?adminId=${currentAdmin.id}`,
                {
                    method: "DELETE"
                }
            );

        if (!response.ok) {

            throw new Error(
                await response.text()
            );
        }

        alert(
            "Product deleted successfully."
        );

        await loadAllProducts();

        await loadDashboardStats();

    } catch (error) {

        alert(
            "Unable to delete product: " +
            error.message
        );
    }
}

async function loadAllOrders() {

    const container =
        document.getElementById(
            "adminOrdersContainer"
        );

    container.innerHTML =
        "<p>Loading orders...</p>";

    try {

        const response =
            await fetch(
                `${ADMIN_API_URL}/admin/orders?adminId=${currentAdmin.id}`
            );

        if (!response.ok) {

            throw new Error(
                await response.text()
            );
        }

        const orders =
            await response.json();

        if (orders.length === 0) {

            container.innerHTML =
                "<p>No orders found.</p>";

            return;
        }

        let html = `
            <div class="admin-table-wrapper">

                <table>

                    <thead>

                        <tr>

                            <th>Order ID</th>
                            <th>Buyer</th>
                            <th>Total</th>
                            <th>Address</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Action</th>

                        </tr>

                    </thead>

                    <tbody>
        `;

        orders.forEach(order => {

            html += `
                <tr>

                    <td>
                        #${order.id}
                    </td>

                    <td>
                        ${order.buyerName}
                    </td>

                    <td>
                        ₹${order.totalAmount}
                    </td>

                    <td>
                        ${order.shippingAddress || "N/A"}
                    </td>

                    <td>
                        ${order.status}
                    </td>

                    <td>
                        ${order.createdAt || "N/A"}
                    </td>

                    <td>

                        <select
                            onchange="
                                updateAdminOrderStatus(
                                    ${order.id},
                                    this.value
                                )
                            "
                        >

                            <option value="PENDING"
                                ${order.status === "PENDING" ? "selected" : ""}>
                                PENDING
                            </option>

                            <option value="PAID"
                                ${order.status === "PAID" ? "selected" : ""}>
                                PAID
                            </option>

                            <option value="PROCESSING"
                                ${order.status === "PROCESSING" ? "selected" : ""}>
                                PROCESSING
                            </option>

                            <option value="SHIPPED"
                                ${order.status === "SHIPPED" ? "selected" : ""}>
                                SHIPPED
                            </option>

                            <option value="DELIVERED"
                                ${order.status === "DELIVERED" ? "selected" : ""}>
                                DELIVERED
                            </option>

                            <option value="CANCELLED"
                                ${order.status === "CANCELLED" ? "selected" : ""}>
                                CANCELLED
                            </option>

                        </select>

                    </td>

                </tr>
            `;
        });

        html += `
                    </tbody>

                </table>

            </div>
        `;

        container.innerHTML =
            html;

    } catch (error) {

        container.innerHTML =
            `<p>Error loading orders: ${error.message}</p>`;
    }
}

async function updateAdminOrderStatus(
    orderId,
    status
) {

    try {

        const response =
            await fetch(
                `${ADMIN_API_URL}/orders/admin/${orderId}/status?adminId=${currentAdmin.id}&status=${encodeURIComponent(status)}`,
                {
                    method: "PUT"
                }
            );

        if (!response.ok) {

            throw new Error(
                await response.text()
            );
        }

        alert(
            "Order status updated successfully."
        );

        loadAllOrders();

    } catch (error) {

        alert(
            "Unable to update order status: " +
            error.message
        );
    }
}

async function loadDashboardStats() {

    try {

        const [
            usersResponse,
            productsResponse,
            ordersResponse
        ] = await Promise.all([

            fetch(
                `${ADMIN_API_URL}/admin/users?adminId=${currentAdmin.id}`
            ),

            fetch(
                `${ADMIN_API_URL}/admin/products?adminId=${currentAdmin.id}`
            ),

            fetch(
                `${ADMIN_API_URL}/admin/orders?adminId=${currentAdmin.id}`
            )

        ]);

        if (
            !usersResponse.ok ||
            !productsResponse.ok ||
            !ordersResponse.ok
        ) {

            throw new Error(
                "Unable to load dashboard statistics."
            );
        }

        const users =
            await usersResponse.json();

        const products =
            await productsResponse.json();

        const orders =
            await ordersResponse.json();

        document.getElementById(
            "totalUsers"
        ).textContent =
            users.length;

        document.getElementById(
            "totalProducts"
        ).textContent =
            products.length;

        document.getElementById(
            "totalOrders"
        ).textContent =
            orders.length;

    } catch (error) {

        console.error(
            "Dashboard stats error:",
            error
        );
    }
}

const editProductForm =
    document.getElementById(
        "editProductForm"
    );

if (editProductForm) {

    editProductForm.addEventListener(
        "submit",
        saveAdminProduct
    );
}

const editProductModal =
    document.getElementById(
        "editProductModal"
    );

if (editProductModal) {

    editProductModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                editProductModal
            ) {

                closeEditProductModal();
            }
        }
    );
}

const searchInput =
    document.getElementById(
        "adminProductSearch"
    );

if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterAdminProducts
    );
}

const categorySelect =
    document.getElementById(
        "adminProductCategory"
    );

if (categorySelect) {

    categorySelect.addEventListener(
        "change",
        filterAdminProducts
    );
}

const editImageInput =
    document.getElementById(
        "editProductImageUrl"
    );

if (editImageInput) {

    editImageInput.addEventListener(
        "input",
        updateEditImagePreview
    );
}

loadDashboardStats();