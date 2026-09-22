const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;
        const loginMessage = document.getElementById("loginMessage");

        loginMessage.textContent = "Logging in...";

        try {
            const data = await loginUser(email, password);

            localStorage.setItem("joelmartUser", JSON.stringify(data));

            loginMessage.textContent = "Login successful!";

            setTimeout(() => {

                if (data.role === "SELLER") {
                    window.location.href = "seller.html";
                } else if (data.role === "BUYER") {
                    window.location.href = "dashboard.html";
                } else {
                    window.location.href = "dashboard.html";
                }

            }, 500);

        } catch (error) {
            loginMessage.textContent = error.message;
        }
    });
}

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const fullName =
            document.getElementById("registerName").value.trim();

        const email =
            document.getElementById("registerEmail").value.trim();

        const password =
            document.getElementById("registerPassword").value;

        const registerMessage =
            document.getElementById("registerMessage");

        registerMessage.textContent = "Creating account...";

        try {

            const data = await registerUser(
                fullName,
                email,
                password
            );

            registerMessage.textContent = data;

            registerForm.reset();

        } catch (error) {

            registerMessage.textContent = error.message;
        }
    });
}