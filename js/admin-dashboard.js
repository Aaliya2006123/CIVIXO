// =========================================================
// CIVIXO ADMIN DASHBOARD
// =========================================================

const API_BASE_URL =
    "http://localhost:5000";


document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "🔥 CIVIXO ADMIN DASHBOARD LOADED"
        );


        // =====================================================
        // CHECK LOGIN
        // =====================================================

        const loggedIn =
            localStorage.getItem(
                "civixoAdminLoggedIn"
            );


        if (
            loggedIn !== "true"
        ) {

            window.location.href =
                "admin.html";

            return;

        }


        // =====================================================
        // ELEMENTS
        // =====================================================

        const complaintsContainer =
            document.getElementById(
                "adminComplaintsContainer"
            );


        const searchInput =
            document.getElementById(
                "adminSearch"
            );


        const logoutButton =
            document.getElementById(
                "adminLogoutBtn"
            );


        const adminMessage =
            document.getElementById(
                "adminMessage"
            );


        let complaints = [];


        // =====================================================
        // HTML ESCAPE
        // =====================================================

        function escapeHTML(value) {

            if (
                value === null ||
                value === undefined
            ) {

                return "";

            }


            return String(value)

                .replace(
                    /&/g,
                    "&amp;"
                )

                .replace(
                    /</g,
                    "&lt;"
                )

                .replace(
                    />/g,
                    "&gt;"
                )

                .replace(
                    /"/g,
                    "&quot;"
                )

                .replace(
                    /'/g,
                    "&#039;"
                );

        }


        // =====================================================
        // STATUS ICON
        // =====================================================

        function getStatusIcon(status) {

            if (
                status === "Resolved"
            ) {

                return "🟢";

            }


            if (
                status === "In Progress"
            ) {

                return "🔵";

            }


            if (
                status === "Rejected"
            ) {

                return "🔴";

            }


            return "🟡";

        }


        // =====================================================
        // LOGOUT
        // =====================================================

        if (
            logoutButton
        ) {

            logoutButton.addEventListener(
                "click",
                function () {

                    localStorage.removeItem(
                        "civixoAdminLoggedIn"
                    );


                    window.location.href =
                        "admin.html";

                }
            );

        }


        // =====================================================
        // LOAD COMPLAINTS
        // =====================================================

        async function loadComplaints() {

            if (
                !complaintsContainer
            ) {

                return;

            }


            complaintsContainer.innerHTML =

                "<p>🔄 Loading complaints...</p>";


            try {

                const response =
                    await fetch(
                        API_BASE_URL +
                        "/api/complaints"
                    );


                const data =
                    await response.json();


                console.log(
                    "📥 Backend complaints:",
                    data
                );


                if (
                    !response.ok
                ) {

                    throw new Error(
                        data.message ||
                        "Unable to load complaints."
                    );

                }


                if (
                    Array.isArray(data)
                ) {

                    complaints =
                        data;

                }

                else if (
                    Array.isArray(
                        data.complaints
                    )
                ) {

                    complaints =
                        data.complaints;

                }

                else {

                    complaints = [];

                }


                updateStatistics();


                displayComplaints(
                    complaints
                );


            }

            catch (error) {

                console.error(
                    "❌ Dashboard error:",
                    error
                );


                complaintsContainer.innerHTML =

                    '<div style="' +
                    'padding:20px;' +
                    'border-radius:12px;' +
                    'background:#E7D5D1;' +
                    'color:#4D0E13;">' +

                    "<strong>❌ Could not load complaints.</strong>" +

                    "<br><br>" +

                    "Make sure Civixo backend is running on port 5000." +

                    "<br><br>" +

                    "Error: " +

                    escapeHTML(
                        error.message
                    ) +

                    "</div>";

            }

        }


        // =====================================================
        // STATISTICS
        // =====================================================

        function updateStatistics() {

            const total =
                complaints.length;


            const pending =
                complaints.filter(
                    function (complaint) {

                        return (
                            (
                                complaint.status ||
                                "Pending"
                            ).toLowerCase() ===
                            "pending"
                        );

                    }
                ).length;


            const progress =
                complaints.filter(
                    function (complaint) {

                        return (
                            (
                                complaint.status ||
                                ""
                            ).toLowerCase() ===
                            "in progress"
                        );

                    }
                ).length;


            const resolved =
                complaints.filter(
                    function (complaint) {

                        return (
                            (
                                complaint.status ||
                                ""
                            ).toLowerCase() ===
                            "resolved"
                        );

                    }
                ).length;


            const totalElement =
                document.getElementById(
                    "totalComplaints"
                );


            const pendingElement =
                document.getElementById(
                    "pendingComplaints"
                );


            const progressElement =
                document.getElementById(
                    "progressComplaints"
                );


            const resolvedElement =
                document.getElementById(
                    "resolvedComplaints"
                );


            if (
                totalElement
            ) {

                totalElement.textContent =
                    total;

            }


            if (
                pendingElement
            ) {

                pendingElement.textContent =
                    pending;

            }


            if (
                progressElement
            ) {

                progressElement.textContent =
                    progress;

            }


            if (
                resolvedElement
            ) {

                resolvedElement.textContent =
                    resolved;

            }

        }


        // =====================================================
        // DISPLAY COMPLAINTS
        // =====================================================

        function displayComplaints(
            complaintList
        ) {

            if (
                !complaintList ||
                complaintList.length === 0
            ) {

                complaintsContainer.innerHTML =

                    '<div style="' +
                    'padding:25px;' +
                    'text-align:center;">' +

                    "📭 No complaints found." +

                    "</div>";

                return;

            }


            complaintsContainer.innerHTML =

                complaintList.map(
                    function (complaint) {

                        const status =
                            complaint.status ||
                            "Pending";


                        const id =
                            escapeHTML(
                                complaint.complaintId
                            );


                        const category =
                            escapeHTML(
                                complaint.category
                            );


                        const description =
                            escapeHTML(
                                complaint.description
                            );


                        const location =
                            escapeHTML(
                                complaint.manualLocation ||
                                complaint.location ||
                                "Not provided"
                            );


                        const latitude =
                            complaint.latitude !== null &&
                            complaint.latitude !== undefined
                                ? escapeHTML(
                                    complaint.latitude
                                )
                                : "Not available";


                        const longitude =
                            complaint.longitude !== null &&
                            complaint.longitude !== undefined
                                ? escapeHTML(
                                    complaint.longitude
                                )
                                : "Not available";


                        const photo =
                            complaint.photoName
                                ? escapeHTML(
                                    complaint.photoName
                                )
                                : "No photo uploaded";


                        const createdAt =
                            complaint.createdAt
                                ? escapeHTML(
                                    new Date(
                                        complaint.createdAt
                                    ).toLocaleString()
                                )
                                : "Not available";


                        return `

                            <div
                                class="admin-complaint-card"
                                style="
                                    margin-bottom:20px;
                                    padding:20px;
                                    border-radius:16px;
                                "
                            >

                                <h3>
                                    🆔 ${id}
                                </h3>


                                <p>
                                    <strong>
                                        Category:
                                    </strong>

                                    ${category}
                                </p>


                                <p>
                                    <strong>
                                        Description:
                                    </strong>

                                    ${description}
                                </p>


                                <p>
                                    <strong>
                                        Location:
                                    </strong>

                                    ${location}
                                </p>


                                <p>
                                    <strong>
                                        Latitude:
                                    </strong>

                                    ${latitude}
                                </p>


                                <p>
                                    <strong>
                                        Longitude:
                                    </strong>

                                    ${longitude}
                                </p>


                                <p>
                                    <strong>
                                        Photo:
                                    </strong>

                                    ${photo}
                                </p>


                                <p>
                                    <strong>
                                        Status:
                                    </strong>

                                    <span
                                        style="
                                            font-weight:bold;
                                        "
                                    >
                                        ${getStatusIcon(status)}
                                        ${escapeHTML(status)}
                                    </span>
                                </p>


                                ${
                                    complaint.image
                                    ? `
                                        <div style="margin-top:15px;">
                                            <strong>
                                                Uploaded Photo:
                                            </strong>

                                            <br><br>

                                            <img
                                                src="${API_BASE_URL}${escapeHTML(complaint.image)}"
                                                alt="Complaint photo"
                                                style="
                                                    max-width:300px;
                                                    max-height:220px;
                                                    border-radius:12px;
                                                "
                                            >
                                        </div>
                                    `
                                    : ""
                                }


                                <div
                                    style="
                                        margin-top:20px;
                                        padding-top:15px;
                                        border-top:1px solid #ddd;
                                    "
                                >

                                    <strong>
                                        Update Status:
                                    </strong>

                                    <br><br>


                                    <button
                                        type="button"
                                        onclick="updateComplaintStatus('${id}', 'Pending')"
                                        style="
                                            padding:9px 14px;
                                            margin:4px;
                                            border:none;
                                            border-radius:8px;
                                            cursor:pointer;
                                        "
                                    >
                                        🟡 Pending
                                    </button>


                                    <button
                                        type="button"
                                        onclick="updateComplaintStatus('${id}', 'In Progress')"
                                        style="
                                            padding:9px 14px;
                                            margin:4px;
                                            border:none;
                                            border-radius:8px;
                                            cursor:pointer;
                                        "
                                    >
                                        🔵 In Progress
                                    </button>


                                    <button
                                        type="button"
                                        onclick="updateComplaintStatus('${id}', 'Resolved')"
                                        style="
                                            padding:9px 14px;
                                            margin:4px;
                                            border:none;
                                            border-radius:8px;
                                            cursor:pointer;
                                        "
                                    >
                                        🟢 Resolved
                                    </button>

                                </div>


                                <p
                                    style="
                                        margin-top:15px;
                                    "
                                >

                                    <strong>
                                        Submitted:
                                    </strong>

                                    ${createdAt}

                                </p>

                            </div>

                        `;

                    }
                ).join("");

        }


        // =====================================================
        // SEARCH
        // =====================================================

        if (
            searchInput
        ) {

            searchInput.addEventListener(
                "input",
                function () {

                    const search =
                        searchInput.value
                            .trim()
                            .toLowerCase();


                    if (!search) {

                        displayComplaints(
                            complaints
                        );

                        return;

                    }


                    const filtered =
                        complaints.filter(
                            function (complaint) {

                                const id =
                                    String(
                                        complaint.complaintId ||
                                        ""
                                    ).toLowerCase();


                                const category =
                                    String(
                                        complaint.category ||
                                        ""
                                    ).toLowerCase();


                                const description =
                                    String(
                                        complaint.description ||
                                        ""
                                    ).toLowerCase();


                                return (
                                    id.includes(search) ||
                                    category.includes(search) ||
                                    description.includes(search)
                                );

                            }
                        );


                    displayComplaints(
                        filtered
                    );

                }
            );

        }


        // =====================================================
        // UPDATE STATUS
        // =====================================================

        window.updateComplaintStatus =
            async function (
                complaintId,
                newStatus
            ) {

                try {

                    console.log(
                        "📤 Updating:",
                        complaintId,
                        "→",
                        newStatus
                    );


                    const response =
                        await fetch(

                            API_BASE_URL +
                            "/api/complaints/" +
                            encodeURIComponent(
                                complaintId
                            ) +
                            "/status",

                            {

                                method:
                                    "PATCH",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify({

                                        status:
                                            newStatus

                                    })

                            }

                        );


                    const data =
                        await response.json();


                    console.log(
                        "📥 Status response:",
                        data
                    );


                    if (
                        !response.ok
                    ) {

                        throw new Error(
                            data.message ||
                            "Failed to update status."
                        );

                    }


                    alert(
                        "✅ Complaint " +
                        complaintId +
                        " is now " +
                        newStatus
                    );


                    /*
                       Update local array immediately
                    */

                    const index =
                        complaints.findIndex(
                            function (complaint) {

                                return (
                                    String(
                                        complaint.complaintId
                                    )
                                        .toUpperCase() ===
                                    String(
                                        complaintId
                                    )
                                        .toUpperCase()
                                );

                            }
                        );


                    if (
                        index !== -1
                    ) {

                        complaints[index] =
                            data.complaint;

                    }


                    updateStatistics();


                    displayComplaints(
                        complaints
                    );


                }

                catch (error) {

                    console.error(
                        "❌ Status update error:",
                        error
                    );


                    alert(
                        "❌ Could not update complaint status.\n\n" +
                        error.message
                    );

                }

            };


        // =====================================================
        // START
        // =====================================================

        loadComplaints();

    }
);