/**
 * Konchamar Resort - Main JavaScript
 * Version: 1.0
 */

// ===== Global Variables =====
let currentStep = 1;
let bookingData = {};
let checkInPicker, checkOutPicker;
let currentTestimonial = 0;
let currentEventSlide = 0;
let galleryImages = [];
let currentLightboxIndex = 0;
let accommodations = []; // Store fetched accommodations
let pricing = { // Store pricing configuration
    accommodations: {},
    addons: {},
    rules: {}
};

// ===== Page Load =====
window.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Initialize language first
    if (typeof initializeLanguage === 'function') {
        initializeLanguage();
    }

    // Load pricing and accommodations from API
    await loadPricing();
    await loadAccommodations();

    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
    }, 1000);

    // Initialize components
    initializeNavigation();
    initializeDatePickers();
    initializeGallery();
    initializeTestimonials();
    initializeEventSlider();
    initializeScrollAnimations();
    initializeContactForm();
    initializeBookingForm();
    initializePaymentToggle();

    // AOS (Animate On Scroll) initialization
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            offset: 100
        });
    }
}

// ===== Load Pricing from API =====
async function loadPricing() {
    try {
        const response = await fetch('/api/pricing');
        const data = await response.json();

        if (data.success) {
            pricing = data.data;
            console.log('Loaded pricing:', pricing);
        } else {
            console.error('Failed to load pricing');
        }
    } catch (error) {
        console.error('Error loading pricing:', error);
    }
}

// ===== Load Accommodations from API =====
async function loadAccommodations() {
    try {
        const response = await fetch('/api/accommodations');
        const data = await response.json();

        if (data.success) {
            accommodations = data.data;
            console.log('Loaded accommodations:', accommodations);
        } else {
            console.error('Failed to load accommodations');
        }
    } catch (error) {
        console.error('Error loading accommodations:', error);
    }
}

// ===== Navigation =====
function initializeNavigation() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Sticky navbar on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }

            // Close mobile menu
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');

            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Update active link on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('section[id]');

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ===== Date Pickers =====
function initializeDatePickers() {
    if (typeof flatpickr !== 'undefined') {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        checkInPicker = flatpickr("#checkIn", {
            minDate: "today",
            dateFormat: "Y-m-d",
            onChange: function(selectedDates, dateStr) {
                // Update checkout minimum date
                if (selectedDates.length > 0) {
                    const nextDay = new Date(selectedDates[0]);
                    nextDay.setDate(nextDay.getDate() + 1);
                    checkOutPicker.set('minDate', nextDay);

                    // Fetch and display availability for selected date
                    fetchAvailabilityForDate(dateStr);
                }
                calculateBookingSummary();
            }
        });

        checkOutPicker = flatpickr("#checkOut", {
            minDate: tomorrow,
            dateFormat: "Y-m-d",
            onChange: function() {
                calculateBookingSummary();
            }
        });
    }
}

// ===== Fetch and Display Availability for Date =====
async function fetchAvailabilityForDate(dateStr) {
    try {
        const response = await fetch('/api/booking/availability/date', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: dateStr })
        });

        const data = await response.json();

        if (data.success) {
            displayAvailability(data.availability);
        } else {
            console.error('Failed to fetch availability');
        }
    } catch (error) {
        console.error('Error fetching availability:', error);
    }
}

