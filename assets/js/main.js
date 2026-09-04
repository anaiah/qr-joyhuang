//===== load grid
document.getElementById('dgrp-grid').innerHTML=""
let client = null;
let heartbeatInterval = null;

const grid = new gridjs.Grid({
     // 1. Keep your selector filter active
    search: {
        enabled: true,
        selector: (cell, rowIndex, cellIndex) => {
            if (cellIndex === 0) return cell;
            return ''; 
        }
    },
    
    columns: [
        {
            name: "Name",
            width: "100%",
            formatter: (cell, row) => {
                // FETCH VALUES FROM BOTH STRUCTURAL TRACKING LAYERS
                const sourceObj = row?.data || {};
                
                const registeredName   = sourceObj.full_name || row?.cells[0]?.data;
                const registeredEmail  = sourceObj.email     || row?.cells[1]?.data;
                const registeredCompany = sourceObj.company   || row?.cells[3]?.data;
                const registeredEvent   = sourceObj.event     || row?.cells[4]?.data;
                                
                const registeredArrive = (sourceObj.arrived !== undefined) ? sourceObj.arrived : 
                                        (row?.cells[2]?.data !== undefined) ? row?.cells[2]?.data : 
                                        (row?.cells[3]?.data !== undefined) ? row?.cells[3]?.data : null;

                if (!registeredName) {
                    return gridjs.html(`<div style="font-family: Arial, sans-serif; color: #666666; font-size: 0.85rem; padding: 8px;">Syncing row node...</div>`);
                }

                // RELAXED EQUALITY LOGIC
                const isArrived = registeredArrive == 1 || registeredArrive === true || registeredArrive === "true";
                const statusText  = isArrived ? "Arrived" : "Pending";
                const badgeBorder = isArrived ? "border: 1px solid #000000; color: #000000;" : "border: 1px solid #777777; color: #777777; font-style: italic;";
                const statusIcon  = isArrived ? "bi-check-circle-fill" : "bi-clock-history";
                
                const trackingIdAttr = registeredEmail ? String(registeredEmail).trim() : '';

                // 💡 PREPARE NAME ARGUMENTS FOR THE PRINTING FUNCTION
                // 1. Separate the first name automatically (split string by spaces and grab item 0)
                const derivedFirstName = String(registeredName).trim().split(" ")[0];
                
                // 2. Escape any single quotes in the strings so they don't crash your onclick attribute string parsing!
                const safeFirstName = derivedFirstName.replace(/'/g, "\\'");
                const safeFullName  = String(registeredName).replace(/'/g, "\\'");

                // Safety check to ensure we don't format the custom empty state row
                if (registeredName === "") {
                    return gridjs.html(`
                        <div style="position: absolute; left: 0; width: 100%; text-align: center; color: #666666; font-family: Arial, sans-serif; font-size: 0.9rem; font-weight: 500; padding: 40px 0; background-color: #FFFFFF; pointer-events: none; border-bottom: 1px solid #000000;">
                        No matching records found.
                        </div>
                    `);
                } else {
                     return gridjs.html(`
                        <!-- PRINT PREVIEW CONTAINER LAYOUT -->
                        <div class="p-3 w-100 mx-auto" 
                             style="background-color: #FFFFFF; max-width: 100%; box-sizing: border-box; font-family: Arial, Helvetica, sans-serif;">
                            
                            <!-- Header Title Line Layout Matrix -->
                            <div class="d-flex justify-content-between align-items-center pb-1" style="">
                                <h6 class="m-0 fw-bold tracking-wide" style="color: #000000; font-family: Arial, sans-serif; font-size: 1.05rem;">
                                    ${registeredName.toUpperCase()} 
                                </h6>
                                
                                <!-- 💡 THE PRINT FUNCTION BUTTON ADDITION:
                                     Maps your parameters straight to printSeminarBadge() inside the button gesture! -->
                                <button onclick="barcodeScanner.printSeminarBadge('${safeFirstName}', '${safeFullName}')"
                                        class="btn btn-sm btn-outline-dark"
                                        style="font-family: Arial, sans-serif; font-size: 0.75rem; font-weight: bold; border-radius: 0px; padding: 3px 10px; border: 1px solid #000000; background-color: #FFFFFF; color: #000000;">
                                    🖨️ RE-PRINT BADGE
                                </button>
                            </div>

                            <!-- Metadata Info Matrix -->
                            <div class="row g-1 px-1" style="color: #000000; font-family: Arial, sans-serif;">
                                <div class="col-12 d-flex align-items-center gap-2">
                                    <span class="fw-bold text-uppercase" style="width: 55px; font-size: 0.8rem; color: #444444;">Email:</span>
                                    <span style="font-size: 0.9rem; color: #000000;">${registeredEmail}</span>
                                </div>
                                
                                <div class="col-12 d-flex align-items-center gap-2">
                                    <span class="fw-bold text-uppercase" style="width: 55px; font-size: 0.8rem; color: #444444;">Co.:</span>
                                    <span style="font-size: 0.9rem; color: #000000;"> ${registeredCompany}</span>
                                </div>
                                
                                <div class="col-12 d-flex align-items-center gap-2">
                                    <span class="fw-bold text-uppercase" style="width: 55px; font-size: 0.8rem; color: #444444;">Event:</span>
                                    <span style="font-size: 0.9rem; color: #000000;">${registeredEvent}</span>
                                </div>

                                <div class="col-12 d-flex align-items-center gap-2">
                                    <span class="fw-bold text-uppercase" style="width: 55px; font-size: 0.8rem; color: #444444;">Status:</span>
                                    <span class="px-2 py-0.5" 
                                        data-badge-container="${trackingIdAttr}" 
                                        style="font-size: 0.7rem; font-weight: bold; font-family: Arial, sans-serif; text-transform: uppercase; ${badgeBorder}">
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
            hidden: true 
        },
        {
            name: "arrived",
            hidden: true 
        },
        {
            name: "company",
            hidden: true 
        },
        {
            name: "event",
            hidden: true 
        },

    ],

    data: [],
    //data: [["", "", "No matching records found.", "", "", "", ""]] ,
    sort: true,
    pagination: {
        limit: 20,
        summary: true,
        buttonsCount: 3
    },
    fixedHeader: true,
    // 🌟 ADD THIS BLOCK RIGHT HERE INSIDE THE CONFIGURATION:
    height: '480px', // Forces the internal JS container logic to hard-lock scroll bounds
        // ========================================================
    // 🖨️ THE HARD INSULATED PRINT PREVIEW COMPONENT STYLING
    // Adding !important overrides any inherited variables from your main styles!
    // ========================================================
    style: {
        container: {
            'font-family': 'Arial, Helvetica, sans-serif !important',
            'background-color': '#FFFFFF !important',
            'color': '#000000 !important',
            'box-shadow': 'none !important'
        },
        input: {
            'font-family': 'Arial, sans-serif !important',
            'background-color': '#FFFFFF !important',
            'color': '#000000 !important',
            'border': '1px solid #000000 !important',
            'border-radius': '0px !important',
            'padding': '8px 12px !important'
        },
        table: {
            'background-color': '#FFFFFF !important',
            'border': '1px solid #000000 !important'
        },
        th: {
            'background-color': '#F2F2F2 !important', // Forces the clean light-grey column header block
            'color': '#000000 !important',
            'font-family': 'Arial, sans-serif !important',
            'border-bottom': '2px solid #000000 !important',
            'box-shadow': 'none !important'
        },
        td: {
            'background-color': '#FFFFFF !important',
            'color': '#000000 !important',
            'font-family': 'Arial, sans-serif !important',
            'border-bottom': '1px solid #CCCCCC !important'
        },
        footer: {
            'background-color': '#FFFFFF !important',
            'border-top': '1px solid #000000 !important',
            'color': '#000000 !important'
        }
    },

    // ========================================================
    // 🗣️ THE LANGUAGE OVERRIDE FIX:
    // This forces Grid.js to replace its default translations.
    // It will wipe out "Type a keyword..." completely!
    // ========================================================
    language: {
        search: {
            placeholder: 'Search for a name...' // 👈 Your custom text will display perfectly here!
        }
    }
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

             // ========================================================
            // 🛡️ THE TARGET GUARD CLAUSE FIX:
            // Check if the user is typing inside the Grid.js search bar.
            // Grid.js inputs use the class string 'gridjs-search-input'.
            // ========================================================
            if (e.target.classList.contains('gridjs-search-input') || e.target.closest('.gridjs-search')) {
                // It's a search box input! Exit immediately and let Grid.js handle the character.
                // This stops the character from getting intercepted by the scanner engine.
                return; 
            }

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

        console.log(incomingUrl, "=== Raw Scanned URL Received ===");
        
        const myNewURL = `${myIp}/qr/mark-attendance/${incomingUrl}`; // http://192.168.1.23:10000

        // 2. Perform the domain routing swap cleanly
        
        // 3. CRUCIAL FIX: Encode the URL correctly so spaces like "Katrina Uy" don't break the fetch!
        // This converts spaces into "%20", preventing the 404 truncation drop
        const sanitizedUrl = encodeURI(myNewURL); 

        // let cleanUrl = sanitizedUrl.replace(/\/$/, "");
         
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
                let mydata = {name: data.xname, email: data.xemail, displayname: data.displayname, company: data.xcompany, event: data.xevent}
                
                //barcodeScanner.updategrid(mydata) 
                await barcodeScanner.printSeminarBadge( mydata )
                //await barcodeScanner.previewSeminarBadge( mydata )
            
            }//eif
        } catch (error) {
            console.error("Failed to commit scan securely:", error);
            jhuang.speak("Database network error! Please check your connection and try again.");
            // =======================================================================
        } finally {
            // Turn off the lock when everything is completely finished
            //isScanningActive = false; 
        }
        
    },//end sendscan

    //=========UPGRADE GRID ============
    updateGrid: async (data )=> {

        console.log('===updategrid() Grid received', data); // Check the transport
        const targetEmail = data.email; // Example scanned payload

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
        
    },

    //helper
    getFontSizeForLength : (text, maxSize, minSize, threshold = 15) => {
        if (text.length <= threshold) return maxSize;
        // shrink 1px per character over the threshold, but never go below minSize
        const shrunk = maxSize - (text.length - threshold) * 1.5;
        return Math.max(shrunk, minSize);
    },

    //===========PRINTER FUNCS ===============
    printSeminarBadge: async ( prndata ) => {
        if (!window.niimbotClient) {
            alert("Printer connection not active! Please click your main Connect button first.");
            return;
        }

        try {
            console.log("🚀 PRINTING PORTRAIT BADGE (HARD BUFFER WORKAROUND)...");
            const client = window.niimbotClient;
            client.setPacketInterval(5);

            // 🎛️ ZONE #0 — PHYSICAL HARDWARE DIMENSIONS
            const PW = 560; // Max edge-to-edge side printable width
            const PH = 640; // Max length matching your 80mm paper roll run

            const canvas = document.createElement('canvas');
            canvas.width = PH;   // length axis (pre-rotation)
            canvas.height = PW;  // width axis (pre-rotation)
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.translate(0, canvas.height);
            ctx.rotate(-90 * Math.PI / 180);

            // ========================================================
            // 🖼️ ASSET LOADING: PROMISE PIPELINE FOR THE LOGO IMAGE
            // ========================================================
            const logoImg = new Image();
            
            // 💡 UPDATED: Locked directly onto your new regional project folder asset path!
            //logoImg.src = "assets/img/vertiv.jpg"; 
            logoImg.src = "assets/img/vertivlogo.png"; 

            await new Promise((resolve, reject) => {
                logoImg.onload = resolve;
                logoImg.onerror = () => {
                    console.warn("⚠️ assets/img/vertiv.jpg not found or could not load. Falling back to text.");
                    resolve(); 
                };
            });

            // ========================================================
            // 🎨 ZONE #1 — HEADER BAR (ORIGINAL BLACK CONFIGURATION)
            // ========================================================
            const barH = 145; // Proportional header banner height to fit your logo perfectly
            
            ctx.fillStyle = '#000000'; // Back to your bold black background block!
            ctx.fillRect(0, 0, PW, barH);

            // 💡 NEW LOGO SPECIFICATIONS: Set exactly to your native 190x64 asset dimensions!
            const imgW = 230;//280; //190;
            const imgH = 75; //95; //64;
            const assetY = (barH - imgH) / 2;

            // A. DRAW LOGO IMAGE USING AN ISOLATED WHITE BLOCK CONTAINER BUFFER
           if (logoImg.complete && logoImg.naturalWidth > 0) {
                //ctx.fillStyle = '#FFFFFF';
                //ctx.fillRect(24, assetY - 6, imgW + 12, imgH + 12);

                // 🧹 Clean the logo to pure black/white first (removes anti-aliased gray edges
                // that were causing random parts of the logo to vanish on thermal print)
                const offCanvas = document.createElement('canvas');
                offCanvas.width = imgW;
                offCanvas.height = imgH;
                const offCtx = offCanvas.getContext('2d');
                offCtx.imageSmoothingEnabled = false;
                offCtx.drawImage(logoImg, 0, 0, imgW, imgH);

                const imgData = offCtx.getImageData(0, 0, imgW, imgH);
                const data = imgData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    const bw = brightness > 128 ? 255 : 0; // hard threshold — no gray allowed
                    data[i] = data[i + 1] = data[i + 2] = bw;
                    // alpha (data[i+3]) left untouched
                }
                offCtx.putImageData(imgData, 0, 0);

                ctx.imageSmoothingEnabled = false; // no smoothing when drawing the cleaned version either
                ctx.drawImage(offCanvas, 20, assetY, imgW, imgH); // 30 is left-side margin draw the CLEANED version, not logoImg directly

            } else {
                ctx.fillStyle = '#FFFFFF';
                ctx.textAlign = 'left';
                ctx.font = 'bold 26px Arial';
                ctx.fillText("VERTIV", 20, barH / 2 + 8);
            }
            
            // B. RENDER RIGHT-HAND TEXT (AsiaPRIME)
            ctx.fillStyle = '#FFFFFF'; 
            ctx.textAlign = 'right';
            ctx.font = 'bold 20px Arial'; 
            
            // Keeps text optically balanced to the horizontal center line of your new logo dimensions
            ctx.fillText(prndata.event.toUpperCase(), PW - 30, assetY + (imgH / 2) + 10);

            // ========================================================
            // 🎨 ZONE #2 — ATTENDEE TEXT NAME RENDERING
            // ========================================================
            const nameY = PH * 0.55; 
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'center';

            const nameText = prndata.name.toUpperCase();
            const nameFontSize = barcodeScanner.getFontSizeForLength(nameText, 46, 26); // 👈 shrink if over 15 chars
            ctx.font = `bold ${nameFontSize}px Arial`;
            ctx.fillText(nameText, PW / 2, nameY);

            // ========================================================
            // 🎨 ZONE #3 — COMPANY SUBTITLE
            // ========================================================
            const subtitleY = nameY + 45;
            const companyText = prndata.company.toUpperCase();
            const companyFontSize = barcodeScanner.getFontSizeForLength(companyText, 22, 14);
            ctx.font = `bold ${companyFontSize}px Arial`;
            ctx.fillStyle = '#333333';
            ctx.fillText(companyText, PW / 2, subtitleY);
            // ========================================================
            // 📦 COMPILATION AND STREAM PACKET DELIVERY
            // ========================================================
            const encodedImage = niimbluelib.ImageEncoder.encodeCanvas(canvas);

            const task = client.abstraction.newPrintTask("B1", {
                totalPages: 1,
                density: 3,
                labelType: 1,
                width: PH,
                height: PW,
                printDirection: "top"
            });

            await task.printInit();
            await task.printPage(encodedImage, 1);
            await task.waitForFinished(); 

            console.log("🎉 Automated badge print loop executed successfully!");

        } catch (error) {
            console.error("Transmission error during print phase: ", error);
        } finally {
            
            // update grid
            await barcodeScanner.updateGrid( prndata);

            // announce complete
            jhuang.speak('Printing complete!');

            //reset input field and focus for next scan
            document.getElementById('scanner-input').value = null;
            document.getElementById('scanner-input').focus();
            
        }
    },

    //================MAIN FUNC CONNECT PRINTER ==========//
    connectToNiimbotB3S: async () => {
        try {
            console.log("Scanning for NIIMBOT B3S securely via Niimblue layer...");
                        
             // FORCE CLEAN: Strip out any leftover Bluetooth memory data completely!
            if (window.niimbotClient) {
                // If an old connection is active, cut it cleanly
                try { await window.niimbotClient.disconnect(); } catch(e){}
                window.niimbotClient = null ; 
            }
 
            // Explicitly force the client engine onto your physical USB Serial Port channel
            window.niimbotClient = new niimbluelib.NiimbotSerialClient();

            // 📶 FOR WIRELESS BLUETOOTH CONNECTION (What you were using before)
            //window.niimbotClient = new niimbluelib.NiimbotBluetoothClient();
            //jhuang.speak('printer...')

            barcodeScanner.setupLifecycleListeners();
     
            // 2. Open the serial connection handler
            // This forces Chrome to open a Serial interface popup instead of a Bluetooth popup!
            await window.niimbotClient.connect();
            
            // 3. Complete the initial wire handshake parameter negotiation
            if (typeof window.niimbotClient.initialize === 'function') {
                await window.niimbotClient.initialize();
            }
               
            console.log('abstraction is .. ', window.niimbotClient.abstraction)
            console.log(niimbluelib.getPrinterMetaById(272))

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
        
          
        }); 
        //==============END DEVICE ON CONNECT =======//


        //=============DEVICE ==============================//
        window.niimbotClient.on('disconnect', () => {
            
            console.log("Status: Physical Cable Unplugged.");
            jhuang.speak('Warning! Kiosk printer cable was unplugged!..... Warning! Kiosk printer cable was unplugged!');
            
            // Clear the visual warning styles right before connecting
            const conbtn = document.getElementById('connect-printer-btn');
            if(!conbtn) return;

                // 2. Visual cue: Flash the button or highlight it so the user knows exactly where to tap
            conbtn.style.border = "3px solid red";
            conbtn.style.animation = "pulse 1.5s infinite";
            conbtn.innerText = "🖨️ Connect Printer"; 
            
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
    startHeartbeat: () => {
        barcodeScanner.stopHeartbeat(); // Clear any pre-existing loops
      
        // Run this every 10 seconds. This pushes parameter verification 
        // packets to ensure your tablet defeats the 30-second drop rule.
        heartbeatInterval = setInterval(async () => {
            if (window.niimbotClient && window.niimbotClient.isConnected()) {
                try {
                    console.log("Sending active Bluetooth data ping...");
                    // This pulls hardware profile data to reset the B3S timer
                    await window.niimbotClient.getPrinterInfo(); 
                } catch (err) {
                    console.warn("Bluetooth heartbeat skipped:", err);
                }
            }
        }, 10000); // 10,000ms = 10 seconds is well beneath the 30s threshold
    }, // 20,000ms = 20 seconds (Safely beneath the 40s gate)

    stopHeartbeat: () => {
        if (typeof heartbeatInterval !== 'undefined' && heartbeatInterval) {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;
        }

    },

    previewSeminarBadge: async (prndata) => {
        try {
            const PW = 560;
            const PH = 640;

            const canvas = document.createElement('canvas');
            canvas.width = PH;
            canvas.height = PW;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.translate(0, canvas.height);
            ctx.rotate(-90 * Math.PI / 180);

            const logoImg = new Image();
            logoImg.src = "assets/img/vertivlogo.png";

            await new Promise((resolve) => {
                logoImg.onload = resolve;
                logoImg.onerror = () => {
                    console.warn("⚠️ Logo failed to load — check the path/file.");
                    resolve();
                };
            });

            console.log("Logo loaded?", logoImg.complete, "size:", logoImg.naturalWidth, "x", logoImg.naturalHeight);

            const barH = 145;
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, PW, barH);

            const imgW = 230;//280; //190;
            const imgH = 75; //95; //64;
            const assetY = (barH - imgH) / 2;

             // A. DRAW LOGO IMAGE USING AN ISOLATED WHITE BLOCK CONTAINER BUFFER
           if (logoImg.complete && logoImg.naturalWidth > 0) {
                //ctx.fillStyle = '#FFFFFF';
                //ctx.fillRect(24, assetY - 6, imgW + 12, imgH + 12);

                // 🧹 Clean the logo to pure black/white first (removes anti-aliased gray edges
                // that were causing random parts of the logo to vanish on thermal print)
                const offCanvas = document.createElement('canvas');
                offCanvas.width = imgW;
                offCanvas.height = imgH;
                const offCtx = offCanvas.getContext('2d');
                offCtx.imageSmoothingEnabled = false;
                offCtx.drawImage(logoImg, 0, 0, imgW, imgH);

                const imgData = offCtx.getImageData(0, 0, imgW, imgH);
                const data = imgData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    const bw = brightness > 128 ? 255 : 0; // hard threshold — no gray allowed
                    data[i] = data[i + 1] = data[i + 2] = bw;
                    // alpha (data[i+3]) left untouched
                }
                offCtx.putImageData(imgData, 0, 0);

                ctx.imageSmoothingEnabled = false; // no smoothing when drawing the cleaned version either
                ctx.drawImage(offCanvas, 20, assetY, imgW, imgH); // 30 is left-side margin draw the CLEANED version, not logoImg directly

            } else {
                ctx.fillStyle = '#FFFFFF';
                ctx.textAlign = 'left';
                ctx.font = 'bold 26px Arial';
                ctx.fillText("VERTIV", 20, barH / 2 + 8);
            }

            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'right';
            ctx.font = 'bold 20px Arial';
            
            // Keeps text optically balanced to the horizontal center line of your new logo dimensions
            ctx.fillText(prndata.event.toUpperCase(), PW - 30, assetY + (imgH / 2) + 10);

            const nameY = PH * 0.55; 
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'center';

            const nameText = prndata.name.toUpperCase();
            const nameFontSize = barcodeScanner.getFontSizeForLength(nameText, 46, 26); // 👈 shrink if over 15 chars
            ctx.font = `bold ${nameFontSize}px Arial`;
            ctx.fillText(nameText, PW / 2, nameY);

            // ========================================================
            // 🎨 ZONE #3 — COMPANY SUBTITLE
            // ========================================================
            const subtitleY = nameY + 45;
            const companyText = prndata.company.toUpperCase();
            const companyFontSize = barcodeScanner.getFontSizeForLength(companyText, 22, 14);
            ctx.font = `bold ${companyFontSize}px Arial`;
            ctx.fillStyle = '#333333';
            ctx.fillText(companyText, PW / 2, subtitleY);
            

            // 🖼️ PREVIEW: open the exact canvas as an image, no printing involved
            const dataUrl = canvas.toDataURL('image/png');
            const win = window.open();
            win.document.write(`<img src="${dataUrl}" style="border:1px solid red;">`);

        } catch (error) {
            console.error("Preview error: ", error);
        }
    },
     // A secure, public JSON dataset containing every recognized nation on earth
        
    populateKioskCountries: async () => {
        const dropdown = document.getElementById("country-select");
        dropdown.innerHTML = ""; // Clear any existing options
        try {
            // Calls YOUR backend, not restcountries.com directly — no key exposed to the browser
            const response = await fetch(`${myIp}/qr/countries`);
            const sortedCountries = (await response.json()).sort();

            sortedCountries.forEach(countryName => {
                const option = document.createElement("option");
                option.value = countryName;
                option.innerText = countryName;
                dropdown.appendChild(option);
            });

            console.log(`🎉 Successfully loaded ${sortedCountries.length} countries into the dropdown!`);

        } catch (error) {
            console.error("Failed to fetch international country data array:", error);

            const regionalFallback = ["Philippines", "Singapore", "Malaysia", "Thailand", "Indonesia", "Vietnam", "Cambodia"];
            regionalFallback.sort().forEach(countryName => {
                const option = document.createElement("option");
                option.value = countryName;
                option.innerText = countryName;
                dropdown.appendChild(option);
            });
        }
    },


}; //end obj bardcoedeScanner

//=============END BARCODE SCANNER =========//

//==================IMPORTANT DOCUMENT CONTENT LOADED =================//
document.addEventListener('DOMContentLoaded', async () => {

    if (window.niimbluelib) return;
    
    window.connectedToPrinter = false; // Reset the connection state on page load

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
    
    console.log('====== sanitized github Hostinger DOMContenLoaded====')
    displayEvents();

    //connect to socket.io util.js
    //not need -> jhuang.connectsocket()

    await barcodeScanner.init();

    //barcodeScanner.connectToNiimbotB3S();

    //=============ANNOUNCE ================//
    jhuang.speak('vertiv ONLINE!' )
         
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
    // // Strict real-time character mask for the phone input field
    // document.getElementById('userPhone').addEventListener('input', function (e) {
    //     let value = this.value;

    //     // 1. Check if the very first character is a plus sign
    //     const hasPlus = value.startsWith('+');

    //     // 2. Strip absolutely everything that is not a raw number digit
    //     let cleanNumbers = value.replace(/[^0-9]/g, '');

    //     // 3. Reconstruct the string: re-apply the plus only if it was originally there
    //     this.value = (hasPlus ? '+' : '') + cleanNumbers;
    // });

    // //for email
    // // Automatically removes spaces from the email input in real time
    // document.getElementById('userEmail').addEventListener('input', function () {
    //     this.value = this.value.replace(/\s/g, '');
    // });

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

            // case 'test-printer-btn':
            //     e.preventDefault();
                
            //     // 1. UPDATED GUARD: Verify the library instance exists 
            //     if (!window.niimbotClient) {
            //         alert("USB Cable disconnected! Please click Connect button first.");
            //         break;
            //     }

            //     try {
            //         console.log("🚀 STARTING SYNCHRONIZED B3S DATA PIPELINE...");
            //         const client = window.niimbotClient;

            //         client.setPacketInterval(5); // Slightly higher delay buffer to support larger B3S labels

            //         // 2. Generate test label canvas
            //         const canvas = document.createElement('canvas');
            //         // canvas.width = 240;
            //         // canvas.height = 240;
                    
            //         canvas.width = 560;  //70mm
            //         canvas.height = 240; //100mm
                    
            //         const ctx = canvas.getContext('2d');

            //         ctx.fillStyle = '#FFFFFF'; 
            //         ctx.fillRect(0, 0, canvas.width, canvas.height);

            //         jhuang.toggleLoading('dgrp-grid',true,"PRINTING pls wait!!!")

            //         const firstName = "KATRINA"    
            //         const fullName = "Katrina Uy" // Added variable to test subtitle line

            //         // Dynamic Text Elements Layout Rendering
            //         ctx.fillStyle = '#000000';
            //         ctx.font = 'bold 52px Arial';
            //         ctx.textAlign = 'center';
            //         ctx.fillText(String(firstName).toUpperCase(), 280, 60); // Now 280 is perfectly centered!

            //         // 2. THE SEPARATOR ACCENT BAR
            //         ctx.fillRect(60,95,440,5); // Placed elegantly beneath her name tracking center

            //         // 3. FULL NAME SUBTITLE (Now visible inside the expanded 360 canvas space)
            //         ctx.font = 'bold 28px Arial';
            //         ctx.fillText(fullName, 280, 145); // Centered nicely in the middle deck

            //         // 4. SEMINAR ATTENDEE BADGE TAG
            //         ctx.font = 'italic 20px Arial';
            //         ctx.fillStyle = '#666666';
            //         ctx.fillText("SEMINAR ATTENDEE", 280, 205); // Bottom tracking marker row

            //         // 3. Encode canvas pixels via image parser tool
            //         console.log("Compiling binary matrix vectors...");
            //         const encodedImage = niimbluelib.ImageEncoder.encodeCanvas(canvas);

            //         // 4. FIX HERE: Pass "B1" as the task class identifier (B3S uses the B1 class layout!)
            //         const task = client.abstraction.newPrintTask("B1", {
            //             totalPages: 1,
            //             density: 3,
            //             labelType: 1
            //         });
                    
            //         console.log("Sending Print Initializer Handshake...");
            //         await task.printInit();
                    
            //         console.log("Streaming encoded page data packets...");
            //         await task.printPage(encodedImage, 1);
                    
            //         console.log("Closing session and executing motor rollers...");
            //         await task.waitForFinished(); 
               

            //     } catch (error) {
            //         console.error("Transmission error during print phase: ", error);
            //     } finally {
            //         console.log("🎉 testprint():finally() == Print loop executed successfully! Motor should feed.");
            //         jhuang.toggleLoading('dgrp-grid',false,null)
            //     }

            // break;
        
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
    // ===== Listener to trigger fetch() when Dashboard Modal is fully shown, this will also fetch 
    // ===== all registered attendees 
    const dashModalElement = document.getElementById('dashboardModal');
    dashModalElement.addEventListener('shown.bs.modal', async function () {
        console.log("Dashboard modal is fully visible. Triggering data fetch...");
        
        //=== always focus on input field scan=======
        document.getElementById('scanner-input').value = null;
        document.getElementById('scanner-input').focus();

        //=== connect to printer
        if(!window.connectedToPrinter){
            await barcodeScanner.connectToNiimbotB3S();
            window.connectedToPrinter = true;
        }

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
                    row.arrived,
                    row.company,
                    row.event
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

    //====registration modal show
    const regModalElement = document.getElementById('registrationModal');
    regModalElement.addEventListener('shown.bs.modal', function () {
        console.log("Registration modal is fully visible. Focusing on the first input field...");
        //document.getElementById('userName').focus();
        barcodeScanner.populateKioskCountries();
    });


});/// end domcontentloaded




///copyright
// Automatically injects the current system calendar year into the footer
document.getElementById('copyright-year').textContent = new Date().getFullYear();

