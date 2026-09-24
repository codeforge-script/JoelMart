const loginForm =
    document.getElementById("loginForm");

const registerForm =
    document.getElementById("registerForm");

const otpForm =
    document.getElementById("otpForm");

let registeredEmail = "";

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const email =
                document.getElementById(
                    "loginEmail"
                ).value.trim();

            const password =
                document.getElementById(
                    "loginPassword"
                ).value;

            const loginMessage =
                document.getElementById(
                    "loginMessage"
                );

            loginMessage.textContent =
                "Logging in...";

            try {

                const data =
                    await loginUser(
                        email,
                        password
                    );

                localStorage.setItem(
                    "joelmartUser",
                    JSON.stringify(data)
                );

                loginMessage.textContent =
                    "Login successful!";

                setTimeout(
                    function() {

                        if (
                            data.role ===
                            "ADMIN"
                        ) {

                            window.location.href =
                                "admin.html";

                        } else if (
                            data.role ===
                            "SELLER"
                        ) {

                            window.location.href =
                                "seller.html";

                        } else {

                            window.location.href =
                                "dashboard.html";
                        }

                    },
                    500
                );

            } catch (error) {

                loginMessage.textContent =
                    error.message;
            }
        }
    );
}

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const fullName =
                document.getElementById(
                    "registerName"
                ).value.trim();

            const email =
                document.getElementById(
                    "registerEmail"
                ).value.trim();

            const password =
                document.getElementById(
                    "registerPassword"
                ).value;

            const registerMessage =
                document.getElementById(
                    "registerMessage"
                );

            const registerButton =
                document.getElementById(
                    "registerButton"
                );

            registerMessage.textContent =
                "Creating account...";

            registerButton.disabled =
                true;

            try {

                const response =
                    await fetch(
                        "http://localhost:8080/api/users/register",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    fullName:
                                        fullName,

                                    email:
                                        email,

                                    password:
                                        password
                                })
                        }
                    );

                const result =
                    await response.text();

                if (!response.ok) {

                    throw new Error(
                        result
                    );
                }

                registeredEmail =
                    email;

                registerMessage.textContent =
                    "OTP sent successfully to your email.";

                document.getElementById(
                    "otpSection"
                ).style.display =
                    "block";

                document.getElementById(
                    "otpInput"
                ).focus();

                document.getElementById(
                    "registerButton"
                ).style.display =
                    "none";

                document.getElementById(
                    "registerName"
                ).readOnly =
                    true;

                document.getElementById(
                    "registerEmail"
                ).readOnly =
                    true;

                document.getElementById(
                    "registerPassword"
                ).readOnly =
                    true;

            } catch (error) {

                registerMessage.textContent =
                    error.message;

                registerButton.disabled =
                    false;
            }
        }
    );
}

if (otpForm) {

    otpForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const otp =
                document.getElementById(
                    "otpInput"
                ).value.trim();

            const otpMessage =
                document.getElementById(
                    "otpMessage"
                );

            const verifyOtpButton =
                document.getElementById(
                    "verifyOtpButton"
                );

            if (!registeredEmail) {

                otpMessage.textContent =
                    "Registration email not found.";

                return;
            }

            if (
                !/^\d{6}$/.test(otp)
            ) {

                otpMessage.textContent =
                    "Please enter a valid 6-digit OTP.";

                return;
            }

            otpMessage.textContent =
                "Verifying OTP...";

            verifyOtpButton.disabled =
                true;

            try {

                const response =
                    await fetch(
                        "http://localhost:8080/api/users/verify-otp",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    email:
                                        registeredEmail,

                                    otp:
                                        otp
                                })
                        }
                    );

                const result =
                    await response.text();

                if (!response.ok) {

                    throw new Error(
                        result
                    );
                }

                otpMessage.textContent =
                    "Email verified successfully!";

                setTimeout(
                    function() {

                        window.location.href =
                            "index.html";

                    },
                    1000
                );

            } catch (error) {

                otpMessage.textContent =
                    error.message;

                verifyOtpButton.disabled =
                    false;
            }
        }
    );
}