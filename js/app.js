/* =========================================================
   CIVIXO - COMPLETE APP.JS
   Anonymous Local Problem Reporter
   ========================================================= */

const API_BASE_URL = "http://localhost:5000";
const MAX_IMAGE_SIZE = 100 * 1024 * 1024;


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let civixoMap = null;
let civixoMarker = null;

let selectedLatitude = null;
let selectedLongitude = null;


/* =========================================================
   HELPER
========================================================= */

function getElement(id) {
    return document.getElementById(id);
}


function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   STATUS HELPERS
========================================================= */

function getStatusIcon(status) {

    status = String(status || "Pending").trim();

    if (status === "Resolved") {
        return "🟢";
    }

    if (status === "In Progress") {
        return "🔵";
    }

    return "🟡";
}


function getStatusClass(status) {

    status = String(status || "Pending").trim();

    if (status === "Resolved") {
        return "resolved";
    }

    if (status === "In Progress") {
        return "in-progress";
    }

    return "pending";
}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(element, message, type) {

    if (!element) {
        return;
    }

    element.innerHTML = message;
    element.className = "civixo-message";

    if (type) {
        element.classList.add(type);
    }
}


/* =========================================================
   COMPLAINT ID
========================================================= */

function generateComplaintId() {

    const number =
        Math.floor(
            10000000 +
            Math.random() * 90000000
        );

    return "CIV-" + number;
}


/* =========================================================
   MAP LOCATION
========================================================= */

function setLocation(latitude, longitude, text) {

    latitude = Number(latitude);
    longitude = Number(longitude);

    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {
        console.error("Invalid coordinates:", latitude, longitude);
        return;
    }

    selectedLatitude = latitude;
    selectedLongitude = longitude;


    const latitudeElement =
        getElement("latitude");

    const longitudeElement =
        getElement("longitude");

    const locationResult =
        getElement("locationResult");


    if (latitudeElement) {

        latitudeElement.textContent =
            latitude.toFixed(6);

    }


    if (longitudeElement) {

        longitudeElement.textContent =
            longitude.toFixed(6);

    }


    if (locationResult) {

        locationResult.textContent =
            text ||
            "📍 Location selected: " +
            latitude.toFixed(6) +
            ", " +
            longitude.toFixed(6);

    }


    updateMapMarker(
        latitude,
        longitude,
        false
    );
}


/* =========================================================
   MAP MARKER
========================================================= */

function createMarker(latitude, longitude) {

    if (!civixoMap) {
        return;
    }


    const position = [
        Number(latitude),
        Number(longitude)
    ];


    if (civixoMarker) {

        civixoMarker.setLatLng(position);

        return;

    }


    civixoMarker =
        L.marker(
            position,
            {
                draggable: true
            }
        ).addTo(civixoMap);


    civixoMarker.bindPopup(
        "📍 Drag this marker to change the problem location."
    );


    civixoMarker.on(
        "dragend",
        function () {

            const position =
                civixoMarker.getLatLng();


            selectedLatitude =
                position.lat;

            selectedLongitude =
                position.lng;


            const latitudeElement =
                getElement("latitude");

            const longitudeElement =
                getElement("longitude");

            const locationResult =
                getElement("locationResult");


            if (latitudeElement) {

                latitudeElement.textContent =
                    position.lat.toFixed(6);

            }


            if (longitudeElement) {

                longitudeElement.textContent =
                    position.lng.toFixed(6);

            }


            if (locationResult) {

                locationResult.textContent =
                    "📍 Location selected by dragging the marker.";

            }

        }
    );
}


/* =========================================================
   UPDATE MAP MARKER
========================================================= */

function updateMapMarker(
    latitude,
    longitude,
    moveMap = true
) {

    if (!civixoMap) {
        return;
    }


    createMarker(
        latitude,
        longitude
    );


    if (moveMap) {

        civixoMap.setView(
            [
                Number(latitude),
                Number(longitude)
            ],
            16
        );

    }
}


/* =========================================================
   INITIALIZE MAP
========================================================= */

