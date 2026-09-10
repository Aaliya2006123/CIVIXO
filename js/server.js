/* =========================================================
   CIVIXO BACKEND SERVER
   Anonymous Local Problem Reporter

   Features:
   - Complaint submission
   - Image upload
   - GPS coordinates
   - Manual location
   - Track complaint
   - Update complaint status
   - Delete complaint
   - CORS
========================================================= */

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = 5000;


/* =========================================================
   BASIC CONFIGURATION
========================================================= */

app.use(cors());

app.use(
    express.json({
        limit: "100mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "100mb"
    })
);


/* =========================================================
   UPLOAD DIRECTORY
========================================================= */

const uploadDirectory =
    path.join(__dirname, "uploads");


if (!fs.existsSync(uploadDirectory)) {

    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true
        }
    );

}


/* =========================================================
   MULTER CONFIGURATION
========================================================= */

const storage =
    multer.diskStorage({

        destination: function (req, file, cb) {

            cb(
                null,
                uploadDirectory
            );

        },

        filename: function (req, file, cb) {

            const extension =
                path.extname(file.originalname);

            const uniqueName =
                "civixo-" +
                Date.now() +
                "-" +
                Math.round(
                    Math.random() * 1000000
                ) +
                extension;

            cb(
                null,
                uniqueName
            );

        }

    });


const upload =
    multer({

        storage: storage,

        limits: {
            fileSize:
                100 * 1024 * 1024
        },

        fileFilter:
            function (req, file, cb) {

                const allowedTypes = [
                    "image/jpeg",
                    "image/png",
                    "image/jpg",
                    "image/webp"
                ];

                if (
                    allowedTypes.includes(
                        file.mimetype
                    )
                ) {

                    cb(
                        null,
                        true
                    );

                } else {

                    cb(
                        new Error(
                            "Only JPG, JPEG, PNG and WEBP images are allowed."
                        )
                    );

                }

            }

    });


/* =========================================================
   STATIC UPLOADS
========================================================= */

app.use(
    "/uploads",
    express.static(
        uploadDirectory
    )
);


/* =========================================================
   IN-MEMORY DATABASE
========================================================= */

let complaints = [];


/* =========================================================
   COMPLAINT ID GENERATOR
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
   FIND COMPLAINT
========================================================= */

function findComplaintIndex(id) {

    const normalizedId =
        String(id || "")
            .trim()
            .toUpperCase();


    return complaints.findIndex(
        function (complaint) {

            return (
                String(
                    complaint.complaintId
                )
                    .trim()
                    .toUpperCase() ===
                normalizedId
            );

        }
    );

}


/* =========================================================
   TEST ROUTE
========================================================= */

app.get(
    "/api/test",
    function (req, res) {

        res.json({

            success: true,

            message:
                "Civixo server is working",

            port: PORT

        });

    }
);


/* =========================================================
   GET ALL COMPLAINTS
========================================================= */

app.get(
    "/api/complaints",
    function (req, res) {

        res.json(
            complaints
        );

    }
);


/* =========================================================
   CREATE COMPLAINT
========================================================= */

app.post(
    "/api/complaints",
    upload.single("image"),
    function (req, res) {

        try {

            const data =
                req.body || {};


            console.log(
                "📥 New complaint request received"
            );


            /* =============================================
               VALIDATION
            ============================================= */

            if (
                !data.category ||
                !String(
                    data.category
                ).trim()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Category is required"

                });

            }


            if (
                !data.description ||
                !String(
                    data.description
                ).trim()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Description is required"

                });

            }


            /* =============================================
               COMPLAINT ID
            ============================================= */

            let complaintId =
                String(
                    data.complaintId || ""
                )
                    .trim()
                    .toUpperCase();


            if (!complaintId) {

                complaintId =
                    generateComplaintId();

            }


            /* =============================================
               CHECK DUPLICATE ID
            ============================================= */

            if (
                findComplaintIndex(
                    complaintId
                ) !== -1
            ) {

                complaintId =
                    generateComplaintId();

            }


            /* =============================================
               LOCATION
            ============================================= */

            let latitude = null;
            let longitude = null;


            if (
                data.latitude !== undefined &&
                data.latitude !== ""
            ) {

                latitude =
                    Number(
                        data.latitude
                    );

            }


            if (
                data.longitude !== undefined &&
                data.longitude !== ""
            ) {

                longitude =
                    Number(
                        data.longitude
                    );

            }


            if (
                Number.isNaN(
                    latitude
                )
            ) {

                latitude = null;

            }


            if (
                Number.isNaN(
                    longitude
                )
            ) {

                longitude = null;

            }


            /* =============================================
               IMAGE
            ============================================= */

            let imagePath = null;

            let photoName = null;


            if (req.file) {

                imagePath =
                    "/uploads/" +
                    req.file.filename;

                photoName =
                    req.file.originalname;

            }


            /* =============================================
               CREATE COMPLAINT
            ============================================= */

            const now =
                new Date().toISOString();


            const complaint = {

                complaintId:
                    complaintId,

                category:
                    String(
                        data.category
                    ).trim(),

                description:
                    String(
                        data.description
                    ).trim(),

                location:
                    data.location
                        ? String(
                            data.location
                        ).trim()
                        : "Location not provided",

                manualLocation:
                    data.manualLocation
                        ? String(
                            data.manualLocation
                        ).trim()
                        : "",

                latitude:
                    latitude,

                longitude:
                    longitude,

                locationType:
                    data.locationType ||
                    "none",

                image:
                    imagePath,

                photo:
                    imagePath,

                photoName:
                    photoName,

                status:
                    "Pending",

                createdAt:
                    now,

                updatedAt:
                    now

            };


            complaints.unshift(
                complaint
            );


            console.log(
                "✅ New complaint:",
                complaint.complaintId
            );


            res.status(201).json({

                success: true,

                message:
                    "Complaint submitted successfully",

                complaint:
                    complaint

            });

        }

        catch (error) {

            console.error(
                "❌ Complaint submission error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Server error"

            });

        }

    }
);


