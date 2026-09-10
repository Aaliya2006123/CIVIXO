// ===============================
// CIVIXO ADMIN LOGIN
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    const loginButton =
        document.getElementById("adminLoginBtn");

    const usernameInput =
        document.getElementById("adminUsername");

    const passwordInput =
        document.getElementById("adminPassword");

    const message =
        document.getElementById("adminLoginMessage");


    if (!loginButton) {
        return;
    }


    loginButton.addEventListener(
        "click",
        function () {

            const username =
                usernameInput.value.trim();

            const password =
                passwordInput.value.trim();


            // Empty fields
            if (!username || !password) {

                message.innerHTML = `
                    <div style="
                        padding:15px;
                        margin-top:15px;
                        border-radius:12px;
                        background:#E7D5D1;
                        color:#4D0E13;
                    ">
                        ❌ Please enter both
                        username and password.
                    </div>
                `;

                return;
            }


            // Demo admin credentials
            const ADMIN_USERNAME = "admin";

            const ADMIN_PASSWORD = "civixo123";


            if (
                username === ADMIN_USERNAME &&
                password === ADMIN_PASSWORD
            ) {

                // Save login status
                localStorage.setItem(
                    "civixoAdminLoggedIn",
                    "true"
                );


                message.innerHTML = `
                    <div style="
                        padding:15px;
                        margin-top:15px;
                        border-radius:12px;
                        background:#D8C4AC;
                        color:#4D0E13;
                    ">
                        ✅ Login successful!
                        <br><br>
                        Opening Admin Dashboard...
                    </div>
                `;


                setTimeout(
                    function () {

                        window.location.href =
                            "admin-dashboard.html";

                    },
                    800
                );


            } else {

                message.innerHTML = `
                    <div style="
                        padding:15px;
                        margin-top:15px;
                        border-radius:12px;
                        background:#E7D5D1;
                        color:#4D0E13;
                    ">
                        ❌ Invalid username or password.
                    </div>
                `;
            }

        }
    );

});