function initializeMap() {

    console.log("🗺️ initializeMap() started");


    const mapElement =
        getElement("map");


    if (!mapElement) {

        console.log(
            "ℹ️ Map element not found on this page."
        );

        return;

    }


    /* -----------------------------------------------------
       CHECK LEAFLET
    ----------------------------------------------------- */

    if (typeof L === "undefined") {

        console.error(
            "❌ Leaflet is NOT loaded."
        );


        mapElement.innerHTML =
            `
            <div style="
                padding:30px;
                text-align:center;
                font-weight:700;
                color:#b00020;
                background:#fff5f5;
            ">
                ❌ Map could not load.<br><br>
                Please check your internet connection
                and refresh the page.
            </div>
            `;


        return;

    }


    /* -----------------------------------------------------
       PREVENT DOUBLE INITIALIZATION
    ----------------------------------------------------- */

    if (civixoMap) {

        console.log(
            "ℹ️ Map already initialized."
        );

        setTimeout(
            function () {

                civixoMap.invalidateSize();

            },
            300
        );

        return;

    }


    /* -----------------------------------------------------
       REMOVE OLD LEAFLET INSTANCE IF ANY
    ----------------------------------------------------- */

    if (mapElement._leaflet_id) {

        console.warn(
            "⚠️ Existing Leaflet instance detected."
        );


        try {

            mapElement._leaflet_id = null;

        }

        catch (error) {

            console.warn(error);

        }

    }


    /* -----------------------------------------------------
       DEFAULT LOCATION
       Murud Janjira, Raigad
    ----------------------------------------------------- */

    const defaultLatitude = 18.3286;
    const defaultLongitude = 72.9627;


    /* -----------------------------------------------------
       CREATE MAP
    ----------------------------------------------------- */

    try {

        civixoMap =
            L.map(
                mapElement,
                {
                    center: [
                        defaultLatitude,
                        defaultLongitude
                    ],
                    zoom: 13,
                    zoomControl: true,
                    scrollWheelZoom: true
                }
            );


        console.log(
            "✅ Leaflet map object created."
        );

    }

    catch (error) {

        console.error(
            "❌ Leaflet map creation failed:",
            error
        );


        civixoMap = null;


        mapElement.innerHTML =
            `
            <div style="
                padding:30px;
                text-align:center;
                color:#b00020;
                font-weight:700;
            ">
                ❌ Unable to create map.<br>
                Check browser console for details.
            </div>
            `;


        return;

    }


    /* -----------------------------------------------------
       OPEN STREET MAP
    ----------------------------------------------------- */

    try {

        L.tileLayer(
            "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                maxZoom: 19,

                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
            }
        ).addTo(civixoMap);


        console.log(
            "✅ OpenStreetMap tiles added."
        );

    }

    catch (error) {

        console.error(
            "❌ Tile layer error:",
            error
        );

    }


    /* -----------------------------------------------------
       MAP CLICK
    ----------------------------------------------------- */

    civixoMap.on(
        "click",
        function (event) {

            const latitude =
                event.latlng.lat;

            const longitude =
                event.latlng.lng;


            console.log(
                "📍 Map clicked:",
                latitude,
                longitude
            );


            setLocation(
                latitude,
                longitude,
                "📍 Location selected on map."
            );

        }
    );


    /* -----------------------------------------------------
       DO NOT SELECT DEFAULT LOCATION
    ----------------------------------------------------- */

    selectedLatitude = null;
    selectedLongitude = null;


    /* -----------------------------------------------------
       FORCE MAP SIZE
    ----------------------------------------------------- */

    setTimeout(
        function () {

            if (civixoMap) {

                civixoMap.invalidateSize(
                    true
                );

            }

        },
        100
    );


    setTimeout(
        function () {

            if (civixoMap) {

                civixoMap.invalidateSize(
                    true
                );

            }

        },
        500
    );


    setTimeout(
        function () {

            if (civixoMap) {

                civixoMap.invalidateSize(
                    true
                );

            }

        },
        1000
    );


    console.log(
        "✅ CIVIXO MAP INITIALIZED SUCCESSFULLY"
    );
}


/* =========================================================
   GPS LOCATION - FIXED VERSION
========================================================= */

function getCurrentLocation() {

    console.log("📍 getCurrentLocation() called");

    const result =
        getElement("locationResult");

    const button =
        getElement("getLocationBtn");


    /* CHECK GEOLOCATION SUPPORT */
    if (!navigator.geolocation) {

        console.error("❌ Geolocation NOT supported");

        if (result) {
            result.textContent =
                "❌ Geolocation is not supported by your browser.";
        }

        return;
    }


    console.log("✅ Geolocation supported");

    /* UPDATE UI */
    if (result) {
        result.textContent =
            "📍 Getting your current location... (Please wait)";
        result.style.background = "#e3f2fd";
        result.style.color = "#1976d2";
    }


    if (button) {
        button.disabled = true;
        button.textContent =
            "📍 Getting Location...";
    }


    /* REQUEST POSITION */
    navigator.geolocation.getCurrentPosition(

        /* SUCCESS CALLBACK */
        function (position) {

            console.log("✅ GPS Success:", position);

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            console.log(
                "✅ Coordinates received:",
                latitude,
                longitude
            );


            /* SET LOCATION */
            setLocation(
                latitude,
                longitude,
                "📍 Your current location has been selected (GPS)."
            );


            /* MOVE MAP TO LOCATION */
            if (civixoMap) {

                civixoMap.setView(
                    [
                        latitude,
                        longitude
                    ],
                    17
                );

                console.log("✅ Map moved to GPS location");

            }


            /* UPDATE UI */
            if (result) {
                result.style.background = "#e8f5e9";
                result.style.color = "#2e7d32";
            }

            if (button) {
                button.disabled = false;
                button.textContent =
                    "📍 Use My Current Location";
            }


            console.log(
                "✅ GPS LOCATION COMPLETE:",
                latitude,
                longitude
            );

        },


        /* ERROR CALLBACK */
        function (error) {

            console.error(
                "❌ GPS Error Code:",
                error.code,
                "Message:",
                error.message
            );


            let message =
                "❌ Unable to get your current location.";


            if (error.code === 1) {

                message =
                    "❌ Location permission DENIED. Please enable location in browser settings.";

            }

            else if (error.code === 2) {

                message =
                    "❌ Your location could not be determined. Please try again.";

            }

            else if (error.code === 3) {

                message =
                    "❌ Location request TIMED OUT. Please try again.";

            }


            console.error(message);

            if (result) {
                result.textContent = message;
                result.style.background = "#ffebee";
                result.style.color = "#c62828";
            }


            if (button) {
                button.disabled = false;
                button.textContent =
                    "📍 Use My Current Location";
            }

        },


        /* OPTIONS */
        {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        }

    );
}


