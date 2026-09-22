const welcomeMessage = document.getElementById("welcomeMessage");

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

const user = getLoggedInUser();

if (!user) {

    window.location.href = "index.html";

} else if (user.role !== "BUYER") {

    window.location.href = "seller.html";

} else {

    welcomeMessage.textContent =
        `Welcome, ${user.fullName}!`;
}