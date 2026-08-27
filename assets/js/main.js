//===== load grid
document.getElementById('dgrp-grid').innerHTML=""
let client = null;
let heartbeatInterval = null;

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

let isScanningActive = false;

//==============BARCODE SCANNER============//
// 2. The Invisible Hardware Scanner Controller
const barcodeScanner = {
    socket:null,
    buffer: "",
    lastKeyTime: Date.now(),
    threshold: 30,
    submitTimeout: null, // Timer to handle the missing hardware Enter keyinit() {

    init: () => { 

        console.log('===firing barcode scanner===')
        
        window.addEventListener("keydown", (e) => {
            // Ignore functional system navigation keys
            if (e.key.length > 1 && e.key !== 'Enter') {
                return;
            }

            // FIX B: Explicitly target the object name 'barcodeScanner' to safely access the buffers
            const currentTime = Date.now();
            const timeDiff = currentTime - barcodeScanner.lastKeyTime;
            barcodeScanner.lastKeyTime = currentTime;
        
            // Clear any pending auto-submit timers because characters are streaming in fast
            if (barcodeScanner.submitTimeout) {
                clearTimeout(barcodeScanner.submitTimeout);
            }

            // 1. If an Enter key arrives from the scanner, fire instantly and stop
            if (e.key === 'Enter') {
                if (barcodeScanner.buffer.length > 0) {
                    console.log("🎯 Hardware Enter detected! Processing string:", barcodeScanner.buffer);
                    barcodeScanner.sendScanToBackend(barcodeScanner.buffer);
                    barcodeScanner.buffer = ""; // Flush memory
                }
                return;
            }

            // 2. Append character to your active object buffer
            barcodeScanner.buffer += e.key;

            // 3. Fallback countdown: wait 250ms after typing stops to execute
            barcodeScanner.submitTimeout = setTimeout(() => {
                if (barcodeScanner.buffer.length > 0) {
                    console.log("No Enter key found. Processing stream from timeout safety buffer...");
                    barcodeScanner.sendScanToBackend(barcodeScanner.buffer);
                    barcodeScanner.buffer = ""; // Flush memory
                }
            }, 250); // Safe hardware rest interval
        });

    }, // END INIT

    //======== TRIGGER SCAN=============//
    sendScanToBackend: async (rawScannedUrl) => {

          // 1. Capture the raw input from your notepad verification layout
        const incomingUrl = rawScannedUrl.trim(); 
        const myLocalIpAddress = `${myIp}`; // http://192.168.1.23:10000

        // 2. Perform the domain routing swap cleanly
        let localRoutePath = incomingUrl.replace("https://asn-jtgrp-api.onrender.com", myLocalIpAddress);
        localRoutePath = localRoutePath.replace('undefined', '');

        // 3. CRUCIAL FIX: Encode the URL correctly so spaces like "Katrina Uy" don't break the fetch!
        // This converts spaces into "%20", preventing the 404 truncation drop
        const sanitizedUrl = encodeURI(localRoutePath); 
        console.log("Fixed Safe Local Network Path Assembled:", sanitizedUrl);
        
        try {
            // Send the scan payload up to your API server
            const response = await fetch(sanitizedUrl, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) throw new Error("Database network error");
            
            console.log("Scan successfully recorded in database.");

            const data = await response.json();
            console.log("Server verification status:", data.status);
            
            if(data.status){
                let mydata = {name: data.xname, email: data.xemail, displayname: data.displayname }
                
                barcodeScanner.updategrid(mydata) 
                
            }
        } catch (error) {
            console.error("Failed to commit scan securely:", error);
            
            // =======================================================================
        } finally {
            // Turn off the lock when everything is completely finished
            //isScanningActive = false; 
        }
        
    },//end sendscan

    //=========UPGRADE GRID ============
    updategrid: async (data )=> {

        console.log('===updategrid() Grid received', data); // Check the transport
        const targetEmail = data.xemail; // Example scanned payload

        jhuang.speak( `Welcome ${data.displayname }!`)

        // 1. Locate the elements using your escaped data attributes
        const parentBadge = document.querySelector(`[data-badge-container="${CSS.escape(targetEmail)}"]`);
        const statusIcon  = document.querySelector(`[data-icon-target="${CSS.escape(targetEmail)}"]`);
        const textSpan    = document.getElementById(targetEmail);

        // 2. Change the BADGE COLOR (Swap Bootstrap dark classes)
        if (parentBadge) {
            // Remove the Pending (Red) styling classes
            parentBadge.classList.remove('bg-danger', 'text-danger');
            
            // Add the Arrived (Green/Cyan) styling classes
            parentBadge.classList.add('bg-success', 'text-success'); // Change to bg-info / text-dark if you prefer your cyan theme look
        }

        // 3. Change the STATUS ICON (Swap Bootstrap Icon glyphs)
        if (statusIcon) {
            // Remove the clock icon class
            statusIcon.classList.remove('bi-clock-history');
            
            // Add the verified checkmark icon class
            statusIcon.classList.add('bi-check-circle-fill');
        }

        // 4. Change the INNER TEXT VALUE
        if (textSpan) { 
            textSpan.textContent = "Arrived";
        }

        // === 🚀 THE NETWORKING STREAM FIX ===
        console.log("Allowing database network processes to settle before printing...");
        // Force a 300ms pause. This lets the browser completely finish the HTTP fetch 
        // cycle so the Bluetooth engine has 100% of the antenna's bandwidth!
        await new Promise(resolve => setTimeout(resolve, 300));

        console.log("=== upgradegrid() Database quiet. Launching high-speed print job safely.");
        
        //=========print to printer
        await barcodeScanner.printSeminarBadge(data.displayname, data.name)
    },

    //================MAIN FUNC CONNECT PRINTER ==========//
    connectToNiimbotB3S: async () => {
        try {
            console.log("Scanning for NIIMBOT B3S securely via Niimblue layer...");
                        
             // FORCE CLEAN: Strip out any leftover Bluetooth memory data completely!
            if (window.niimbotClient) {
                // If an old connection is active, cut it cleanly
                try { await window.niimbotClient.disconnect(); } catch(e){}
                window.niimbotClient = null; 
            }

            // Explicitly force the client engine onto your physical USB Serial Port channel
            window.niimbotClient = new niimbluelib.NiimbotSerialClient();
            barcodeScanner.setupLifecycleListeners();
     
            // 2. Open the serial connection handler
            // This forces Chrome to open a Serial interface popup instead of a Bluetooth popup!
            await window.niimbotClient.connect();
            
            // 3. Complete the initial wire handshake parameter negotiation
            if (typeof window.niimbotClient.initialize === 'function') {
                await window.niimbotClient.initialize();
            }
        
       
        } catch (error) {
            console.error("❌ USB Link Failed:", error);
            alert("USB Link Failed: " + error.message);
            jhuang.speak("USB Link Failed!")
        }
    },

    setupLifecycleListeners: () => {

        //==== on device connect
        window.niimbotClient.on('connect', async() => {
             
            console.log("Status: Connected to B3S! 🎉");
            jhuang.speak('Printer connected successfully!')
            
            //change button to connect
            document.getElementById('connect-printer-btn').innerText = "Printer Connected ✓"; 

            document.getElementById('scanner-input').focus();
        
             // ====================================================
            // THE 20-SECOND BYPASS: FORCE FIRMWARE ACKNOWLEDGEMENT
            // ====================================================
            // try {
            //     console.log("Sending initialization handshake to unlock B3S firmware...");
                
            //     // 1. Force the internal connection state engine to synchronize
            //     if (typeof window.niimbotClient.initialize === 'function') {
            //         await window.niimbotClient.initialize();
            //     }

            //     // 2. Transmit a low-level heartbeat packet frame directly to the command queue.
            //     // Requesting the print density levels forces the printer to respond on a 
            //     // protected hardware register, which tricks the B3S into staying awake indefinitely.
            //     if (typeof window.niimbotClient.getHeartbeatData === 'function') {
            //         await window.niimbotClient.getHeartbeatData();
            //     } else {
            //         // Fallback: poll density profile configs directly to reset the 20s gate
            //         await window.niimbotClient.getPrinterInfo();
            //     }
                
            //     console.log("🚀 Connection verified by printer! 20s idle timeout has been beaten.");
                
            //     // 3. Now that the link is unlocked, start an aggressive background 
            //     // ping loop every 10 seconds to keep the line hot.
            //     barcodeScanner.startHeartbeat();

            // } catch (fail) {
            //     console.warn("Handshake warning (Safe to ignore if printer stays alive):", fail);
            // }
        }); 
        //==============END DEVICE ON CONNECT =======//


        //=============DEVICE ==============================//
        window.niimbotClient.on('disconnect', () => {
            
            console.log("Status: Physical Cable Unplugged.");
            jhuang.speak('Warning! Kiosk printer cable was unplugged!');
            
            // Clear the visual warning styles right before connecting
            const conbtn = document.getElementById('connect-printer-btn');
            if(!conbtn) return;

                // 2. Visual cue: Flash the button or highlight it so the user knows exactly where to tap
            conbtn.style.border = "3px solid red";
            conbtn.style.animation = "pulse 1.5s infinite";
            conbtn.innerText = "Connect Printer"; 
            
            // 3. Optional: Set up a one-time window listener that forwards the action to the button
            const forwardClick = async (e) => {
                
                // If they clicked the actual button directly, do not intercept it!
                if (e.target === conbtn || conbtn.contains(e.target)) {
                    window.removeEventListener('click', forwardClick);
                    return;
                }

                // Remove the global background interception listener immediately
                window.removeEventListener('click', forwardClick);
                
                // Pass the single valid gesture onto the button
                conbtn.click(); 
            };
            
            window.addEventListener('click', forwardClick);
        })
    },

    /**
     * HEARTBEAT PING: Prevent 40s idle timeout
     * Sends a lightweight firmware status request every 20 seconds
     */
    startHeartbeat: () => {}, // 20,000ms = 20 seconds (Safely beneath the 40s gate)

    stopHeartbeat: () => {},

    //===========PRINTER FUNCS ===============
    printSeminarBadge: async (firstName, fullName) =>{
        // 1. Guard check looking for your active global client instance
        if (!window.niimbotClient) {
            alert("Printer connection not active! Please click your main Connect button first.");
            return;
        }
        
        try {
            console.log("🚀 STARTING AUTOMATED B3S DATA PIPELINE...");
            
            const client = window.niimbotClient;
    
            // 1. Temporarily pause background status tracking to clear the data pipe
            client.setPacketInterval(5); // ⚡ Keeping your lightning-fast 5ms setting!

            // 2. Generate your optimized, un-crashable canvas size
            const canvas = document.createElement('canvas');
            canvas.width = 560;
            canvas.height = 240; // 🔒 Keeping the magic 240 canvas size key setting!
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#FFFFFF'; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 3. DYNAMIC TEXT RENDERING (Swapped your test strings for the arguments!)
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 55px Arial';  //FROM 52PX TO 54 
            ctx.textAlign = 'center';
            
            // Prints the dynamic first name passed from the QR code scanner
            ctx.fillText(String(firstName).toUpperCase(), 280, 60); 

            ctx.fillRect(60, 95, 440, 5); // Your perfect separator accent bar
                            
            ctx.font = 'bold 28px Arial';
            // Prints the dynamic full name passed from the QR code scanner
            ctx.fillText(fullName, 280, 145); 
                            
            ctx.font = 'italic 20px Arial';
            ctx.fillStyle = '#666666';
            ctx.fillText("SEMINAR ATTENDEE", 280, 205);

            // 4. Encode canvas pixels via image parser tool
            console.log("Compiling binary matrix vectors...");
            const encodedImage = niimbluelib.ImageEncoder.encodeCanvas(canvas);

            //==new
            console.log("🚀 INITIALIZING SYNCHRONIZED HARDWARE PIPELINE...");
            
            //==end new
            // Pass "B1" as the task class identifier
            const task = client.abstraction.newPrintTask("B1", {
                totalPages: 1,
                density: 3,
                labelType: 1
            });
            
            console.log("Sending Print Initializer Handshake...");
            await task.printInit();
            
            console.log("Streaming encoded page data packets...");
            await task.printPage(encodedImage, 1);
            
            console.log("Closing session and executing motor rollers...");
            await task.waitForFinished(); 
            
            console.log("🎉 Automated badge print loop executed successfully!");

        } catch (error) {
            console.error("Transmission error during print phase: ", error);
        } finally {
            //*** orig code  */
            jhuang.speak('Printing complete!')
            console.log("Flushing printer buffer channel safely...");
            document.getElementById('scanner-input').value = null;
            console.log("*** printseminarbadge() finally(): Flushing printer buffer channel safely...");

        }//end finally
    },


}; //end obj bardcoedeScanner

