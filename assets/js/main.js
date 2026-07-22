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

        document.addEventListener('DOMContentLoaded', displayEvents);

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

        ///copyright
        // Automatically injects the current system calendar year into the footer
        document.getElementById('copyright-year').textContent = new Date().getFullYear();

