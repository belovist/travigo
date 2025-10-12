const TravelPlannerApp = (() => {
    const STORAGE_KEYS = {
        user: 'travelplanner:user',
        trips: 'travelplanner:trips',
        activeTrip: 'travelplanner:activeTripId',
    };

    const getStoredJSON = (key, fallback) => {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            console.warn(`TravelPlanner: unable to parse localStorage key ${key}`, error);
            return fallback;
        }
    };

    const setStoredJSON = (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    };

    const getUser = () => getStoredJSON(STORAGE_KEYS.user, null);
    const setUser = (email) => setStoredJSON(STORAGE_KEYS.user, { email });
    const getTrips = () => getStoredJSON(STORAGE_KEYS.trips, []);
    const setTrips = (trips) => setStoredJSON(STORAGE_KEYS.trips, trips);

    const createTrip = ({ name, type, startDate, duration, members, notes }) => ({
        id: crypto.randomUUID ? crypto.randomUUID() : `trip-${Date.now()}`,
        name,
        type,
        startDate,
        duration,
        members,
        notes,
        createdAt: new Date().toISOString(),
    });

    const formatDateRange = (startDate, duration) => {
        if (!startDate || !duration) return '—';
        const start = new Date(startDate);
        if (Number.isNaN(start.getTime())) return '—';
        const end = new Date(start);
        end.setDate(start.getDate() + Number(duration) - 1);
        const opts = { day: 'numeric', month: 'short', year: 'numeric' };
        return `${start.toLocaleDateString(undefined, opts)} → ${end.toLocaleDateString(undefined, opts)}`;
    };

    const renderNavbarGreeting = () => {
        const user = getUser();
        const greetingEl = document.querySelector('[data-user-greeting]');
        const initialsEl = document.querySelector('[data-user-initials]');
        if (!user || !user.email) {
            if (greetingEl) greetingEl.textContent = 'Welcome!';
            if (initialsEl) initialsEl.textContent = 'TP';
            return;
        }
        const email = user.email.trim();
        if (greetingEl) {
            greetingEl.innerHTML = `Welcome, <strong>${email}</strong>`;
        }
        if (initialsEl) {
            const initials = email
                .split('@')[0]
                .split(/[^a-zA-Z0-9]+/)
                .filter(Boolean)
                .map((segment) => segment[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();
            initialsEl.textContent = initials || 'TP';
        }
    };

    const renderTrips = () => {
        const grid = document.querySelector('[data-trip-grid]');
        const countEl = document.querySelector('[data-trip-count]');
        if (!grid) return;
        const trips = getTrips();
        grid.innerHTML = '';

        if (!trips.length) {
            const empty = document.createElement('div');
            empty.className = 'col-12';
            empty.innerHTML = `
                <div class="trip-card text-center py-5">
                    <i class="bi bi-suitcase2 mb-3 fs-1 text-primary"></i>
                    <h3 class="h4">No trips yet</h3>
                    <p class="note-text">Tap “Add Trip” to start planning your next getaway.</p>
                </div>
            `;
            grid.appendChild(empty);
        } else {
            trips
                .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                .forEach((trip) => {
                    const memberList = Array.isArray(trip.members)
                        ? trip.members
                        : String(trip.members || '')
                            .split(',')
                            .map((member) => member.trim())
                            .filter(Boolean);
                    const col = document.createElement('div');
                    col.className = 'col-12 col-sm-6 col-lg-4';
                    col.innerHTML = `
                        <article class="trip-card h-100" data-trip-id="${trip.id}">
                            <div class="trip-card-actions">
                                <h3 class="mb-0">${trip.name}</h3>
                                <button class="delete-trip" type="button" aria-label="Delete trip" data-delete-trip>
                                    <i class="bi bi-trash"></i>
                                    <span class="d-none d-md-inline">Delete</span>
                                </button>
                            </div>
                            <div class="trip-meta">
                                <div><strong>Type:</strong> ${trip.type}</div>
                                <div><strong>Dates:</strong> ${formatDateRange(trip.startDate, trip.duration)}</div>
                                <div><strong>Members:</strong> ${memberList.join(', ') || 'Solo adventure'}</div>
                            </div>
                            <button class="secondary-link text-start" type="button" data-view-trip>View itinerary →</button>
                        </article>
                    `;
                    grid.appendChild(col);
                });
        }

        if (countEl) {
            const label = trips.length === 1 ? 'Trip Planned' : 'Trips Planned';
            countEl.textContent = `${trips.length} ${label}`;
        }
    };

    const handleTripGridInteractions = () => {
        const grid = document.querySelector('[data-trip-grid]');
        if (!grid) return;

        grid.addEventListener('click', (event) => {
            const deleteButton = event.target.closest('[data-delete-trip]');
            if (deleteButton) {
                const card = deleteButton.closest('[data-trip-id]');
                if (card) {
                    deleteTrip(card.getAttribute('data-trip-id'));
                }
                event.stopPropagation();
                return;
            }

            const viewButton = event.target.closest('[data-view-trip]');
            const card = event.target.closest('[data-trip-id]');
            if (card && viewButton) {
                viewTripDetails(card.getAttribute('data-trip-id'));
            }
        });
    };

    const addTrip = (tripInput) => {
        const trips = getTrips();
        const members = tripInput.members
            .split(',')
            .map((member) => member.trim())
            .filter(Boolean);
        const newTrip = createTrip({
            name: tripInput.name.trim(),
            type: tripInput.type,
            startDate: tripInput.startDate,
            duration: Number(tripInput.duration),
            members,
            notes: tripInput.notes.trim(),
        });
        trips.push(newTrip);
        setTrips(trips);
        renderTrips();
        return newTrip;
    };

    const deleteTrip = (tripId) => {
        const trips = getTrips().filter((trip) => trip.id !== tripId);
        setTrips(trips);
        renderTrips();
    };

    const viewTripDetails = (tripId) => {
        localStorage.setItem(STORAGE_KEYS.activeTrip, tripId);
        window.location.href = 'trip.html';
    };

    const loadTripDetailPage = () => {
        const wrapper = document.querySelector('[data-trip-wrapper]');
        const emptyState = document.querySelector('[data-trip-empty]');
        if (!wrapper) return;

        const tripId = localStorage.getItem(STORAGE_KEYS.activeTrip);
        const trip = getTrips().find((item) => item.id === tripId);

        if (!trip) {
            if (emptyState) emptyState.classList.remove('d-none');
            wrapper.querySelectorAll('[data-trip-overview], [data-trip-members]').forEach((section) => {
                section.classList.add('d-none');
            });
            return;
        }

        const { name, type, startDate, duration, notes } = trip;
        const members = Array.isArray(trip.members) ? trip.members : String(trip.members || '')
            .split(',')
            .map((member) => member.trim())
            .filter(Boolean);
        const nameEl = wrapper.querySelector('[data-trip-name]');
        const typeEl = wrapper.querySelector('[data-trip-type]');
        const dateEl = wrapper.querySelector('[data-trip-dates]');
        const durationEl = wrapper.querySelector('[data-trip-duration]');
        const notesEl = wrapper.querySelector('[data-trip-notes]');
        const membersList = wrapper.querySelector('[data-trip-members-list]');

        if (nameEl) nameEl.textContent = name;
        if (typeEl) typeEl.textContent = type;
        if (dateEl) dateEl.textContent = formatDateRange(startDate, duration);
        if (durationEl) durationEl.textContent = `${duration} day${Number(duration) > 1 ? 's' : ''}`;
        if (notesEl) notesEl.textContent = notes;

        if (membersList) {
            membersList.innerHTML = '';
            members.forEach((member) => {
                const initials = member
                    .split(' ')
                    .filter(Boolean)
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();
                const chip = document.createElement('div');
                chip.className = 'member-chip';
                chip.innerHTML = `
                    <div class="member-avatar">${initials || 'T'}</div>
                    <div>${member}</div>
                `;
                membersList.appendChild(chip);
            });
        }
    };

    const initLogin = () => {
        const form = document.getElementById('login-form');
        if (!form) return;
        const alertBox = document.querySelector('[data-login-alert]');

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                if (alertBox) alertBox.classList.remove('d-none');
                return;
            }

            const email = form.email.value.trim();
            const password = form.password.value.trim();
            if (!email || !password) {
                if (alertBox) alertBox.classList.remove('d-none');
                return;
            }

            if (alertBox) alertBox.classList.add('d-none');
            setUser(email);
            form.reset();
            window.location.href = 'dashboard.html';
        });
    };

    const initAddTripForm = () => {
        const form = document.getElementById('add-trip-form');
        if (!form) return;
        const modalElement = document.getElementById('addTripModal');
        const modalInstance = modalElement ? bootstrap.Modal.getOrCreateInstance(modalElement) : null;

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                return;
            }

            addTrip({
                name: form['trip-name'].value,
                type: form['trip-type'].value,
                startDate: form['trip-date'].value,
                duration: form['trip-duration'].value,
                members: form['trip-members'].value,
                notes: form['trip-notes'].value,
            });

            if (modalInstance) modalInstance.hide();
            form.reset();
            form.classList.remove('was-validated');
        });
    };

    const initRevealAnimations = () => {
        const revealItems = document.querySelectorAll('[data-reveal]');
        if (!revealItems.length) return;

        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.2 }
        );

        revealItems.forEach((item) => observer.observe(item));
    };

    const initFormValidation = () => {
        document.querySelectorAll('.needs-validation').forEach((form) => {
            form.addEventListener('submit', (event) => {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                } else if (!form.dataset.allowSubmit) {
                    event.preventDefault();
                }
                form.classList.add('was-validated');
            });
        });
    };

    const initNavbarToggle = () => {
            const navToggle = document.querySelector('[data-action="toggle-nav"]');
            const navLinks = document.querySelector('.app-navbar__links');
            if (!navToggle || !navLinks) return;
            navToggle.addEventListener('click', () => {
                const isOpen = navLinks.classList.toggle('is-open');
                navToggle.setAttribute('aria-expanded', String(isOpen));
            });
    };

    const initDashboard = () => {
        renderNavbarGreeting();
        renderTrips();
        handleTripGridInteractions();
        initAddTripForm();
    };

    const initTripDetail = () => {
        renderNavbarGreeting();
        loadTripDetailPage();
    };

    const initLanding = () => {
        renderNavbarGreeting();
    };

    const init = () => {
        document.addEventListener('DOMContentLoaded', () => {
            initNavbarToggle();
            initRevealAnimations();
            initFormValidation();

            const page = document.body.dataset.page;
            switch (page) {
                case 'login':
                    initLogin();
                    break;
                case 'dashboard':
                    initDashboard();
                    break;
                case 'trip':
                    initTripDetail();
                    break;
                case 'landing':
                    initLanding();
                    break;
                case 'about':
                    renderNavbarGreeting();
                    break;
                default:
                    break;
            }
        });
    };

    return {
        init,
        login: setUser,
        addTrip,
        deleteTrip,
        loadTrips: getTrips,
        viewTripDetails,
    };
})();

TravelPlannerApp.init();
