const productMessage =
    document.getElementById("productMessage");

const productDetails =
    document.getElementById("productDetails");

const reviewsContainer =
    document.getElementById("reviewsContainer");

const urlParams =
    new URLSearchParams(window.location.search);

const productId =
    urlParams.get("id");

const defaultImage =
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80";

async function loadProductDetails() {

    if (!productId) {

        productMessage.textContent =
            "Product ID not found.";

        return;
    }

    productMessage.textContent =
        "Loading product...";

    try {

        const product =
            await getProduct(productId);

        productMessage.textContent = "";

        const imageUrl =
            product.imageUrl || defaultImage;

        productDetails.innerHTML = `
            <div class="product-detail-image">
                <img
                    src="${imageUrl}"
                    alt="${product.name}"
                    onerror="this.src='${defaultImage}'"
                >
            </div>

            <div class="product-detail-info">

                <h2>${product.name}</h2>

                <p class="product-description">
                    ${product.description}
                </p>

                <p>
                    <strong>Price:</strong>
                    ₹${product.price}
                </p>

                <p>
                    <strong>Category:</strong>
                    ${product.category}
                </p>

                <p>
                    <strong>Available Stock:</strong>
                    ${product.stock}
                </p>

                <p>
                    <strong>Seller:</strong>
                    ${product.seller?.fullName || "JoelMart Seller"}
                </p>

                <label for="quantity">
                    Quantity
                </label>

                <input
                    type="number"
                    id="quantity"
                    value="1"
                    min="1"
                    max="${product.stock}"
                >

                <br><br>

                <button
                    type="button"
                    onclick="addProductToCart(${product.id})"
                >
                    Add to Cart
                </button>

                <a href="cart.html">
                    <button
                        type="button"
                    >
                        View Cart
                    </button>
                </a>

            </div>
        `;

        loadProductReviews();

    } catch (error) {

        productMessage.textContent =
            "Unable to load product: " +
            error.message;
    }
}

async function addProductToCart(productId) {

    const userData =
        localStorage.getItem("joelmartUser");

    if (!userData) {

        alert("Please login first.");

        return;
    }

    const user =
        JSON.parse(userData);

    if (user.role !== "BUYER") {

        alert(
            "Only buyers can add products to the cart."
        );

        return;
    }

    const quantity =
        Number(
            document.getElementById("quantity").value
        );

    if (!quantity || quantity < 1) {

        alert(
            "Please enter a valid quantity."
        );

        return;
    }

    try {

        await addToCart(
            user.id,
            productId,
            quantity
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

async function loadProductReviews() {

    reviewsContainer.innerHTML =
        "Loading reviews...";

    try {

        const reviews =
            await apiRequest(
                `/reviews?productId=${productId}`
            );

        reviewsContainer.innerHTML = "";

        if (!reviews || reviews.length === 0) {

            reviewsContainer.innerHTML =
                "<p>No reviews yet.</p>";

            return;
        }

        reviews.forEach(review => {

            const reviewCard =
                document.createElement("div");

            reviewCard.innerHTML = `
                <h3>
                    Rating: ${review.rating}/5
                </h3>

                <p>
                    ${review.comment || "No comment"}
                </p>

                <p>
                    Date: ${review.createdAt}
                </p>
            `;

            reviewsContainer.appendChild(reviewCard);
        });

    } catch (error) {

        reviewsContainer.innerHTML =
            "Unable to load reviews: " +
            error.message;
    }
}

loadProductDetails();