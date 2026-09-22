const productContainer = document.getElementById("productContainer");
const productMessage = document.getElementById("productMessage");
const searchForm = document.getElementById("searchForm");
const categorySelect = document.getElementById("categorySelect");

function displayProducts(products) {

    productContainer.innerHTML = "";

    if (!products || products.length === 0) {
        productMessage.textContent = "No products found.";
        return;
    }

    productMessage.textContent = "";

    products.forEach(product => {

        const productCard = document.createElement("div");

        const imageUrl =
            product.imageUrl ||
            "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80";

        productCard.innerHTML = `
            <img
                src="${imageUrl}"
                alt="${product.name}"
                onerror="this.src='https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80'"
            >

            <h3>${product.name}</h3>

            <p>${product.description}</p>

            <p>
                <strong>Price:</strong>
                ₹${product.price}
            </p>

            <p>
                <strong>Category:</strong>
                ${product.category}
            </p>

            <p>
                <strong>Stock:</strong>
                ${product.stock}
            </p>

            <button onclick="viewProductDetails(${product.id})">
                View Details
            </button>

            <button onclick="addProductToCart(${product.id})">
                Add to Cart
            </button>
        `;

        productContainer.appendChild(productCard);
    });
}

async function loadProducts() {

    productMessage.textContent = "Loading products...";
    productContainer.innerHTML = "";

    try {

        const products = await getProducts();

        displayProducts(products);

    } catch (error) {

        productMessage.textContent =
            "Unable to load products: " + error.message;
    }
}

async function searchForProduct(name) {

    if (!name) {
        loadProducts();
        return;
    }

    productMessage.textContent = "Searching...";
    productContainer.innerHTML = "";

    try {

        const products = await searchProducts(name);

        displayProducts(products);

    } catch (error) {

        productMessage.textContent =
            "Search failed: " + error.message;
    }
}

async function filterByCategory(category) {

    if (!category) {
        loadProducts();
        return;
    }

    productMessage.textContent = "Loading category...";
    productContainer.innerHTML = "";

    try {

        const products =
            await getProductsByCategory(category);

        displayProducts(products);

    } catch (error) {

        productMessage.textContent =
            "Unable to load category: " + error.message;
    }
}

function viewProductDetails(productId) {

    window.location.href =
        `product-details.html?id=${productId}`;
}

if (searchForm) {

    searchForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const name =
            document.getElementById("searchInput")
                .value
                .trim();

        searchForProduct(name);
    });
}

if (categorySelect) {

    categorySelect.addEventListener("change", function () {

        filterByCategory(this.value);

    });
}

async function addProductToCart(productId) {

    const userData =
        localStorage.getItem("joelmartUser");

    if (!userData) {
        alert("Please login first.");
        return;
    }

    const user = JSON.parse(userData);

    if (user.role !== "BUYER") {
        alert("Only buyers can add products to the cart.");
        return;
    }

    try {

        await addToCart(
            user.id,
            productId,
            1
        );

        alert(
            "Product added to cart successfully!"
        );

    } catch (error) {

        alert(
            "Unable to add product: " +
            error.message
        );
    }
}

loadProducts();