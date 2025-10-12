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

    const createTrip = ({ name, date, people }) => ({
        id: crypto.randomUUID ? crypto.randomUUID() : `trip-${Date.now()}`,
        name,
        date,
        people: people.filter(person => person.trim()),
        travelItems: [],
        hotelItems: [],
        eventItems: [],
        createdAt: new Date().toISOString(),
    });

    const formatDate = (date) => {
        if (!date) return '—';
        const d = new Date(date);
        if (Number.isNaN(d.getTime())) return '—';
        return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
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
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .forEach((trip) => {
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
                                <div><strong>Date:</strong> ${formatDate(trip.date)}</div>
                                <div><strong>People:</strong> ${trip.people.join(', ') || 'Solo trip'}</div>
                            </div>
                            <button class="secondary-link text-start" type="button" data-view-trip>View Details →</button>
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
        
        const newTrip = createTrip({
            name: tripInput.name.trim(),
            date: tripInput.date,
            people: tripInput.people
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
        window.location.href = `trip-detail.html?tripId=${tripId}`;
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
        const modal = modalElement ? {
            show: () => {
                modalElement.style.display = 'block';
                modalElement.classList.add('show');
                document.body.style.overflow = 'hidden';
            },
            hide: () => {
                modalElement.style.display = 'none';
                modalElement.classList.remove('show');
                document.body.style.overflow = '';
            }
        } : null;

        // Add modal trigger functionality
        const addTripButton = document.querySelector('[data-bs-target="#addTripModal"]');
        if (addTripButton && modal) {
            addTripButton.addEventListener('click', (e) => {
                e.preventDefault();
                modal.show();
            });
        }

        // Add close button functionality
        const closeButtons = modalElement?.querySelectorAll('[data-bs-dismiss="modal"], .btn-close');
        closeButtons?.forEach(button => {
            button.addEventListener('click', () => modal.hide());
        });

        // Close modal when clicking outside
        if (modalElement && modal) {
            modalElement.addEventListener('click', (e) => {
                if (e.target === modalElement) {
                    modal.hide();
                }
            });
        }

        // Add person functionality
        const addPersonBtn = document.getElementById('add-person-btn');
        const peopleContainer = document.getElementById('people-container');
        
        if (addPersonBtn && peopleContainer) {
            addPersonBtn.addEventListener('click', () => {
                const personCount = peopleContainer.children.length + 1;
                const personRow = document.createElement('div');
                personRow.className = 'person-input-row';
                personRow.innerHTML = `
                    <input type="text" class="form-control" placeholder="Person ${personCount}">
                    <button type="button" class="remove-person-btn">
                        <i class="bi bi-trash"></i>
                    </button>
                `;
                peopleContainer.appendChild(personRow);
                
                // Show remove buttons for all rows except first
                updateRemoveButtons();
            });
        }

        // Remove person functionality
        if (peopleContainer) {
            peopleContainer.addEventListener('click', (e) => {
                if (e.target.closest('.remove-person-btn')) {
                    e.target.closest('.person-input-row').remove();
                    updateRemoveButtons();
                }
            });
        }

        const updateRemoveButtons = () => {
            const rows = peopleContainer.querySelectorAll('.person-input-row');
            rows.forEach((row, index) => {
                const removeBtn = row.querySelector('.remove-person-btn');
                if (index === 0) {
                    removeBtn.style.display = 'none';
                } else {
                    removeBtn.style.display = 'block';
                }
            });
        };

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                return;
            }

            // Get all people inputs
            const peopleInputs = peopleContainer.querySelectorAll('input[type="text"]');
            const people = Array.from(peopleInputs)
                .map(input => input.value.trim())
                .filter(name => name);

            if (people.length === 0) {
                alert('Please add at least one person to the trip.');
                return;
            }

            const tripData = {
                name: form['trip-name'].value,
                date: form['trip-date'].value,
                people: people
            };

            addTrip(tripData);

            if (modal) modal.hide();
            form.reset();
            form.classList.remove('was-validated');
            
            // Reset people container
            peopleContainer.innerHTML = `
                <div class="person-input-row">
                    <input type="text" class="form-control" placeholder="Person 1" required>
                    <button type="button" class="remove-person-btn" style="display: none;">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;
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
        const toggles = Array.from(document.querySelectorAll('[data-action="toggle-nav"]'));
        if (!toggles.length) return;

        const getNavLinks = (toggle) => {
            const navbar = toggle.closest('.app-navbar');
            return navbar ? navbar.querySelector('.app-navbar__links') : null;
        };

        const closeNav = (toggle, navLinks) => {
            if (!navLinks) return;
            navLinks.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        };

        toggles.forEach((toggle) => {
            const navLinks = getNavLinks(toggle);
            if (!navLinks) return;

            toggle.addEventListener('click', () => {
                const isOpen = navLinks.classList.toggle('is-open');
                toggle.setAttribute('aria-expanded', String(isOpen));
            });

            navLinks.querySelectorAll('a').forEach((link) => {
                link.addEventListener('click', () => closeNav(toggle, navLinks));
            });
        });

        document.addEventListener('click', (event) => {
            toggles.forEach((toggle) => {
                const navLinks = getNavLinks(toggle);
                const navbar = toggle.closest('.app-navbar');
                if (!navLinks || !navbar) return;
                if (!navbar.contains(event.target)) {
                    closeNav(toggle, navLinks);
                }
            });
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                toggles.forEach((toggle) => closeNav(toggle, getNavLinks(toggle)));
            }
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
                case 'trip-detail':
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