//=============END BARCODE SCANNER =========//

//==================IMPORTANT DOCUMENT CONTENT LOADED =================//
document.addEventListener('DOMContentLoaded', function() {

    if (window.niimbluelib) return;
    
    // Breaking the path apart into small pieces to prevent text cutting
    const domain = "https:" + "//" + "cdn" + ".jsdelivr.net";
    const path = "/npm/@mmote/niimbluelib" + "@0.0.1-alpha.41" + "/dist/umd/niimbluelib.min.js";
    const fullURL = domain + path;
    
    console.log("Downloading library from: " + fullURL);
    
    const script = document.createElement('script');
    script.src = fullURL;
    script.onload = () => console.log("✅ Niimblue library downloaded and initialized successfully!");
    script.onerror = () => console.error("❌ Failed to download library from CDN.");
    document.head.appendChild(script);
    
    console.log('======DOMContenLoaded====')
    displayEvents();

    //connect to socket.io util.js
    jhuang.connectsocket()

    barcodeScanner.init();

    jhuang.speak('ready!')
        
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
    document.addEventListener('click', async (e) => {
         const targetId = e.target.id || e.target.dataset.action; // or whatever your logic checks

        switch (targetId) {
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

            case 'test-printer-btn':
                e.preventDefault();
                
                // 1. UPDATED GUARD: Verify the library instance exists 
                if (!window.niimbotClient) {
                    alert("USB Cable disconnected! Please click Connect button first.");
                    break;
                }

                try {
                    console.log("🚀 STARTING SYNCHRONIZED B3S DATA PIPELINE...");
                    const client = window.niimbotClient;

                    client.setPacketInterval(5); // Slightly higher delay buffer to support larger B3S labels

                    // 2. Generate test label canvas
                    const canvas = document.createElement('canvas');
                    // canvas.width = 240;
                    // canvas.height = 240;
                    
                    canvas.width = 560;  //70mm
                    canvas.height = 240; //100mm
                    
                    const ctx = canvas.getContext('2d');

                    ctx.fillStyle = '#FFFFFF'; 
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    jhuang.toggleLoading('dgrp-grid',true,"PRINTING pls wait!!!")

                    const firstName = "KATRINA"    
                    const fullName = "Katrina Uy" // Added variable to test subtitle line

                    // Dynamic Text Elements Layout Rendering
                    ctx.fillStyle = '#000000';
                    ctx.font = 'bold 52px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(String(firstName).toUpperCase(), 280, 60); // Now 280 is perfectly centered!

                    // 2. THE SEPARATOR ACCENT BAR
                    ctx.fillRect(60,95,440,5); // Placed elegantly beneath her name tracking center

                    // 3. FULL NAME SUBTITLE (Now visible inside the expanded 360 canvas space)
                    ctx.font = 'bold 28px Arial';
                    ctx.fillText(fullName, 280, 145); // Centered nicely in the middle deck

                    // 4. SEMINAR ATTENDEE BADGE TAG
                    ctx.font = 'italic 20px Arial';
                    ctx.fillStyle = '#666666';
                    ctx.fillText("SEMINAR ATTENDEE", 280, 205); // Bottom tracking marker row

                    // 3. Encode canvas pixels via image parser tool
                    console.log("Compiling binary matrix vectors...");
                    const encodedImage = niimbluelib.ImageEncoder.encodeCanvas(canvas);

                    // 4. FIX HERE: Pass "B1" as the task class identifier (B3S uses the B1 class layout!)
                    const task = client.abstraction.newPrintTask("B1", {
                        totalPages: 1,
                        density: 3,
                        labelType: 1
                    });
                    
                    console.log("Sending Print Initializer Handshake...");
                    await task.printInit();
                    
                    console.log("Streaming encoded page data packets...");
                    await task.printPage(encodedImage, 1);
                    
                    console.log("Closing session and executing motor rollers...");
                    await task.waitForFinished(); 
               

                } catch (error) {
                    console.error("Transmission error during print phase: ", error);
                } finally {
                    console.log("🎉 testprint():finally() == Print loop executed successfully! Motor should feed.");
                    jhuang.toggleLoading('dgrp-grid',false,null)
                }

            break;
        
        }//eofsw
    })//end doc click


    // ✅ BIND DIRECTLY TO THE BUTTON ID ONLY
    document.getElementById('connect-printer-btn').addEventListener('click', async (e) => {
        // Stop the event from bubbling up to any other page-wide listeners or forms
        e.preventDefault();
        e.stopPropagation();

        //const targetId = e.target.id || e.target.dataset.action; // or whatever your logic checks

        e.currentTarget.style.border = "";
        e.currentTarget.style.animation = "";
               
        console.log("User physically clicked the printer connection button.");
        
        // Fire the connection wizard cleanly
        await barcodeScanner.connectToNiimbotB3S();

          
    });

    /*===========  MODAL LISTENERS BELOW ==============*/
    // ===== Listener to trigger fetch() when Dashboard Modal is fully shown =====
    const dashModalElement = document.getElementById('dashboardModal');

    dashModalElement.addEventListener('shown.bs.modal', function () {
        console.log("Dashboard modal is fully visible. Triggering data fetch...");
        
        // Target your inner data container
        const gridContainer = document.getElementById('dgrp-grid');
        ///gridContainer.innerHTML = '<span class="text-light opacity-50 small"><i class="bi bi-arrow-clockwise hris-spin me-2"></i>Loading data...</span>';

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

