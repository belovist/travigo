// Trip Detail Functionality
const TripDetailApp = (() => {
    let currentTrip = null;
    let travelItems = [];
    let hotelItems = [];
    let eventItems = [];

    const init = () => {
        loadTripData();
        setupEventListeners();
        renderTripDetails();
    };

    const loadTripData = () => {
        const tripId = new URLSearchParams(window.location.search).get('tripId');
        if (tripId) {
            const trips = JSON.parse(localStorage.getItem('travelplanner:trips') || '[]');
            currentTrip = trips.find(trip => trip.id == tripId);
            
            if (currentTrip) {
                travelItems = currentTrip.travelItems || [];
                hotelItems = currentTrip.hotelItems || [];
                eventItems = currentTrip.eventItems || [];
            }
        }
    };

    const setupEventListeners = () => {
        // Add Travel button
        const addTravelBtn = document.querySelector('[data-add-travel]');
        if (addTravelBtn) {
            addTravelBtn.addEventListener('click', () => openModal('travelModal'));
        }

        // Add Hotel button
        const addHotelBtn = document.querySelector('[data-add-hotel]');
        if (addHotelBtn) {
            addHotelBtn.addEventListener('click', () => openModal('hotelModal'));
        }

        // Add Event button
        const addEventBtn = document.querySelector('[data-add-event]');
        if (addEventBtn) {
            addEventBtn.addEventListener('click', () => openModal('eventModal'));
        }

        // Form submissions
        const travelForm = document.getElementById('travel-form');
        if (travelForm) {
            travelForm.addEventListener('submit', handleTravelSubmit);
        }

        const hotelForm = document.getElementById('hotel-form');
        if (hotelForm) {
            hotelForm.addEventListener('submit', handleHotelSubmit);
        }

        const eventForm = document.getElementById('event-form');
        if (eventForm) {
            eventForm.addEventListener('submit', handleEventSubmit);
        }

        // Modal close events
        setupModalCloseEvents();
    };

    const setupModalCloseEvents = () => {
        const modals = ['travelModal', 'hotelModal', 'eventModal'];
        
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                const closeBtn = modal.querySelector('.btn-close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => closeModal(modalId));
                }

                const cancelBtns = modal.querySelectorAll('[data-bs-dismiss="modal"]');
                cancelBtns.forEach(btn => {
                    btn.addEventListener('click', () => closeModal(modalId));
                });

                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        closeModal(modalId);
                    }
                });
            }
        });
    };

    const openModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    };

    const closeModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
            document.body.style.overflow = '';
            
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
                form.classList.remove('was-validated');
            }
        }
    };

    const handleTravelSubmit = (e) => {
        e.preventDefault();
        const form = e.target;
        
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const travelItem = {
            id: Date.now(),
            from: form.querySelector('#travel-from').value,
            to: form.querySelector('#travel-to').value,
            cost: form.querySelector('#travel-cost').value,
            duration: form.querySelector('#travel-duration').value
        };

        travelItems.push(travelItem);
        saveTripData();
        renderTravelItems();
        closeModal('travelModal');
    };

    const handleHotelSubmit = (e) => {
        e.preventDefault();
        const form = e.target;
        
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const hotelItem = {
            id: Date.now(),
            name: form.querySelector('#hotel-name').value,
            location: form.querySelector('#hotel-location').value,
            cost: form.querySelector('#hotel-cost').value,
            duration: form.querySelector('#hotel-duration').value
        };

        hotelItems.push(hotelItem);
        saveTripData();
        renderHotelItems();
        closeModal('hotelModal');
    };

    const handleEventSubmit = (e) => {
        e.preventDefault();
        const form = e.target;
        
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const eventItem = {
            id: Date.now(),
            name: form.querySelector('#event-name').value,
            place: form.querySelector('#event-place').value,
            time: form.querySelector('#event-time').value,
            cost: form.querySelector('#event-cost').value
        };

        eventItems.push(eventItem);
        saveTripData();
        renderEventItems();
        closeModal('eventModal');
    };

    const renderTripDetails = () => {
        if (!currentTrip) return;

        // Update trip header
        const tripNameEl = document.querySelector('[data-trip-name]');
        const tripDateEl = document.querySelector('[data-trip-date]');
        
        if (tripNameEl) tripNameEl.textContent = currentTrip.name;
        if (tripDateEl) tripDateEl.textContent = new Date(currentTrip.date).toLocaleDateString();

        // Render people
        renderPeople();
        
        // Render items
        renderTravelItems();
        renderHotelItems();
        renderEventItems();
    };

    const renderPeople = () => {
        const peopleList = document.querySelector('[data-people-list]');
        if (!peopleList || !currentTrip.people) return;

        peopleList.innerHTML = '';
        currentTrip.people.forEach((person, index) => {
            if (person.trim()) {
                const personEl = document.createElement('div');
                personEl.className = 'person-item';
                personEl.innerHTML = `
                    <div class="person-avatar">
                        <img src="images/profile-placeholder.svg" alt="${person}">
                    </div>
                    <span>${person}</span>
                `;
                peopleList.appendChild(personEl);
            }
        });
    };

    const renderTravelItems = () => {
        const travelList = document.querySelector('[data-travel-list]');
        if (!travelList) return;

        travelList.innerHTML = '';
        
        if (travelItems.length === 0) {
            travelList.innerHTML = '<p class="note-text">No travel items added yet.</p>';
            return;
        }

        travelItems.forEach(item => {
            const itemEl = createItemCard(
                `${item.from} → ${item.to}`,
                `${item.duration}${item.cost ? ` • $${item.cost}` : ''}`,
                () => removeTravelItem(item.id)
            );
            travelList.appendChild(itemEl);
        });
    };

    const renderHotelItems = () => {
        const hotelList = document.querySelector('[data-hotel-list]');
        if (!hotelList) return;

        hotelList.innerHTML = '';
        
        if (hotelItems.length === 0) {
            hotelList.innerHTML = '<p class="note-text">No hotels added yet.</p>';
            return;
        }

        hotelItems.forEach(item => {
            const itemEl = createItemCard(
                item.name,
                `${item.location}${item.duration ? ` • ${item.duration}` : ''}${item.cost ? ` • $${item.cost}/night` : ''}`,
                () => removeHotelItem(item.id)
            );
            hotelList.appendChild(itemEl);
        });
    };

    const renderEventItems = () => {
        const eventList = document.querySelector('[data-event-list]');
        if (!eventList) return;

        eventList.innerHTML = '';
        
        if (eventItems.length === 0) {
            eventList.innerHTML = '<p class="note-text">No events added yet.</p>';
            return;
        }

        eventItems.forEach(item => {
            const timeStr = item.time ? new Date(item.time).toLocaleString() : '';
            const itemEl = createItemCard(
                item.name,
                `${item.place}${timeStr ? ` • ${timeStr}` : ''}${item.cost ? ` • $${item.cost}` : ''}`,
                () => removeEventItem(item.id)
            );
            eventList.appendChild(itemEl);
        });
    };

    const createItemCard = (title, subtitle, onRemove) => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-info">
                <h4>${title}</h4>
                <p>${subtitle}</p>
            </div>
            <button class="remove-btn" onclick="this.closest('.item-card').remove()">
                <i class="bi bi-trash"></i>
            </button>
        `;
        return card;
    };

    const removeTravelItem = (id) => {
        travelItems = travelItems.filter(item => item.id !== id);
        saveTripData();
        renderTravelItems();
    };

    const removeHotelItem = (id) => {
        hotelItems = hotelItems.filter(item => item.id !== id);
        saveTripData();
        renderHotelItems();
    };

    const removeEventItem = (id) => {
        eventItems = eventItems.filter(item => item.id !== id);
        saveTripData();
        renderEventItems();
    };

    const saveTripData = () => {
        if (!currentTrip) return;

        currentTrip.travelItems = travelItems;
        currentTrip.hotelItems = hotelItems;
        currentTrip.eventItems = eventItems;

        const trips = JSON.parse(localStorage.getItem('travelplanner:trips') || '[]');
        const tripIndex = trips.findIndex(trip => trip.id === currentTrip.id);
        
        if (tripIndex !== -1) {
            trips[tripIndex] = currentTrip;
            localStorage.setItem('travelplanner:trips', JSON.stringify(trips));
        }
    };

    return {
        init
    };
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    TripDetailApp.init();
});
