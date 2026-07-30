const myIp = "http://192.168.1.16:10000" 
//const myIp= "https://asn-jtgrp-api.onrender.com"

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

    //show modal box

}//===end obj