function displayAvailability(availabilityData) {
    const displayDiv = document.getElementById('availabilityDisplay');
    const listDiv = document.getElementById('availabilityList');

    // Clear previous data
    listDiv.innerHTML = '';

    // Show the display
    displayDiv.style.display = 'block';

    // Create availability items
    availabilityData.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 15px;
            background: ${item.available > 0 ? '#f0f9f4' : '#fff5f5'};
            border-left: 4px solid ${item.available > 0 ? '#2D6A4F' : '#e53e3e'};
            border-radius: 8px;
        `;

        const nameSpan = document.createElement('span');
        nameSpan.style.cssText = 'font-weight: 600; color: var(--primary-blue);';
        nameSpan.textContent = item.name;

        const availSpan = document.createElement('span');
        availSpan.style.cssText = `
            font-weight: 700;
            color: ${item.available > 0 ? '#2D6A4F' : '#e53e3e'};
            display: flex;
            align-items: center;
            gap: 5px;
        `;
        availSpan.innerHTML = `
            <i class="fas fa-${item.available > 0 ? 'check-circle' : 'times-circle'}"></i>
            ${item.available > 0 ? `${item.available} available` : 'Fully booked'}
        `;

        itemDiv.appendChild(nameSpan);
        itemDiv.appendChild(availSpan);
        listDiv.appendChild(itemDiv);
    });
}

// ===== Booking Modal =====
function openBookingModal(accommodationType = '') {
    const modal = document.getElementById('bookingModal');

    if (!modal) {
        console.error('Modal element not found!');
        return;
    }

    // Display modal
    modal.style.display = 'flex';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Populate accommodation options with live data
    populateAccommodationOptions();

    // Always reset to blank option (commented out pre-selection logic)
    // If you want to pre-select based on which button was clicked, uncomment below:
    /*
    if (accommodationType) {
        setTimeout(() => {
            const selectElement = document.getElementById('accommodationType');
            if (selectElement) {
                selectElement.value = accommodationType;
                updateAccommodationInfo(accommodationType);
            }
        }, 100);
    }
    */

    // Ensure blank option is selected
    const selectElement = document.getElementById('accommodationType');
    if (selectElement) {
        selectElement.value = '';
    }

    // Hide availability display when modal opens
    const availabilityDisplay = document.getElementById('availabilityDisplay');
    if (availabilityDisplay) {
        availabilityDisplay.style.display = 'none';
    }

    // Reset to step 1
    currentStep = 1;
    showStep(1);
}

// Populate accommodation dropdown with data from API
function populateAccommodationOptions() {
    const select = document.getElementById('accommodationType');

    // Clear all existing options
    select.innerHTML = '';

    // Add blank placeholder option (disabled and selected by default)
    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = '';
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    placeholderOption.setAttribute('data-no-translate', 'true'); // Prevent translation system from processing
    select.appendChild(placeholderOption);

    // Add options from loaded accommodations
    accommodations.forEach(acc => {
        const option = document.createElement('option');
        option.value = acc.type;
        option.textContent = `${acc.name} - $${acc.basePrice}/${acc.type === 'event_hall' ? 'day' : 'night'}`;
        option.dataset.accId = acc._id;
        option.setAttribute('data-no-translate', 'true'); // Prevent translation system from processing
        select.appendChild(option);
    });
}

// Update accommodation info display
function updateAccommodationInfo(type) {
    const accommodation = accommodations.find(acc => acc.type === type);
    const detailsPanel = document.getElementById('accommodationDetails');

    if (accommodation) {
        // Show and populate the details panel
        detailsPanel.style.display = 'block';

        document.getElementById('accDetailsName').textContent = accommodation.name;
        document.getElementById('accDetailsDesc').textContent = accommodation.description;
        document.getElementById('accDetailsCapacity').textContent = accommodation.capacity;
        document.getElementById('accDetailsPrice').textContent = accommodation.basePrice;
        document.getElementById('accDetailsPeriod').textContent = accommodation.type === 'event_hall' ? 'day' : 'night';

        // Populate amenities
        const amenitiesContainer = document.getElementById('accDetailsAmenities');
        amenitiesContainer.innerHTML = '';

        accommodation.amenities.forEach(amenity => {
            const amenityItem = document.createElement('div');
            amenityItem.style.cssText = 'display: flex; align-items: center; gap: 8px; color: #666; font-size: 0.9rem;';
            amenityItem.innerHTML = `<i class="fas fa-check" style="color: var(--gold);"></i> <span>${amenity}</span>`;
            amenitiesContainer.appendChild(amenityItem);
        });

        // Update max guests based on capacity
        const guestsSelect = document.getElementById('guests');
        // Clear all options and repopulate guests dropdown
        guestsSelect.innerHTML = '';

        // Add blank placeholder option (disabled and selected by default)
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = '';
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        placeholderOption.setAttribute('data-no-translate', 'true'); // Prevent translation system from processing
        guestsSelect.appendChild(placeholderOption);

        for (let i = 1; i <= accommodation.capacity; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i === 1 ? '1 Guest' : `${i} Guests`;
            option.setAttribute('data-no-translate', 'true'); // Prevent translation system from processing
            guestsSelect.appendChild(option);
        }

        console.log('Selected accommodation:', accommodation);
    } else {
        // Hide details panel if no accommodation selected
        detailsPanel.style.display = 'none';
    }
}

function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    modal.classList.remove('active');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';

    // Reset form
    document.getElementById('bookingForm').reset();

    // Hide and clear availability display
    const availabilityDisplay = document.getElementById('availabilityDisplay');
    if (availabilityDisplay) {
        availabilityDisplay.style.display = 'none';
    }
    const availabilityList = document.getElementById('availabilityList');
    if (availabilityList) {
        availabilityList.innerHTML = '';
    }

    currentStep = 1;
    showStep(1);
}

function showStep(step) {
    const steps = document.querySelectorAll('.form-step');
    steps.forEach(s => s.classList.remove('active'));

    const targetStep = document.getElementById(`step${step}`);
    if (targetStep) {
        targetStep.classList.add('active');
    }
    currentStep = step;
}

function nextStep() {
    if (validateCurrentStep()) {
        showStep(currentStep + 1);
    }
}

function prevStep() {
    showStep(currentStep - 1);
}

function validateCurrentStep() {
    const currentStepElement = document.getElementById(`step${currentStep}`);
    const inputs = currentStepElement.querySelectorAll('input[required], select[required], textarea[required]');

    let isValid = true;
    inputs.forEach(input => {
        if (!input.value) {
            isValid = false;
            input.style.borderColor = '#ff0000';
        } else {
            input.style.borderColor = '#e0e0e0';
        }
    });

    if (!isValid) {
        alert('Please fill in all required fields.');
    }

    return isValid;
}

async function checkAvailability() {
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;
    const accommodationType = document.getElementById('accommodationType').value;
    const guests = document.getElementById('guests').value;

    if (!checkIn || !checkOut || !accommodationType || !guests) {
        alert('Please fill in all fields to check availability.');
        return;
    }

    // Validate guest capacity
    const capacity = getAccommodationCapacity(accommodationType);
    if (parseInt(guests) > capacity) {
        alert(`This accommodation can accommodate maximum ${capacity} guests.`);
        return;
    }

    // Calculate nights
    const nights = calculateNights(checkIn, checkOut);
    if (nights < 1) {
        alert('Checkout date must be after check-in date.');
        return;
    }

    if (nights > 30) {
        alert('Maximum stay is 30 nights.');
        return;
    }

    // Store booking data
    bookingData = {
        checkIn,
        checkOut,
        accommodationType,
        guests,
        nights,
        addOns: []
    };

    // Check availability via API
    try {
        const response = await fetch('/api/booking/availability/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                checkIn,
                checkOut,
                accommodationType
            })
        });

        const data = await response.json();

        if (data.success) {
            if (data.available) {
                // Accommodation is available, proceed to next step
                calculateBookingSummary();
                nextStep();
            } else {
                // Not available, show alternatives
                let message = 'Selected dates are not available.';
                if (data.suggestedDates && data.suggestedDates.length > 0) {
                    message += '\n\nAlternative dates available:\n';
                    data.suggestedDates.forEach(date => {
                        message += `- ${new Date(date).toLocaleDateString()}\n`;
                    });
                }
                alert(message);
            }
        } else {
            alert('Error checking availability. Please try again.');
        }
    } catch (error) {
        console.error('Availability check error:', error);
        alert('Error checking availability. Please try again.');
    }
}

// Find and auto-select consecutive available dates
async function findAvailableDates() {
    const lengthOfStay = document.getElementById('lengthOfStay').value;
    const accommodationType = document.getElementById('accommodationType').value;

    if (!lengthOfStay || lengthOfStay < 1) {
        alert('Please enter the number of nights you wish to stay.');
        return;
    }

    if (!accommodationType) {
        alert('Please select an accommodation type first.');
        return;
    }

    const nights = parseInt(lengthOfStay);

    if (nights > 30) {
        alert('Maximum stay is 30 nights.');
        return;
    }

    // Show loading indicator
    const findButton = event.target;
    const originalText = findButton.innerHTML;
    findButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Searching...</span>';
    findButton.disabled = true;

    try {
        const response = await fetch('/api/booking/availability/find-consecutive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nights: nights,
                accommodationType: accommodationType
            })
        });

        const data = await response.json();

        if (data.success && data.found) {
            // Set the dates in the date pickers
            checkInPicker.setDate(data.checkIn);
            checkOutPicker.setDate(data.checkOut);

            // Show success message
            alert(`Great! Found ${nights} consecutive night(s)!\n\nCheck-in: ${new Date(data.checkIn).toLocaleDateString()}\nCheck-out: ${new Date(data.checkOut).toLocaleDateString()}\n\nDates have been automatically filled in for you.`);

            // Fetch availability for the selected check-in date
            fetchAvailabilityForDate(data.checkIn);
        } else {
            alert(data.message || `No consecutive ${nights} night(s) available in the next 90 days. Please try a shorter stay or contact us directly.`);
        }
    } catch (error) {
        console.error('Find consecutive dates error:', error);
        alert('Error finding available dates. Please try again.');
    } finally {
        // Restore button state
        findButton.innerHTML = originalText;
        findButton.disabled = false;
    }
}

function getAccommodationCapacity(type) {
    const accommodation = accommodations.find(acc => acc.type === type);
    if (accommodation) {
        return accommodation.capacity;
    }

    // Fallback to default capacities
    const capacities = {
        'room': 2,
        'suite': 4,
        'villa': 8,
        'event_hall': 50
    };
    return capacities[type] || 2;
}

function calculateNights(checkIn, checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function calculateBookingSummary() {
    const accommodationType = document.getElementById('accommodationType').value;
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;
    const guestsInput = document.getElementById('guests');
    const guests = guestsInput ? parseInt(guestsInput.value) || 1 : 1;

    if (!accommodationType || !checkIn || !checkOut) return;

    const nights = calculateNights(checkIn, checkOut);
    const basePrice = getAccommodationPrice(accommodationType);
    const subtotal = basePrice * nights;

    // Get add-ons
    const selectedAddons = document.querySelectorAll('input[name="addons"]:checked');
    let addonsTotal = 0;
    selectedAddons.forEach(addon => {
        const addonValue = addon.value;
        if (addonValue === 'catering') {
            // Catering is per person per day (night)
            addonsTotal += getAddonPrice(addonValue) * guests * nights;
        } else {
            // Other addons are flat rate
            addonsTotal += getAddonPrice(addonValue);
        }
    });

    const tax = (subtotal + addonsTotal) * 0.13; // 13% VAT
    const resortFee = (subtotal + addonsTotal) * 0.05; // 5% resort fee
    const total = subtotal + addonsTotal + tax + resortFee;

    // Update summary display
    document.getElementById('summaryAccommodation').textContent = getAccommodationName(accommodationType);
    document.getElementById('summaryNights').textContent = `${nights} ${nights === 1 ? 'night' : 'nights'}`;
    document.getElementById('summarySubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('summaryAddons').textContent = `$${addonsTotal.toFixed(2)}`;
    document.getElementById('summaryTax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('summaryFee').textContent = `$${resortFee.toFixed(2)}`;
    document.getElementById('summaryTotal').textContent = `$${total.toFixed(2)}`;

    // Store in booking data
    bookingData.subtotal = subtotal;
    bookingData.addonsTotal = addonsTotal;
    bookingData.tax = tax;
    bookingData.resortFee = resortFee;
    bookingData.total = total;
}

function getAccommodationPrice(type) {
    const accommodation = accommodations.find(acc => acc.type === type);
    if (accommodation) {
        return accommodation.basePrice;
    }

    // Fallback to default prices (from .env)
    const prices = {
        'room': 80,
        'suite': 200,
        'villa': 650,
        'event_hall': 1300
    };
    return prices[type] || 0;
}

function getAccommodationName(type) {
    const accommodation = accommodations.find(acc => acc.type === type);
    if (accommodation) {
        return accommodation.name;
    }

    // Fallback to default names
    const names = {
        'room': 'Garden View Room',
        'suite': 'Oceanfront Suite',
        'villa': 'Private Pool Villa',
        'event_hall': 'Event Hall'
    };
    return names[type] || '';
}

function getAddonPrice(addon) {
    // Use pricing from API if available, otherwise fallback
    if (pricing.addons && pricing.addons[addon]) {
        return pricing.addons[addon];
    }

    // Fallback to default prices (from .env)
    const prices = {
        'spa': 150,
        'surf': 50,
        'transfer': 75,
        'catering': 30
    };
    return prices[addon] || 0;
}

// ===== Booking Form Submission =====
function initializeBookingForm() {
    const form = document.getElementById('bookingForm');
    const addons = document.querySelectorAll('input[name="addons"]');
    const accommodationSelect = document.getElementById('accommodationType');
    const guestsSelect = document.getElementById('guests');

    // Update accommodation info when selection changes
    accommodationSelect.addEventListener('change', (e) => {
        updateAccommodationInfo(e.target.value);
        calculateBookingSummary();
    });

    // Update summary when add-ons change
    addons.forEach(addon => {
        addon.addEventListener('change', calculateBookingSummary);
    });

    // Update summary when number of guests changes (for catering calculation)
    if (guestsSelect) {
        guestsSelect.addEventListener('change', calculateBookingSummary);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateCurrentStep()) return;

        // Gather all form data
        const formData = {
            ...bookingData,
            guestName: document.getElementById('guestName').value,
            guestEmail: document.getElementById('guestEmail').value,
            guestPhone: document.getElementById('guestPhone').value,
            guestAddress: document.getElementById('guestAddress').value,
            specialRequests: document.getElementById('specialRequests').value,
            paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value
        };

        // Add selected add-ons
        const selectedAddons = document.querySelectorAll('input[name="addons"]:checked');
        formData.addOns = Array.from(selectedAddons).map(addon => addon.value);

        // Credit card data (if applicable)
        if (formData.paymentMethod === 'credit_card') {
            formData.cardNumber = document.getElementById('cardNumber').value;
            formData.cardExpiry = document.getElementById('cardExpiry').value;
            formData.cardCVV = document.getElementById('cardCVV').value;

            if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCVV) {
                alert('Please enter your card details.');
                return;
            }
        }

        // Submit booking
        try {
            const response = await submitBooking(formData);

            if (response.success) {
                // Handle Bitcoin payment
                if (formData.paymentMethod === 'bitcoin') {
                    const networkId = document.getElementById('cryptoNetwork').value;

                    if (!networkId) {
                        alert('Please select a crypto network before completing your booking.');
                        return;
                    }

                    // Generate crypto payment details
                    const paymentGenerated = await generateCryptoPayment(response.reservationId, networkId);

                    if (paymentGenerated) {
                        // Payment details are now visible, user can make payment and confirm
                        alert(`Booking created! Your reservation ID is: ${response.reservationId}\n\nPlease send the crypto payment to the address shown below, then click "I Have Made Payment" to complete your reservation.`);
                    }
                } else {
                    // Credit card payment - attempt to process
                    await processCreditCardPayment(response.reservationId, formData);
                }
            } else {
                alert('Booking failed. Please try again or contact support.');
            }
        } catch (error) {
            console.error('Booking error:', error);
            alert('An error occurred. Please try again.');
        }
    });
}

async function submitBooking(data) {
    console.log('Submitting booking:', data);

    // Get the accommodation ID from the selected option
    const accommodationSelect = document.getElementById('accommodationType');
    const selectedOption = accommodationSelect.options[accommodationSelect.selectedIndex];
    const accommodationId = selectedOption.dataset.accId;

    if (!accommodationId) {
        throw new Error('Accommodation ID not found');
    }

    // Prepare booking request data
    const bookingRequest = {
        accommodationId: accommodationId,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        guests: parseInt(data.guests),
        guestDetails: {
            name: data.guestName,
            email: data.guestEmail,
            phone: data.guestPhone,
            address: data.guestAddress
        },
        addOns: data.addOns || [],
        paymentMethod: data.paymentMethod,
        specialRequests: data.specialRequests || ''
    };

    // Create booking via API
    const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingRequest)
    });

    const result = await response.json();

    if (!result.success) {
        throw new Error(result.message || 'Booking failed');
    }

    return result;
}

// ===== Payment Method Toggle =====
function initializePaymentToggle() {
    const creditCardRadio = document.getElementById('creditCard');
    const bitcoinRadio = document.getElementById('bitcoin');
    const creditCardForm = document.getElementById('creditCardForm');
    const bitcoinForm = document.getElementById('bitcoinForm');

    creditCardRadio.addEventListener('change', () => {
        creditCardForm.style.display = 'block';
        bitcoinForm.style.display = 'none';
    });

    bitcoinRadio.addEventListener('change', () => {
        creditCardForm.style.display = 'none';
        bitcoinForm.style.display = 'block';
        // Load crypto networks when Bitcoin is selected
        loadCryptoNetworks();
    });
}

// ===== Credit Card Payment Function =====
async function processCreditCardPayment(reservationId, formData) {
    try {
        const response = await fetch('/api/payment/credit-card', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reservationId: reservationId,
                cardNumber: formData.cardNumber,
                cardExpiry: formData.cardExpiry,
                cardCVV: formData.cardCVV
            })
        });

        const data = await response.json();

        if (data.success) {
            alert(`Payment successful! Your reservation ID is: ${reservationId}\n\nYou will receive a confirmation email shortly.`);
            closeBookingModal();
        } else {
            // Payment failed - check if Bitcoin suggestion was made
            if (data.suggestBitcoin) {
                const switchToBitcoin = confirm(`${data.message}\n\nWould you like to switch to Bitcoin payment now?`);

                if (switchToBitcoin) {
                    // Switch to Bitcoin payment method
                    document.getElementById('bitcoin').checked = true;
                    document.getElementById('creditCardForm').style.display = 'none';
                    document.getElementById('bitcoinForm').style.display = 'block';

                    // Load crypto networks
                    await loadCryptoNetworks();

                    // Show message to user
                    alert(`Please select your preferred cryptocurrency network and complete your booking.\n\nReservation ID: ${reservationId}`);
                } else {
                    alert('Booking cancelled. Please try again or contact support for assistance.');
                    closeBookingModal();
                }
            } else {
                alert(data.message || 'Payment failed. Please try again.');
            }
        }
    } catch (error) {
        console.error('Credit card payment error:', error);
        alert('An error occurred processing your payment. Please try our Bitcoin payment option or contact support.');
    }
}

// ===== Crypto Payment Functions =====
let currentReservationId = null;

// Load available crypto networks
async function loadCryptoNetworks() {
    try {
        const response = await fetch('/api/payment/crypto/networks');
        const data = await response.json();

        if (data.success) {
            const networkSelect = document.getElementById('cryptoNetwork');

            // Clear existing options except the placeholder
            networkSelect.innerHTML = '<option value="">Choose a network...</option>';

            // Add network options
            data.networks.forEach(network => {
                const option = document.createElement('option');
                option.value = network.id;
                option.textContent = `${network.name} (${network.symbol})`;
                networkSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading crypto networks:', error);
    }
}

// Generate crypto payment details after booking is created
async function generateCryptoPayment(reservationId, networkId) {
    try {
        const response = await fetch('/api/payment/crypto/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reservationId: reservationId,
                network: networkId
            })
        });

        const data = await response.json();

        if (data.success) {
            // Show payment details section
            document.getElementById('cryptoPaymentDetails').style.display = 'block';

            // Populate payment details
            document.getElementById('cryptoAddress').textContent = data.address;
            document.getElementById('cryptoAmount').textContent = data.amount;
            document.getElementById('cryptoSymbol').textContent = data.symbol;
            document.getElementById('cryptoAmountUSD').textContent = data.amount_usd.toFixed(2);
            document.getElementById('cryptoInstructions').textContent = data.instructions;

            // Display QR code
            const qrCodeImg = document.getElementById('cryptoQRCode');
            qrCodeImg.src = data.qrCode;
            qrCodeImg.style.display = 'block';

            // Store reservation ID for confirmation
            currentReservationId = reservationId;

            return true;
        } else {
            alert('Error generating payment details: ' + data.message);
            return false;
        }
    } catch (error) {
        console.error('Error generating crypto payment:', error);
        alert('Error generating payment details. Please try again.');
        return false;
    }
}

// Confirm crypto payment (user clicked "I have made payment")
async function confirmCryptoPayment() {
    if (!currentReservationId) {
        alert('No active reservation found.');
        return;
    }

    const transactionId = document.getElementById('transactionId').value;

    try {
        const response = await fetch('/api/payment/crypto/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reservationId: currentReservationId,
                transactionId: transactionId
            })
        });

        const data = await response.json();

        if (data.success) {
            alert(data.message + '\n\nReservation ID: ' + data.reservationId);
            closeBookingModal();
            currentReservationId = null;
        } else {
            alert('Error confirming payment: ' + data.message);
        }
    } catch (error) {
        console.error('Error confirming crypto payment:', error);
        alert('Error confirming payment. Please try again.');
    }
}

// ===== Gallery =====
function initializeGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Store gallery images for lightbox
    galleryImages = Array.from(galleryItems).map(item => {
        return {
            src: item.querySelector('img').src,
            category: item.dataset.category
        };
    });

    // Gallery filter
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;

            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter items
            galleryItems.forEach(item => {
                if (filter === 'all' || item.dataset.category === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Lightbox
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            openLightbox(index);
        });
    });
}

function openLightbox(index) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');

    currentLightboxIndex = index;
    lightboxImage.src = galleryImages[index].src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function changeLightboxImage(direction) {
    currentLightboxIndex += direction;

    if (currentLightboxIndex < 0) {
        currentLightboxIndex = galleryImages.length - 1;
    } else if (currentLightboxIndex >= galleryImages.length) {
        currentLightboxIndex = 0;
    }

    const lightboxImage = document.getElementById('lightboxImage');
    lightboxImage.src = galleryImages[currentLightboxIndex].src;
}

// Keyboard navigation for lightbox
document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (lightbox.classList.contains('active')) {
        if (e.key === 'ArrowLeft') {
            changeLightboxImage(-1);
        } else if (e.key === 'ArrowRight') {
            changeLightboxImage(1);
        } else if (e.key === 'Escape') {
            closeLightbox();
        }
    }
});

// ===== Testimonials Slider =====
function initializeTestimonials() {
    // Auto-rotate testimonials every 5 seconds
    setInterval(() => {
        currentTestimonial = (currentTestimonial + 1) % 3;
        showTestimonial(currentTestimonial);
    }, 5000);
}

function showTestimonial(index) {
    const items = document.querySelectorAll('.testimonial-item');
    const dots = document.querySelectorAll('.testimonial-dots .dot');

    items.forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    dots.forEach((dot, i) => {
        if (i === index) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });

    currentTestimonial = index;
}

// ===== Event Hall Slider =====
function initializeEventSlider() {
    const slides = document.querySelectorAll('.event-slide');

    // Only initialize if slider elements exist
    if (slides.length === 0) {
        console.log('No event slides found, skipping slider initialization');
        return;
    }

    // Auto-rotate event images every 4 seconds
    setInterval(() => {
        changeEventSlide(1);
    }, 4000);
}

function changeEventSlide(direction) {
    const slides = document.querySelectorAll('.event-slide');

    // Check if slides exist
    if (slides.length === 0) {
        return;
    }

    slides[currentEventSlide].classList.remove('active');

    currentEventSlide += direction;

    if (currentEventSlide < 0) {
        currentEventSlide = slides.length - 1;
    } else if (currentEventSlide >= slides.length) {
        currentEventSlide = 0;
    }

    slides[currentEventSlide].classList.add('active');
}

// ===== Contact Form =====
function initializeContactForm() {
    const form = document.getElementById('contactForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            message: document.getElementById('message').value
        };

        try {
            // In production, this would call the API
            // const response = await fetch('/api/contact', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(formData)
            // });

            // Simulate success
            alert('Thank you for your message! We will get back to you shortly.');
            form.reset();
        } catch (error) {
            console.error('Contact form error:', error);
            alert('An error occurred. Please try again or contact us directly.');
        }
    });
}

// ===== Scroll Animations =====
function initializeScrollAnimations() {
    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero-video');

        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
}

// ===== Credit Card Formatting =====
const cardNumberInput = document.getElementById('cardNumber');
const cardExpiryInput = document.getElementById('cardExpiry');
const cardCVVInput = document.getElementById('cardCVV');

if (cardNumberInput) {
    cardNumberInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s/g, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formattedValue;
    });
}

if (cardExpiryInput) {
    cardExpiryInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        e.target.value = value;
    });
}

if (cardCVVInput) {
    cardCVVInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
}

// ===== Close modal on outside click =====
document.getElementById('bookingModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'bookingModal') {
        closeBookingModal();
    }
});

document.getElementById('lightbox')?.addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') {
        closeLightbox();
    }
});

// ===== Newsletter Form =====
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;

        // In production, this would call the API
        alert(`Thank you for subscribing! We'll send updates to ${email}`);
        newsletterForm.reset();
    });
}

// ===== Utility Functions =====
function formatCurrency(amount) {
    return `$${amount.toFixed(2)}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// ===== Export functions for HTML onclick handlers =====
window.openBookingModal = openBookingModal;
window.closeBookingModal = closeBookingModal;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.checkAvailability = checkAvailability;
window.findAvailableDates = findAvailableDates;
window.showTestimonial = showTestimonial;
window.changeEventSlide = changeEventSlide;
window.closeLightbox = closeLightbox;
window.changeLightboxImage = changeLightboxImage;
window.confirmCryptoPayment = confirmCryptoPayment;

console.log('Konchamar Resort initialized successfully');