/* =========================================================
   IMAGE VALIDATION
========================================================= */

function validateImage(file) {

    if (!file) {
        return true;
    }


    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp"
    ];


    if (!allowedTypes.includes(file.type)) {

        alert(
            "❌ Only JPG, JPEG, PNG and WEBP images are allowed."
        );

        return false;
    }


    if (file.size > MAX_IMAGE_SIZE) {

        alert(
            "❌ Image size cannot be more than 100 MB."
        );

        return false;
    }


    return true;
}


/* =========================================================
   IMAGE PREVIEW
========================================================= */

function initializeImagePreview() {

    const input =
        getElement("problemPhoto");

    const preview =
        getElement("imagePreview");


    if (!input || !preview) {
        return;
    }


    if (input.dataset.civixoConnected) {
        return;
    }


    input.dataset.civixoConnected =
        "true";


    input.addEventListener(
        "change",
        function () {

            preview.innerHTML = "";


            const file =
                input.files &&
                input.files.length
                    ? input.files[0]
                    : null;


            if (!file) {
                return;
            }


            if (!validateImage(file)) {

                input.value = "";

                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    preview.innerHTML =
                        `
                        <p>
                            <strong>Photo Preview:</strong>
                        </p>

                        <img
                            src="${event.target.result}"
                            alt="Selected complaint photo"
                        >
                        `;

                };


            reader.readAsDataURL(file);

        }
    );
}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function saveComplaintLocally(complaint) {

    try {

        const complaints =
            JSON.parse(
                localStorage.getItem(
                    "civixoComplaints"
                ) || "[]"
            );


        const id =
            String(
                complaint.complaintId || ""
            )
            .trim()
            .toUpperCase();


        const index =
            complaints.findIndex(
                function (item) {

                    return (
                        String(
                            item.complaintId || ""
                        )
                        .trim()
                        .toUpperCase()
                        === id
                    );

                }
            );


        if (index >= 0) {

            complaints[index] =
                {
                    ...complaints[index],
                    ...complaint
                };

        }

        else {

            complaints.unshift(
                complaint
            );

        }


        localStorage.setItem(
            "civixoComplaints",
            JSON.stringify(complaints)
        );


        console.log(
            "✅ Complaint saved locally."
        );

    }

    catch (error) {

        console.error(
            "❌ LocalStorage error:",
            error
        );

    }
}


function getLocalComplaint(complaintId) {

    try {

        const complaints =
            JSON.parse(
                localStorage.getItem(
                    "civixoComplaints"
                ) || "[]"
            );


        const id =
            String(complaintId)
            .trim()
            .toUpperCase();


        return (
            complaints.find(
                function (item) {

                    return (
                        String(
                            item.complaintId || ""
                        )
                        .trim()
                        .toUpperCase()
                        === id
                    );

                }
            ) || null
        );

    }

    catch (error) {

        console.error(
            "❌ LocalStorage read error:",
            error
        );

        return null;
    }
}


/* =========================================================
   SUBMIT COMPLAINT
========================================================= */

/* =========================================================
   SUBMIT COMPLAINT - FIXED VERSION
========================================================= */