/* =========================================================
   GET SINGLE COMPLAINT
========================================================= */

app.get(
    "/api/complaints/:id",
    function (req, res) {

        try {

            const index =
                findComplaintIndex(
                    req.params.id
                );


            if (index === -1) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Complaint not found"

                });

            }


            res.json({

                success: true,

                complaint:
                    complaints[index]

            });

        }

        catch (error) {

            console.error(
                "❌ Track complaint error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Server error"

            });

        }

    }
);


/* =========================================================
   UPDATE COMPLAINT STATUS
   Supports PATCH and PUT
========================================================= */

async function updateComplaintStatus(
    req,
    res
) {

    try {

        const index =
            findComplaintIndex(
                req.params.id
            );


        if (index === -1) {

            return res.status(404).json({

                success: false,

                message:
                    "Complaint not found"

            });

        }


        const status =
            String(
                req.body.status || ""
            ).trim();


        const allowedStatuses = [

            "Pending",

            "In Progress",

            "Resolved",

            "Rejected"

        ];


        if (
            !allowedStatuses.includes(
                status
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid status. Allowed: Pending, In Progress, Resolved, Rejected"

            });

        }


        complaints[index].status =
            status;


        complaints[index].updatedAt =
            new Date().toISOString();


        console.log(
            "🔄 Status updated:",
            complaints[index].complaintId,
            "→",
            status
        );


        res.json({

            success: true,

            message:
                "Status updated successfully",

            complaint:
                complaints[index]

        });

    }

    catch (error) {

        console.error(
            "❌ Status update error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Server error"

        });

    }

}


app.patch(
    "/api/complaints/:id/status",
    updateComplaintStatus
);


app.put(
    "/api/complaints/:id/status",
    updateComplaintStatus
);


/* =========================================================
   DELETE COMPLAINT
========================================================= */

app.delete(
    "/api/complaints/:id",
    function (req, res) {

        try {

            const index =
                findComplaintIndex(
                    req.params.id
                );


            if (index === -1) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Complaint not found"

                });

            }


            const deleted =
                complaints.splice(
                    index,
                    1
                )[0];


            console.log(
                "🗑️ Complaint deleted:",
                deleted.complaintId
            );


            res.json({

                success: true,

                message:
                    "Complaint deleted successfully",

                complaint:
                    deleted

            });

        }

        catch (error) {

            console.error(
                "❌ Delete error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Server error"

            });

        }

    }
);


/* =========================================================
   404 ROUTE
========================================================= */

app.use(
    function (req, res) {

        res.status(404).json({

            success: false,

            message:
                "Route not found"

        });

    }
);


/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(
    function (error, req, res, next) {

        console.error(
            "❌ Server error:",
            error
        );


        if (
            error.code ===
            "LIMIT_FILE_SIZE"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Image size cannot exceed 100 MB."

            });

        }


        res.status(500).json({

            success: false,

            message:
                error.message ||
                "Internal server error"

        });

    }
);


/* =========================================================
   START SERVER
========================================================= */

app.listen(
    PORT,
    function () {

        console.log("");
        console.log(
            "================================"
        );
        console.log(
            "        CIVIXO SERVER"
        );
        console.log(
            "================================"
        );
        console.log(
            "Server running on port " +
            PORT
        );
        console.log(
            "Test:"
        );
        console.log(
            "http://localhost:" +
            PORT +
            "/api/test"
        );
        console.log(
            "================================"
        );
        console.log("");

    }
);