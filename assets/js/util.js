//const myIp = "http://192.168.1.50:10000" 
const myIp= "https://asn-jtgrp-api.onrender.com"

//speech synthesis
const synth = window.speechSynthesis;

let voices = [];
voices = synth.getVoices()
                
voices.every(value => {
    if(value.name.indexOf("English")>-1){
        console.log( "bingo!-->",value.name, value.lang )
        
    }
})

const jhuang = {
    speak:(theMsg)=> {
                        
        console.log("SPEAK()")
        
        // If the speech mode is on we dont want to load
        // another speech
        if(synth.speaking) {
            //alert('Already speaking....');
            return;
        }	

        const speakText = new SpeechSynthesisUtterance(theMsg);

        // When the speaking is ended this method is fired
        speakText.onend = e => {
            //console.log('Speaking is done!');
        };
        
        // When any error occurs this method is fired
        speakText.error = e=> {
            console.error('Error occurred...');
        };

        // Checking which voices has been chosen from the selection
        // and setting the voice to the chosen voice
        
        
        voices.forEach(voice => {
            if(voice.name.indexOf("English")>-1){	
                ///// take out bring back later, 
                //console.log("speaking voice is ",voice.name)
                speakText.voice = voice
                
            }
            
        });

        // Setting the rate and pitch of the voice
        speakText.rate = 1
        speakText.pitch = 1

        // Finally calling the speech function that enables speech
        synth.speak(speakText)


    },//end func speak	
  
    //=============upload registrants excel file =============//
    qrxls:()=>{
        //for upload pdf
        const frmupload = document.getElementById('hrisuploadForm')
        
            jhuang.Toasted('Uploading, please wait!!!',3000,false)
            jhuang.speak('Uploading, please wait!!!')

            jhuang.toggleButtonLoading("hris-upload-btn", "Uploading...", true);
        
            
            //hris.waitingIndicator.style.display = 'block'

            fetch(`${myIp}/qr/qrxls`, {
                //method:'GET',
                method: 'POST',
                body: new FormData(frmupload),
            })
            .then( (response) => {
                return response.json() // if the response is a JSON object
            })
            .then( (data) =>{
                if(data.status){
                    console.log ('vertiv done!!', data )
                    jhuang.speak(data.message)
                    jhuang.toggleButtonLoading("hris-upload-btn", null , false);
        
                    // Select the form element
                    const form = document.querySelector('#hrisuploadForm'); // or use class selector

                    // Reset the form
                    form.reset();

                    jhuang.hideModal('hrisloadModal',2000)//then close form    

                    //fhris.waitingIndicator.style.display = 'none'
                }
            })
            // Handle the success response object
            .catch( (error) => {
                console.log(error) // Handle the error response object
            });

            //e.preventDefault()
            console.log('===HRIS SUBMITTTTT===')
            
        //=================END FORM SUBMIT==========================//
    
    },

    hideModal:(cModal,nTimeOut)=>{
        setTimeout(function(){ 
            const myModalEl = document.getElementById(cModal)
            let xmodal = bootstrap.Modal.getInstance(myModalEl)
            xmodal.hide()
           
        }, nTimeOut)
    },

    Toasted:async(msg,nDuration,lClose)=>{
        Toastify({
            text: msg ,
            duration: nDuration,
            escapeMarkup: false, //to create html
            close: lClose,
            position:'center',
            offset:{
                x: 0,
                y:100//window.innerHeight/2 // vertical axis - can be a number or a string indicating unity. eg: '2em'
            },
            style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
            }
        }).showToast();
        
    }, //===end toasted!

    toggleButtonLoading: (buttonId, label, toggle) => {
        const btn = document.getElementById(buttonId);
        if (!btn) return;

        if (toggle) {
            // Save original content only once
            if (!btn.dataset.originalHtml) {
            btn.dataset.originalHtml = btn.innerHTML;
            }
            btn.disabled = true;

            const loadingLabel = label || btn.textContent.trim() || "Loading...";

            // Bootstrap spinner example; change classes as needed
            btn.innerHTML = `
            <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            ${loadingLabel}
            `;
        } else {
            // Restore original content
            if (btn.dataset.originalHtml) {
            btn.innerHTML = btn.dataset.originalHtml;
            }
            btn.disabled = false;
        }
    },

    modalShow: (elemId) => {
        // 1. Locate the physical target modal wrapper element in your HTML
        const modalTarget = document.getElementById(elemId); 
        
        // 2. Initialize a fresh Bootstrap modal control engine instance
        const modalInstance = new bootstrap.Modal(modalTarget);
        
        // 3. Force the overlay to open smoothly right on the screen
        modalInstance.show();
    },

    
    toggleLoading: (elemId, isLoading, msg) => {

        const gridContainer = document.getElementById(elemId);
        
        if (isLoading) {
            // Check if an overlay is already active to prevent duplicates
            if (document.getElementById("grid-loading-overlay")) return;

            // Create a dark glass overlay container with a Bootstrap spinner and text
            const overlay = document.createElement("div");
            overlay.id = "grid-loading-overlay";
            overlay.className = "d-flex flex-column align-items-center justify-content-center position-absolute top-0 start-0 w-100 h-100";
            overlay.style.backgroundColor = "rgba(33, 37, 41, 0.75)"; // Matches your #212529 dark theme background
            overlay.style.zIndex = "1050"; // Places it over sticky headers
            
            overlay.innerHTML = `
            <div class="spinner-border text-info" role="status" style="width: 2.5rem; height: 2.5rem;"></div>
            <span class="text-white-50 mt-2 small text-uppercase tracking-wider" style="letter-spacing: 1px;">${msg}</span>
            `;
            
            // Ensure the parent container can hold absolute positioning bounds
            gridContainer.style.position = "relative";
            gridContainer.appendChild(overlay);
        } else {
            // Safely strip away the loading layout once data arrives
            const overlay = document.getElementById("grid-loading-overlay");
            if (overlay) overlay.remove();
        }
    },

    connectsocket:()=>{
        let authz = []
            authz.push( 'testID' )
            authz.push( 'Test User')
            authz.push( 'qrcoder' )
            
            //console.log(authz[1])

            //==HANDSHAKE FIRST WITH SOCKET.IO
            const userName = { token : authz[1] , emp_id: authz[0], mode: authz[2]}//full name token

            jhuang.socket = io.connect(`${myIp}`, {
                //withCredentials: true,
                transports: ['websocket', 'polling'], // Same as server
                upgrade: true, // Ensure WebSocket upgrade is attempted
                rememberTransport: false, //Don't keep transport after refresh
                query:`qrcode=${JSON.stringify(userName)}`
                // extraHeaders: {
                //   "osndp-header": "osndp"
                // }
            });//========================initiate socket handshake ================

             jhuang.socket.on('reset-grid', (data) => {
                console.log('received command to replace', data); // Check the transport
                const targetEmail = data.email; // Example scanned payload

                jhuang.speak( `${data.name} registered!`)

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

            });
   
    
            jhuang.socket.on('connect', () => {
                console.log('Connected to vertiv Socket.IO server using:', jhuang.socket.io.engine.transport.name); // Check the transport
            });

            jhuang.socket.on('disconnect', () => {
                console.log('Disconnected from vertiv Socket.IO server');
            });
    },

    scrollsTo:(cTarget)=>{
        //asn.collapz()
        const elem = document.getElementById(cTarget)
        elem.scrollIntoView(true,{ behavior: 'smooth', block:'start', inline:'nearest' });

	},

    //show modal box

}//===end obj
window.jhuang = jhuang