async function submitComplaint(event) {
    console.log("🔥 SUBMIT BUTTON FUNCTION CALLED");

    if (event) {
        event.preventDefault();
    }

    console.log("🚀 SUBMIT COMPLAINT STARTED");

    const categoryElement =
        getElement("problemCategory");

    const descriptionElement =
        getElement("problemDescription");

    const photoElement =
        getElement("problemPhoto");

    const manualElement =
        getElement("manualLocation");

    const submitButton =
        getElement("submitComplaintBtn");

    const messageElement =
        getElement("submitMessage");


    /* =====================================================
       CHECK ELEMENTS
    ===================================================== */

    if (
        !categoryElement ||
        !descriptionElement ||
        !submitButton ||
        !messageElement
    ) {

        console.error(
            "❌ Complaint form elements are missing."
        );

        alert(
            "Something went wrong. Please refresh the page and try again."
        );

        return;
    }


    /* =====================================================
       GET VALUES
    ===================================================== */

    const category =
        categoryElement.value.trim();

    const description =
        descriptionElement.value.trim();

    const manualLocation =
        manualElement
            ? manualElement.value.trim()
            : "";


    const file =
        photoElement &&
        photoElement.files &&
        photoElement.files.length > 0
            ? photoElement.files[0]
            : null;


    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!category) {

        alert(
            "⚠️ Please select a problem category."
        );

        categoryElement.focus();

        return;
    }


    if (!description) {

        alert(
            "⚠️ Please describe the problem."
        );

        descriptionElement.focus();

        return;
    }


    if (!validateImage(file)) {

        return;
    }


    /* =====================================================
       LOCATION
    ===================================================== */

    let locationType = "none";
    let locationText = "";


    if (
        selectedLatitude !== null &&
        selectedLongitude !== null
    ) {

        locationType = "map";

        locationText =
            "Map Location: " +
            Number(selectedLatitude).toFixed(6) +
            ", " +
            Number(selectedLongitude).toFixed(6);

    }


    /* Manual location has priority */

    if (manualLocation) {

        locationType = "manual";

        locationText =
            manualLocation;

    }


    /* =====================================================
       GENERATE COMPLAINT ID
    ===================================================== */

    const complaintId =
        generateComplaintId();


    console.log(
        "🆔 Generated Complaint ID:",
        complaintId
    );


    /* =====================================================
       CREATE FORM DATA
    ===================================================== */

    const formData =
        new FormData();


    formData.append(
        "complaintId",
        complaintId
    );

    formData.append(
        "category",
        category
    );

    formData.append(
        "description",
        description
    );

    formData.append(
        "location",
        locationText
    );

    formData.append(
        "manualLocation",
        manualLocation
    );

    formData.append(
        "locationType",
        locationType
    );

    formData.append(
        "status",
        "Pending"
    );


    if (
        selectedLatitude !== null &&
        selectedLongitude !== null
    ) {

        formData.append(
            "latitude",
            String(selectedLatitude)
        );

        formData.append(
            "longitude",
            String(selectedLongitude)
        );

    }


    if (file) {

        formData.append(
            "image",
            file
        );

    }


    /* =====================================================
       DISABLE BUTTON
    ===================================================== */

    submitButton.disabled = true;

    submitButton.textContent =
        "⏳ Submitting...";


    /* =====================================================
       SHOW LOADING
    ===================================================== */

    messageElement.style.display =
        "block";

    messageElement.className =
        "civixo-message loading";

    messageElement.innerHTML =
        `
        <div style="
            margin-top:25px;
            padding:20px;
            text-align:center;
            border-radius:15px;
            background:#f5f5f5;
            border:1px solid #ddd;
        ">
            <strong>
                ⏳ Submitting your complaint...
            </strong>
            <p>
                Please wait while we register your complaint.
            </p>
        </div>
        `;


    /* =====================================================
       SEND TO SERVER
    ===================================================== */

    try {

        console.log(
            "📤 Sending complaint to:",
            API_BASE_URL + "/api/complaints"
        );


        const response =
            await fetch(
                API_BASE_URL +
                "/api/complaints",
                {
                    method: "POST",
                    body: formData
                }
            );


        console.log(
            "📡 Server response:",
            response.status,
            response.statusText
        );


        /* =================================================
           READ RESPONSE
        ================================================= */

        let data = null;


        try {

            data =
                await response.json();

        }

        catch (jsonError) {

            console.error(
                "❌ Server did not return JSON:",
                jsonError
            );

            throw new Error(
                "Server returned an invalid response."
            );

        }


        console.log(
            "📦 Server data:",
            data
        );


        /* =================================================
           SERVER ERROR
        ================================================= */

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Complaint submission failed."
            );

        }


        /* =================================================
           GET COMPLAINT OBJECT
        ================================================= */

        const complaint =
            data.complaint ||
            data;


        if (!complaint) {

            throw new Error(
                "Complaint data was not returned by server."
            );

        }


        /* =================================================
           ENSURE ID + STATUS
        ================================================= */

        complaint.complaintId =
            complaint.complaintId ||
            complaintId;


        complaint.status =
            complaint.status ||
            "Pending";


        console.log(
            "✅ Complaint created:",
            complaint
        );


        /* =================================================
           SAVE LOCAL BACKUP
        ================================================= */

        saveComplaintLocally(
            complaint
        );


        /* =================================================
           HIDE SUBMIT BUTTON
        ================================================= */

        submitButton.style.display =
            "none";


        /* =================================================
           SHOW SUCCESS CONFIRMATION
        ================================================= */

        messageElement.className =
            "civixo-message success";


        messageElement.style.display =
            "block";


        messageElement.innerHTML =
            `
            <div class="success-box">

                <h2>
                    ✅ Complaint Submitted Successfully!
                </h2>

                <p>
                    Your complaint has been registered anonymously.
                </p>


                <!-- COMPLAINT ID -->

                <div class="complaint-id-box">

                    ${escapeHTML(
                        complaint.complaintId
                    )}

                </div>


                <p>
                    <strong>
                        📝 Save this Complaint ID
                    </strong>
                </p>

                <p>
                    You will need this ID to track
                    your complaint status.
                </p>


                <hr style="
                    margin:20px 0;
                    border:none;
                    border-top:1px solid rgba(77,14,19,0.2);
                ">


                <!-- STATUS -->

                <div style="
                    text-align:center;
                    padding:15px;
                    background:rgba(255,255,255,0.45);
                    border-radius:12px;
                    margin-top:15px;
                ">

                    <p style="
                        margin:0;
                        font-size:18px;
                    ">

                        <strong>
                            📊 Current Status:
                        </strong>

                    </p>

                    <p style="
                        margin:8px 0 0;
                        font-size:20px;
                        font-weight:800;
                    ">

                        🟡 Pending

                    </p>

                </div>


                <!-- DETAILS -->

                <div style="
                    margin-top:20px;
                    padding:15px;
                    background:rgba(255,255,255,0.35);
                    border-radius:12px;
                ">

                    <p style="
                        margin:5px 0;
                        text-align:left;
                    ">

                        <strong>
                            Category:
                        </strong>

                        ${escapeHTML(category)}

                    </p>


                    <p style="
                        margin:10px 0 5px;
                        text-align:left;
                    ">

                        <strong>
                            Location:
                        </strong>

                        ${escapeHTML(
                            locationText ||
                            "Not provided"
                        )}

                    </p>

                </div>


                <!-- BUTTONS -->

                <div class="success-buttons">


                    <button
                        type="button"
                        id="goTrackBtn"
                        class="track-btn"
                    >

                        🔍 Track Complaint

                    </button>


                    <button
                        type="button"
                        id="goHomeBtn"
                        class="home-btn"
                    >

                        🏠 Go Home

                    </button>


                    <button
                        type="button"
                        id="newComplaintBtn"
                        class="new-btn"
                    >

                        📋 File Another Report

                    </button>


                </div>

            </div>
            `;


        /* =================================================
           SUCCESS BOX BUTTONS
        ================================================= */

        const trackButton =
            getElement("goTrackBtn");

        const homeButton =
            getElement("goHomeBtn");

        const newComplaintButton =
            getElement("newComplaintBtn");


        /* TRACK */

        if (trackButton) {

            trackButton.addEventListener(
                "click",
                function () {

                    window.location.href =
                        "track.html?id=" +
                        encodeURIComponent(
                            complaint.complaintId
                        );

                }
            );

        }


        /* HOME */

        if (homeButton) {

            homeButton.addEventListener(
                "click",
                function () {

                    window.location.href =
                        "index.html";

                }
            );

        }


        /* NEW COMPLAINT */

        if (newComplaintButton) {

            newComplaintButton.addEventListener(
                "click",
                function () {

                    window.location.href =
                        "report.html";

                }
            );

        }


        /* =================================================
           SCROLL TO SUCCESS BOX
        ================================================= */

        setTimeout(
            function () {

                messageElement.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            },
            100
        );


        console.log(
            "🎉 SUCCESS BOX DISPLAYED:",
            complaint.complaintId
        );


        /*
           IMPORTANT:
           Do NOT re-enable submit button here.
           User has already submitted successfully.
        */
       submitButton.style.display = "none";

        return;

    }


    /* =====================================================
       ERROR / LOCAL BACKUP
    ===================================================== */

    catch (error) {

        console.error(
            "❌ Complaint submission failed:",
            error
        );


        /* =================================================
           SAVE LOCAL COPY
        ================================================= */

        const localComplaint = {

            complaintId:
                complaintId,

            category:
                category,

            description:
                description,

            location:
                locationText,

            manualLocation:
                manualLocation,

            latitude:
                selectedLatitude,

            longitude:
                selectedLongitude,

            locationType:
                locationType,

            status:
                "Pending",

            createdAt:
                new Date().toISOString()

        };


        saveComplaintLocally(
            localComplaint
        );


        /* =================================================
           SHOW LOCAL SUCCESS BOX
        ================================================= */

        submitButton.style.display =
            "none";


        messageElement.className =
            "civixo-message error-success";


        messageElement.style.display =
            "block";


        messageElement.innerHTML =
            `
            <div class="success-box"
                 style="
                    background:#fff5f5;
                    border-color:#b00020;
                 ">

                <h2 style="
                    color:#b00020;
                    text-align:center;
                ">

                    ⚠️ Complaint Saved Locally

                </h2>


                <p style="text-align:center;">

                    The server could not be reached,
                    but your complaint has been saved
                    in this browser.

                </p>


                <div class="complaint-id-box">

                    ${escapeHTML(
                        complaintId
                    )}

                </div>


                <p style="text-align:center;">

                    <strong>
                        Your Complaint ID is displayed above.
                    </strong>

                    <br>

                    Save it for future reference.

                </p>


                <p style="
                    text-align:center;
                    font-size:12px;
                    color:#b00020;
                    margin-top:15px;
                ">

                    Server Error:
                    ${escapeHTML(
                        error.message
                    )}

                </p>


                <div class="success-buttons">


                    <button
                        type="button"
                        id="goHomeBtn2"
                        class="home-btn"
                    >

                        🏠 Go Home

                    </button>


                    <button
                        type="button"
                        id="newComplaintBtn2"
                        class="new-btn"
                    >

                        📋 File Another Report

                    </button>


                </div>

            </div>
            `;


        /* HOME */

        const homeButton2 =
            getElement("goHomeBtn2");


        if (homeButton2) {

            homeButton2.addEventListener(
                "click",
                function () {

                    window.location.href =
                        "index.html";

                }
            );

        }


        /* NEW REPORT */

        const newComplaintButton2 =
            getElement("newComplaintBtn2");


        if (newComplaintButton2) {

            newComplaintButton2.addEventListener(
                "click",
                function () {

                    window.location.href =
                        "report.html";

                }
            );

        }


        setTimeout(
            function () {

                messageElement.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            },
            100
        );

    }

    finally {

    /*
       IMPORTANT:
       Do not automatically hide/remove
       the confirmation box.

       If complaint was successfully submitted,
       keep the success box visible.
    */

    if (
        submitButton &&
        messageElement &&
        !messageElement.classList.contains("success") &&
        !messageElement.classList.contains("error-success")
    ) {

        submitButton.disabled = false;

        submitButton.style.display = "block";

        submitButton.textContent =
            "Submit Complaint";

    }

}

}


