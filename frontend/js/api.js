const API_BASE_URL = "http://localhost:8080/api";

async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    const text = await response.text();

    let data;

    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text;
    }

    if (!response.ok) {
        throw new Error(
            typeof data === "string"
                ? data
                : data?.message || "Request failed"
        );
    }

    return data;
}

async function registerUser(fullName, email, password) {
    return apiRequest("/users/register", {
        method: "POST",
        body: JSON.stringify({
            fullName,
            email,
            password
        })
    });
}

async function loginUser(email, password) {
    return apiRequest("/users/login", {
        method: "POST",
        body: JSON.stringify({
            email,
            password
        })
    });
}

async function getProducts() {
    return apiRequest("/products");
}

async function getProduct(productId) {
    return apiRequest(`/products/${productId}`);
}

async function searchProducts(name) {
    return apiRequest(
        `/products/search?name=${encodeURIComponent(name)}`
    );
}

async function getProductsByCategory(category) {
    return apiRequest(
        `/products/category?category=${encodeURIComponent(category)}`
    );
}

async function addToCart(buyerId, productId, quantity) {
    return apiRequest(
        `/cart?buyerId=${buyerId}&productId=${productId}&quantity=${quantity}`,
        {
            method: "POST"
        }
    );
}

async function getCart(buyerId) {
    return apiRequest(`/cart?buyerId=${buyerId}`);
}