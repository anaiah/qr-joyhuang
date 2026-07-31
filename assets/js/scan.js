let html5QrCode

function onScanSuccess(decodedText, decodedResult) {
        setTimeout(() => {
            html5QrCode.resume()
            //wiithin 4secs erase
            document.getElementById('result').innerText = "Scan Resuming.."
        }, 3000); // Delay of 1000 milliseconds (1 second)

            setTimeout(() => {
            const audio  = new Audio('beep.ogg')
            audio.play().catch(error => {
                console.error("Audio playback failed:", error);
            });
        }, 0); // Delay of 1000 milliseconds (1 second)
        
        let addy = {}

        html5QrCode.pause() //first pause

        let url = `${decodedText}` 
        
        //let temporaryUrl = // 2. Execute the replace method to swap the domains smoothly
        //let updatedUrl = url.replace("https://asn-jtgrp-api.onrender.com/","http://192.168.1.16:10000/");

        document.getElementById('result').innerText = `Scanned Code: ${ decodedText }`;
        //document.getElementById('result').innerText = `Scanned Code: ${ updatedUrl }`;
        
        //alert(url)

        addy.link = decodedText
        //addy.link = updatedUrl

        fetch( updatedUrl  ,{
            //method:'POST',
            //cache:'no-cache',

            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then( (res)  => res.json() )
        .then( (data) => {	
            console.log(data.status) 
            if(data.status){
            let mydata = {name: data.xname, email: data.xemail}

            scan.socket.emit('update-grid', mydata)
            console.log('sending emit ',mydata)
            }
            //  if(data)
            //   Toastify({
            //       text: `Attendee : ${data.name} successfully checked-in!` ,
            //       duration:4000,
            //       escapeMarkup:false, //to create html
            //       close:true,
            //       position:'center',
            //       offset:{
            //           x: 0,
            //           y:100//window.innerHeight/2 // vertical axis - can be a number or a string indicating unity. eg: '2em'
            //       },
            //       style: {
            //       background: "linear-gradient(to right, #00b09b, #96c93d)",
            //       }
            //   }).showToast();
            // } 


            return
        }) 
        .catch(error => { 
            console.log("An error occurred: ", error); 
        })
            
        
}

function onScanError(errorMessage) {
    //console.error(`Scan error: ${errorMessage}`);
}

///===========socket obj=======
const scan = {
    socket:null,
    
    init:()=>{
    let authz = []
    
    authz.push( 'testID' )
    authz.push( 'Test User')
    authz.push( 'qrcode' )
    
    //console.log(authz[1])
    //const myIp = "http://192.168.1.16:10000" 
    const myIp= "https://asn-jtgrp-api.onrender.com"


    //==HANDSHAKE FIRST WITH SOCKET.IO
    const userName = { token : authz[1] , emp_id: authz[0], mode: authz[2]}//full name token

    scan.socket = io.connect(`${myIp}`, {
        //withCredentials: true,
        transports: ['websocket', 'polling'], // Same as server
        upgrade: true, // Ensure WebSocket upgrade is attempted
        rememberTransport: false, //Don't keep transport after refresh
        query:`qrcode=${JSON.stringify(userName)}`
        // extraHeaders: {
        //   "osndp-header": "osndp"
        // }
    });//========================initiate socket handshake ================

    scan.socket.on('connect', () => {
        console.log('Connected to BETTER EDGE Socket.IO server using:', scan.socket.io.engine.transport.name); // Check the transport
    });

    scan.socket.on('disconnect', () => {
        console.log('Disconnected from BETTER EDGE Socket.IO server');
    });

    }
}//end obj scan
    
    

// ============================   DOM CONTENT LOADED Initialize the QR Code scanner
document.addEventListener("DOMContentLoaded", function() {
    html5QrCode = new Html5Qrcode("reader");
    const config = { fps: 10, qrbox: 250 };

    scan.init()///=====initiate socket.io

    html5QrCode.start(
        //{ facingMode: "user" }, //{ facingMode: "environment" },back camera!
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanError
    ).catch(err => {
        console.error(`Unable to start scanning, error: ${err}`);
    });
});


// function onScanSuccess(decodedText, decodedResult) {
// // handle the scanned code as you like, for example:
// console.log(`Code matched = ${decodedText}`, decodedResult);
// }

// function onScanFailure(error) {
// // handle scan failure, usually better to ignore and keep scanning.
// // for example:
// console.warn(`Code scan error = ${error}`);
// }

// let html5QrcodeScanner = new Html5QrcodeScanner(
// "reader",
// { fps: 10, qrbox: {width: 250, height: 250} },
// /* verbose= */ false);
// html5QrcodeScanner.render(onScanSuccess, onScanFailure);