/* =========================================================
   STATUS TIMELINE
========================================================= */

function getStatusTimelineHTML(status) {

    status =
        String(status || "Pending").trim();


    const progressActive =
        status === "In Progress" ||
        status === "Resolved";


    const resolvedActive =
        status === "Resolved";


    return `
        <div class="status-timeline">

            <div class="timeline-step active">
                <span>🟡</span>
                <strong>Pending</strong>
            </div>

            <div class="timeline-line"></div>

            <div class="timeline-step ${
                progressActive ? "active" : ""
            }">

                <span>🔵</span>
                <strong>In Progress</strong>

            </div>

            <div class="timeline-line"></div>

            <div class="timeline-step ${
                resolvedActive ? "active" : ""
            }">

                <span>🟢</span>
                <strong>Resolved</strong>

            </div>

        </div>
    `;
}


/* =========================================================
   TRACK COMPLAINT
========================================================= */

async function trackComplaint() {

    const input =
        getElement("complaintIdInput");

    const result =
        getElement("trackResult");


    if (!input || !result) {

        console.error(
            "❌ Track elements not found."
        );

        return;
    }


    const complaintId =
        input.value
        .trim()
        .toUpperCase();


    if (!complaintId) {

        result.innerHTML =
            "<p>⚠️ Please enter your Complaint ID.</p>";

        return;
    }


    result.innerHTML =
        "<p>🔎 Searching for complaint...</p>";


    try {

        const response =
            await fetch(
                API_BASE_URL +
                "/api/complaints/" +
                encodeURIComponent(
                    complaintId
                )
            );


        let data = {};


        try {

            data =
                await response.json();

        }

        catch (error) {

            data = {};

        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Complaint not found."
            );

        }


        const complaint =
            data.complaint ||
            data;


        saveComplaintLocally(
            complaint
        );


        displayTrackedComplaint(
            complaint
        );

    }


    catch (error) {

        console.error(
            "❌ Track error:",
            error
        );


        const localComplaint =
            getLocalComplaint(
                complaintId
            );


        if (localComplaint) {

            displayTrackedComplaint(
                localComplaint
            );

            return;
        }


        result.innerHTML =
            `
            <div class="error-box">

                <h3>
                    ❌ Complaint Not Found
                </h3>

                <p>
                    ${escapeHTML(
                        error.message ||
                        "Unable to find complaint."
                    )}
                </p>

                <p>
                    Please check your Complaint ID.
                </p>

            </div>
            `;

    }
}


