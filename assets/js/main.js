//===== load grid
document.getElementById('dgrp-grid').innerHTML=""

const grid = new gridjs.Grid({
    columns: [
        {
            name: "Name",
            width: "100%",
            //height:"100%",

            formatter: (cell, row) => {
                // 1. 🔍 DIAGNOSTIC LOG: Press F12 to check your browser console window immediately!
                //console.log("Inspecting single row payload architecture:", row);

                // 2. FETCH VALUES FROM BOTH STRUCTURAL TRACKING LAYERS
                const sourceObj = row?.data || {};
                
                const registeredName   = sourceObj.full_name || row?.cells[0]?.data;
                const registeredEmail  = sourceObj.email     || row?.cells[1]?.data;
                
                // 🌟 TRIPLE-INDEX PROTECTION FOR THE ARRIVAL VALUE:
                // This evaluates both the direct JSON property name and the hidden cell matrix array positions
                const registeredArrive = (sourceObj.arrived !== undefined) ? sourceObj.arrived : 
                                        (row?.cells[2]?.data !== undefined) ? row?.cells[2]?.data : 
                                        (row?.cells[3]?.data !== undefined) ? row?.cells[3]?.data : null;
                if (!registeredName) {
                    return gridjs.html(`<div class="text-muted small p-2">Syncing row node...</div>`);
                }

                // 3. Clean up your string replacements safely
                const escapedName  = String(registeredName).replace(/'/g, "\\'");
                const escapedEmail = String(registeredEmail).replace(/'/g, "\\'");

                // 4. 🌟 RELAXED EQUALITY LOGIC: Coerces types safely (matches 1, "1", or true)
                const isArrived = registeredArrive == 1 || registeredArrive === true || registeredArrive === "true";

                const statusText  = isArrived ? "Arrived" : "Pending";
                const badgeColor  = isArrived ? "bg-success text-success" : "bg-danger text-danger";
                const statusIcon  = isArrived ? "bi-check-circle-fill" : "bi-clock-history";
                
                const trackingIdAttr = registeredEmail ? String(registeredEmail).trim() : '';

                // Safety check to ensure we don't format the custom empty state row
                if ( registeredName === "") {

                    return gridjs.html(`
                        <div style="
                        position: absolute;
                        left: 0;
                        width: 100%;
                        text-align: center;
                        color: #adb5bd;
                        font-size: 0.9rem;
                        font-weight: 500;
                        padding: 40px 0;
                        background-color: #212529;
                        pointer-events: none;
                        ">
                        No matching records found.
                        </div>
                    `);
                    
                } else {

                     return gridjs.html(`
                        <!-- 🌟 FIXED: Added max-width and margin:0 auto to lock width tracking -->
                        <div class="p-3 w-100 mx-auto rounded-3 text-white border border-secondary border-opacity-20 shadow-sm" 
                             style="background-color: #1f2128; max-width: 100%; box-sizing: border-box;">
                            
                            <!-- Header Title -->
                            <div class="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom border-secondary border-opacity-30">
                                <h6  class="m-0 fw-bold tracking-wide" style="color: #0dcaf0; font-size: 0.95rem;">
                                    ${registeredName} 
                                </h6>
                                
                                <!--//
                                <span class="badge rounded-pill bg-danger bg-opacity-10 text-danger border border-danger border-opacity-20 px-2 py-0.5" style="font-size: 0.65rem; font-weight: 600;">
                                    Attendee
                                </span>
                                //-->
                            </div>

                            <!-- Metadata Info -->
                            <div class="row g-1 px-1">
                                <div class="col-12 d-flex align-items-center gap-2">
                                    <span class="text-secondary fw-semibold text-uppercase" style="width: 45px; font-size: 0.9rem;">Email:</span>
                                    <span class="text-light opacity-90" style=" font-size: 0.9rem;">${registeredEmail}</span>
                                </div>
                               <div class="col-12 d-flex align-items-center gap-2">
                                    <span class="text-secondary fw-semibold text-uppercase" style="width: 45px; font-size: 0.7rem;">Status:</span>
                                    <span class="badge rounded-pill bg-opacity-10 border border-opacity-20 px-2 py-0.5 ${badgeColor}" 
                                        data-badge-container="${trackingIdAttr}" style="font-size: 0.65rem; font-weight: 600;">
                                        <i class="bi ${statusIcon} me-1" data-icon-target="${trackingIdAttr}"></i>
                                        <span id="${trackingIdAttr}">${statusText}</span>
                                    </span>
                                </div>
                               
                            </div>
                            
                        </div>
                    `);
                }

            }
        },

        {
            name: "Email",
            hidden: true // <-- THIS COMPLETELY HIDES THE COLUMN FROM THE UI [1]
        },
        {
            name: "arrived",
            hidden: true // <-- THIS COMPLETELY HIDES THE COLUMN FROM THE UI [1]
        },
    ],
    data: [],
    //data: [["", "", "No matching records found.", "", "", "", ""]] ,
    sort: true,
    pagination: {
        limit: 5,
        summary: true,
        buttonsCount: 3
    },
    fixedHeader: true,
    // 🌟 ADD THIS BLOCK RIGHT HERE INSIDE THE CONFIGURATION:
    height: '480px', // Forces the internal JS container logic to hard-lock scroll bounds
    style: {
        table: {
            'display': 'block',
            'width': '100%'
        },
        tbody: {
            'display': 'flex',
            'flex-direction': 'column',
            'gap': '12px',
            'width': '100%'
        },
        tr: {
            'display': 'block',
            'width': '100%',
            'height': 'auto' // Wipes out equal height spreadsheet splitting
        },
        td: {
            'display': 'block',
            'width': '100%',
            'height': 'auto',
            'padding': '0px'
        }
    },
    // style: {
    //     container: { backgroundColor: '#212529', border: 'none', color: '#f8f9fa' },
    //     table: { background: '#212529', color: '#f8f9fa', borderCollapse: 'collapse' },
    //     th: { background: '#1A1D20', color: '#adb5bd', border: '1px solid #495057', padding: '12px 16px' },
    //     td: { background: '#212529', color: '#f8f9fa', border: '1px solid #373b3e', padding: '12px 16px' }
    //     // REMOVED internal footer styles to prevent overrides!
    // },
    // className: {
    //     table: 'table mb-0'
    //     // REMOVED custom paginationButton attributes that were breaking selectors!
    // }
}).render(document.getElementById("dgrp-grid"));        
        
const sampleEventsData = [
    {
        id: 1,
        title: "Global Tech Summit 2026",
        date: "Saturday, Oct 14",
        location: "Main Stage / Convention Center",
        image: "assets/img/global-tech-summit.jpg",
        description: "Connect with world-class engineers, project builders, and startup creators shaping the modern landscape of the web."
    },
    {
        id: 2,
        title: "Summer Beats Music Festival",
        date: "Saturday, Nov 22",
        location: "Outdoor Arena Grounds",
        image: "assets/img/summer-beats.jpg",
        description: "Experience premium multi-genre music stages, intense lighting arrays, and food courts under open skies."
    },
    {
        id: 3,
        title: "CodeSprint Hackathon",
        date: "Friday, Dec 05",
        location: "Innovation Hub Labs",
        image: "assets/img/codesprint-hackathon.jpg",
        description: "A fast-paced 48-hour team coding sprint designed to build real-world software solutions for amazing prizes."
    }
];

// 1. Initial execution logic loading cards inside grid bounds
function displayEvents() {
    const container = document.getElementById('events-grid-container');
    container.innerHTML = '';

    sampleEventsData.forEach(event => {
        const cardMarkup = `
            <div class="col-12 col-md-4">
                <div class="card event-card text-white">
                    <img src="${event.image}" class="card-img-top" alt="${event.title}">
                    <div class="card-body d-flex flex-column justify-content-between p-4">
                        <div>
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <small class="text-danger fw-bold text-uppercase"><i class="bi bi-calendar3"></i> ${event.date}</small>
                            </div>
                            <h4 class="card-title fw-bold mb-2">${event.title}</h4>
                            <p class="text-muted-custom small mb-3"><i class="bi bi-geo-alt"></i> ${event.location}</p>
                            <p class="card-text text-muted-custom mb-4">${event.description}</p>
                        </div>
                        <button class="btn btn-live-red w-100 py-2 rounded-pill mt-auto" onclick="handleRegistration(${event.id})">
                            <i class="bi bi-pencil-square"></i> Register
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += cardMarkup;
    });
}

// 2. REWRITTEN REGISTRATION TRIGGER FUNCTION
function handleRegistration(eventId) {
    // Find specific matching element attributes within data block
    const selectedEvent = sampleEventsData.find(e => e.id === eventId);
    
    if (!selectedEvent) return;

    // Target modal nodes and populate them with the chosen card context details
    document.getElementById('form-event-id').value = selectedEvent.id;
    document.getElementById('modal-event-title').innerText = selectedEvent.title;
    document.getElementById('modal-event-meta').innerHTML = `<i class="bi bi-calendar3"></i> ${selectedEvent.date} | <i class="bi bi-geo-alt"></i> ${selectedEvent.location}`;

    // Initialize and open the Bootstrap modal interface natively using Vanilla JS
    const targetModalNode = document.getElementById('registrationModal');
    const bootstrapModalInstance = new bootstrap.Modal(targetModalNode);
    bootstrapModalInstance.show();
}


//==============BARCODE SCANNER============//
// 2. The Invisible Hardware Scanner Controller
const barcodeScanner = {
    
    buffer: "",
    lastKeyTime: Date.now(),
    threshold: 30,

    init: () => {
        console.log('*** barcode init() loaded****')
        window.addEventListener("keydown", (e) => {
            const currentTime = Date.now();
            const timeDiff = currentTime - this.lastKeyTime;
            this.lastKeyTime = currentTime;

            if (e.key === "Enter") {
            if (this.buffer.length > 0) {
                this.sendScanToBackend(this.buffer);
                this.buffer = "";
            }
                return;
            }

            if (timeDiff > this.threshold) {
                this.buffer = "";
            }

            if (e.key.length === 1) {
                this.buffer += e.key;
            }
        });

    },//END INIT

    sendScanToBackend: async (rawScannedUrl) => {
        const sanitizedUrl = encodeURI(rawScannedUrl.trim());
        console.log("Processing hardware scan:", sanitizedUrl); 

        /*
        try {
            // Send the scan payload up to your API server
            const response = await fetch(sanitizedUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) throw new Error("Database network error");
            console.log("Scan successfully recorded in database.");

        } catch (error) {
            console.error("Failed to commit scan:", error);
        }
        */
    }//end sendscan
}; //end obj bardcoedeScanner


//=============END BARCODE SCANNER =========//

//==================IMPORTANT DOCUMENT CONTENT LOADED =================//
document.addEventListener('DOMContentLoaded', function() {

    console.log('======DOMContenLoaded====')
    displayEvents();

    //connect to socket.io
    jhuang.connectsocket()

    barcodeScanner.init();

    //jhuang.speak('y!')

    // jhuang.socket.on('reset-grid', (data) => {
    //     console.log('received command to replace', data); // Check the transport
    // });
    
        
    // 3. SECURE FORM SUBMIT INTERCEPT HANDLER
    document.getElementById('registrationForm').addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent standard page refreshes

        // Read the dynamic capture arguments
        const registrationPayload = {
            eventId: document.getElementById('form-event-id').value,
            fullName: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value
        };

        console.log("Ready to stream payload directly to Express controller route:", registrationPayload);

        // Mock success alert message to client interface context
        alert(`Success!\nRegistered ${registrationPayload.fullName} for Event ID: ${registrationPayload.eventId}`);

        // Programmatically close the open modal container instance
        const openModalElement = document.getElementById('registrationModal');
        const instance = bootstrap.Modal.getInstance(openModalElement);
        instance.hide(); 

        // Reset inputs ready for alternative transactions
        this.reset();
    });

    //for cp
    // Strict real-time character mask for the phone input field
    document.getElementById('userPhone').addEventListener('input', function (e) {
        let value = this.value;

        // 1. Check if the very first character is a plus sign
        const hasPlus = value.startsWith('+');

        // 2. Strip absolutely everything that is not a raw number digit
        let cleanNumbers = value.replace(/[^0-9]/g, '');

        // 3. Reconstruct the string: re-apply the plus only if it was originally there
        this.value = (hasPlus ? '+' : '') + cleanNumbers;
    });

    //for email
    // Automatically removes spaces from the email input in real time
    document.getElementById('userEmail').addEventListener('input', function () {
        this.value = this.value.replace(/\s/g, '');
    });

    //===== for dashboard modal loaded
    document.addEventListener('click', (e) => {
        switch (e.target.id) {
            case 'open-dash-btn': // <-- Change this to the ID of your trigger BUTTON
                e.preventDefault();
                console.log("Opening the dashboard modal view dynamically...");
                jhuang.modalShow('dashboardModal')
                return
            break;

            case 'open-xlupload-btn':// open excel upload
                // 1. Locate the physical target modal wrapper element in your HTML
                e.preventDefault()
                console.log('open excel upload...')
                jhuang.modalShow('hrisloadModal'); 
                return
            break;

        
        }//eofsw
    })//end doc click

    /*===========  MODAL LISTENERS BELOW ==============*/
    // ===== Listener to trigger fetch() when Dashboard Modal is fully shown =====
    const dashModalElement = document.getElementById('dashboardModal');

    dashModalElement.addEventListener('shown.bs.modal', function () {
        console.log("Dashboard modal is fully visible. Triggering data fetch...");
        
        // Target your inner data container
        const gridContainer = document.getElementById('dgrp-grid');
        ///gridContainer.innerHTML = '<span class="text-light opacity-50 small"><i class="bi bi-arrow-clockwise hris-spin me-2"></i>Loading data...</span>';

        //const myIp = "http://192.168.1.16:10000" 

        jhuang.toggleLoading('dgrp-grid',true,"Loading pls wait!!!")

        // Execute your backend API fetch request
        fetch(`${myIp}/qr/getregistered`) // Change to your specific endpoint later
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();  
            })
            .then(serverRows => {

                jhuang.toggleLoading('dgrp-grid',false,null)

                console.log("Data fetched successfully from database:", serverRows );
                
                // For now, let's visualize the JSON payload cleanly inside your grid div
                //gridContainer.innerHTML = `<pre class="text-success small mb-0">${JSON.stringify(data, null, 2)}</pre>`;
                const formattedRows = serverRows.map(row => [
                    row.full_name.toUpperCase(), 
                    row.email,
                    row.arrived
                ]);
                
                // 4. Update the data array inside a single frame swap
                // If serverRows is empty [], Grid.js draws the dark empty message state instantly
                //grid.updateConfig({ data: [...formattedRows] }).forceRender();
                //document.getElementById("dgrp-grid").innerHTML = ""; // Clear any existing content
                
                grid.updateConfig({ data: formattedRows }).forceRender();
                // TODO: Replace the line above later with your custom HTML table loops or grid rendering tool
            })
            .catch(error => {
                jhuang.toggleLoading('dgrp-grid',false,null)
                
                console.error("Fetch operation failed:", error);
                gridContainer.innerHTML = '<span class="text-danger small"><i class="bi bi-exclamation-triangle me-2"></i>Failed to load records.</span>';
            
            });
    });


});/// end domcontentloaded




///copyright
// Automatically injects the current system calendar year into the footer
document.getElementById('copyright-year').textContent = new Date().getFullYear();

