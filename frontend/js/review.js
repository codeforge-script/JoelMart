const reviewForm = document.getElementById("reviewForm");
const reviewMessage = document.getElementById("reviewMessage");
const reviewsContainer = document.getElementById("reviewsContainer");

reviewForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const userData = localStorage.getItem("joelmartUser");

    if (!userData) {
        reviewMessage.textContent = "Please login first.";
        return;
    }

    const user = JSON.parse(userData);

    const productId =
        document.getElementById("productId").value;

    const rating =
        document.getElementById("rating").value;

    const comment =
        document.getElementById("comment").value.trim();

    if (!productId || !rating) {
        reviewMessage.textContent =
            "Please select a product and rating.";
        return;
    }

    reviewMessage.textContent = "Submitting review...";

    try {

        const review = await apiRequest(
            `/reviews?buyerId=${user.id}&productId=${productId}&rating=${rating}&comment=${encodeURIComponent(comment)}`,
            {
                method: "POST"
            }
        );

        reviewMessage.textContent =
            "Review submitted successfully!";

        reviewForm.reset();

        document.getElementById("productId").value = productId;

        loadReviews();

    } catch (error) {

        reviewMessage.textContent =
            "Unable to submit review: " + error.message;
    }
});

async function loadReviews() {

    const productId =
        document.getElementById("productId").value;

    if (!productId) {
        return;
    }

    reviewsContainer.innerHTML = "Loading reviews...";

    try {

        const reviews = await apiRequest(
            `/reviews?productId=${productId}`
        );

        reviewsContainer.innerHTML = "";

        if (!reviews || reviews.length === 0) {
            reviewsContainer.innerHTML =
                "<p>No reviews yet.</p>";
            return;
        }

        reviews.forEach(review => {

            const reviewCard = document.createElement("div");

            reviewCard.innerHTML = `
                <h3>Rating: ${review.rating}/5</h3>
                <p>${review.comment || "No comment"}</p>
                <p>Date: ${review.createdAt}</p>
                <hr>
            `;

            reviewsContainer.appendChild(reviewCard);
        });

    } catch (error) {

        reviewsContainer.innerHTML =
            "Unable to load reviews: " + error.message;
    }
}