/* =========================================================
   DISPLAY TRACKED COMPLAINT
========================================================= */

function displayTrackedComplaint(complaint) {

    const result =
        getElement("trackResult");


    if (!result) {
        return;
    }


    const status =
        complaint.status ||
        "Pending";


    const icon =
        getStatusIcon(status);


    const statusClass =
        getStatusClass(status);


    const complaintId =
        escapeHTML(
            complaint.complaintId ||
            "Unknown"
        );


    const category =
        escapeHTML(
            complaint.category ||
            "Not provided"
        );


    const description =
        escapeHTML(
            complaint.description ||
            "Not provided"
        );


    const location =
        escapeHTML(
            complaint.location ||
            complaint.manualLocation ||
            "Location not provided"
        );


    let dateText = "";


    if (complaint.createdAt) {

        const date =
            new Date(
                complaint.createdAt
            );


        if (!isNaN(date.getTime())) {

            dateText =
                date.toLocaleString();

        }

    }


    let imageHTML = "";


    if (complaint.image) {

        let imageURL =
            String(
                complaint.image
            );


        if (
            !imageURL.startsWith("http://") &&
            !imageURL.startsWith("https://")
        ) {

            if (!imageURL.startsWith("/")) {

                imageURL =
                    "/" + imageURL;

            }


            imageURL =
                API_BASE_URL +
                imageURL;

        }


        imageHTML =
            `
            <div class="complaint-image-section">

                <p>
                    <strong>Uploaded Photo:</strong>
                </p>

                <img
                    src="${escapeHTML(imageURL)}"
                    alt="Complaint photo"
                    style="
                        max-width:100%;
                        border-radius:12px;
                    "
                >

            </div>
            `;

    }


    result.innerHTML =
        `
        <div class="track-card-result">

            <h2>
                📋 Complaint Details
            </h2>

            <div class="complaint-id-box">
                ${complaintId}
            </div>

            <div class="status-box ${statusClass}">

                <h2>
                    ${icon}
                    ${escapeHTML(status)}
                </h2>

                <p>
                    Current Complaint Status
                </p>

            </div>

            ${getStatusTimelineHTML(status)}

            <hr>

            <p>
                <strong>Category:</strong>
                ${category}
            </p>

            <p>
                <strong>Description:</strong><br>
                ${description}
            </p>

            <p>
                <strong>Location:</strong><br>
                ${location}
            </p>

            ${
                dateText
                    ? `
                    <p>
                        <strong>Submitted:</strong>
                        ${escapeHTML(dateText)}
                    </p>
                    `
                    : ""
            }

            ${imageHTML}

        </div>
        `;
}


/* =========================================================
   AUTO TRACK FROM URL
========================================================= */

function loadComplaintFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const id =
        params.get("id");


    if (!id) {
        return;
    }


    const input =
        getElement("complaintIdInput");


    if (!input) {
        return;
    }


    input.value =
        id.trim().toUpperCase();


    setTimeout(
        function () {

            trackComplaint();

        },
        500
    );
}


/* =========================================================
   AREA ISSUES
========================================================= */

async function loadAreaIssues() {

    const container =
        getElement("areaIssues");


    if (!container) {
        return;
    }


    container.innerHTML =
        "<p>🔄 Loading area issues...</p>";


    try {

        const response =
            await fetch(
                API_BASE_URL +
                "/api/complaints"
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load complaints."
            );

        }


        const data =
            await response.json();


        let complaints = [];


        if (Array.isArray(data)) {

            complaints =
                data;

        }

        else if (
            Array.isArray(data.complaints)
        ) {

            complaints =
                data.complaints;

        }

        else if (
            Array.isArray(data.data)
        ) {

            complaints =
                data.data;

        }


        if (!complaints.length) {

            container.innerHTML =
                "<p>🎉 No complaints reported yet.</p>";

            return;
        }


        complaints.forEach(
            saveComplaintLocally
        );


        displayAreaIssues(
            complaints
        );

    }


    catch (error) {

        console.error(
            "❌ Area issue error:",
            error
        );


        try {

            const local =
                JSON.parse(
                    localStorage.getItem(
                        "civixoComplaints"
                    ) || "[]"
                );


            if (local.length) {

                displayAreaIssues(
                    local
                );

            }

            else {

                container.innerHTML =
                    "<p>❌ Unable to load area issues.</p>";

            }

        }

        catch (storageError) {

            container.innerHTML =
                "<p>❌ Unable to load area issues.</p>";

        }

    }
}


/* =========================================================
   DISPLAY AREA ISSUES
========================================================= */

function displayAreaIssues(complaints) {

    const container =
        getElement("areaIssues");


    if (!container) {
        return;
    }


    container.innerHTML = "";


    complaints.forEach(
        function (complaint) {

            const status =
                complaint.status ||
                "Pending";


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "area-issue-card";


            card.innerHTML =
                `
                <h3>
                    ${getStatusIcon(status)}
                    ${escapeHTML(
                        complaint.category ||
                        "Other"
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        complaint.description ||
                        "No description"
                    )}
                </p>

                <p>
                    <strong>Location:</strong>
                    ${escapeHTML(
                        complaint.location ||
                        complaint.manualLocation ||
                        "Not provided"
                    )}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${getStatusIcon(status)}
                    ${escapeHTML(status)}
                </p>

                <p>
                    <strong>ID:</strong>
                    ${escapeHTML(
                        complaint.complaintId ||
                        "Unknown"
                    )}
                </p>
                `;


            container.appendChild(
                card
            );

        }
    );
}


/* =========================================================
   LOCATION BUTTON
========================================================= */

function initializeLocationButton() {

    const button =
        getElement("getLocationBtn");


    if (!button) {
        console.log("❌ Location button not found");
        return;
    }


    if (button.dataset.civixoConnected) {
        console.log("ℹ️ Location button already connected");
        return;
    }


    button.dataset.civixoConnected =
        "true";


    button.addEventListener(
        "click",
        function (event) {

            console.log("🔘 Location button clicked");

            event.preventDefault();

            getCurrentLocation();

        }
    );


    console.log(
        "✅ Location button connected."
    );
}


/* =========================================================
   REPORT PAGE
========================================================= */

function initializeReportPage() {

    console.log(
        "🚀 Initializing Civixo report page..."
    );


    const submitButton =
        getElement("submitComplaintBtn");


    if (submitButton) {

        if (!submitButton.dataset.civixoConnected) {

            submitButton.dataset.civixoConnected =
                "true";


            submitButton.addEventListener(
                "click",
                function (event) {

                    submitComplaint(
                        event
                    );

                }
            );

        }

    }


    initializeMap();

    initializeLocationButton();

    initializeImagePreview();


    console.log(
        "✅ Report page initialized."
    );
}


/* =========================================================
   TRACK PAGE
========================================================= */

function initializeTrackPage() {

    const button =
        getElement("trackComplaintBtn");

    const input =
        getElement("complaintIdInput");

    const form =
        getElement("trackForm");


    if (button) {

        if (!button.dataset.civixoConnected) {

            button.dataset.civixoConnected =
                "true";


            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    trackComplaint();

                }
            );

        }

    }


    if (input) {

        input.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    event.preventDefault();

                    trackComplaint();

                }

            }
        );

    }


    if (form) {

        form.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                trackComplaint();

            }
        );

    }


    console.log(
        "✅ Track page initialized."
    );
}


/* =========================================================
   PAGE INITIALIZATION
========================================================= */

function initializeCivixoApp() {

    console.log(
        "🔥 CIVIXO APP STARTING..."
    );


    /* REPORT */

    if (
        getElement("map") ||
        getElement("submitComplaintBtn")
    ) {

        initializeReportPage();

    }


    /* TRACK */

    if (
        getElement("trackComplaintBtn") ||
        getElement("complaintIdInput")
    ) {

        initializeTrackPage();

        loadComplaintFromURL();

    }


    /* AREA */

    if (
        getElement("areaIssues")
    ) {

        loadAreaIssues();

    }


    console.log(
        "✅ CIVIXO APP READY."
    );
}


/* =========================================================
   IMPORTANT MAP START
========================================================= */

/*
   We use BOTH DOMContentLoaded and window.load.

   This makes the map much more reliable when
   Leaflet is loaded from CDN.
*/

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            initializeCivixoApp();

        }
    );

}

else {

    initializeCivixoApp();

}


/*
   Extra map check after all page resources
   have completely loaded.
*/

window.addEventListener(
    "load",
    function () {

        console.log(
            "🌐 Window fully loaded."
        );


        if (
            getElement("map") &&
            !civixoMap
        ) {

            console.log(
                "🔄 Retrying map initialization..."
            );


            setTimeout(
                function () {

                    initializeMap();

                },
                300
            );

        }


        if (civixoMap) {

            setTimeout(
                function () {

                    civixoMap.invalidateSize(
                        true
                    );

                },
                300
            );

        }

    }
);


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.submitComplaint =
    submitComplaint;

window.trackComplaint =
    trackComplaint;

window.getCurrentLocation =
    getCurrentLocation;

window.initializeMap =
    initializeMap;

window.generateComplaintId =
    generateComplaintId;

window.setLocation =
    setLocation;


/* =========================================================
   FINAL MESSAGE
========================================================= */

console.log(
    "✅ Civixo app.js file loaded."
);
