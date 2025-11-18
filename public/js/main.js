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

// ===== Page Load =====
window.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Initialize language first
    if (typeof initializeLanguage === 'function') {
        initializeLanguage();
    }

    // Load accommodations from API
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

// ===== Booking Modal =====
function openBookingModal(accommodationType = '') {
    const modal = document.getElementById('bookingModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Populate accommodation options with live data
    populateAccommodationOptions();

    // Set accommodation type if provided
    if (accommodationType) {
        document.getElementById('accommodationType').value = accommodationType;
        updateAccommodationInfo(accommodationType);
    }

    // Reset to step 1
    currentStep = 1;
    showStep(1);
}

// Populate accommodation dropdown with data from API
function populateAccommodationOptions() {
    const select = document.getElementById('accommodationType');

    // Clear existing options except the first one
    while (select.options.length > 1) {
        select.remove(1);
    }

    // Add options from loaded accommodations
    accommodations.forEach(acc => {
        const option = document.createElement('option');
        option.value = acc.type;
        option.textContent = `${acc.name} - $${acc.basePrice}/${acc.type === 'event_hall' ? 'day' : 'night'}`;
        option.dataset.accId = acc._id;
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
        // Clear and repopulate guests dropdown
        while (guestsSelect.options.length > 1) {
            guestsSelect.remove(1);
        }

        for (let i = 1; i <= accommodation.capacity; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i === 1 ? '1 Guest' : `${i} Guests`;
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
    document.body.style.overflow = 'auto';

    // Reset form
    document.getElementById('bookingForm').reset();
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

function checkAvailability() {
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

    // In production, this would make an API call to check availability
    // For now, we'll simulate availability check
    setTimeout(() => {
        calculateBookingSummary();
        nextStep();
    }, 500);
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

    if (!accommodationType || !checkIn || !checkOut) return;

    const nights = calculateNights(checkIn, checkOut);
    const basePrice = getAccommodationPrice(accommodationType);
    const subtotal = basePrice * nights;

    // Get add-ons
    const selectedAddons = document.querySelectorAll('input[name="addons"]:checked');
    let addonsTotal = 0;
    selectedAddons.forEach(addon => {
        addonsTotal += getAddonPrice(addon.value);
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

    // Fallback to default prices
    const prices = {
        'room': 100,
        'suite': 200,
        'villa': 500,
        'event_hall': 1000
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

    // Update accommodation info when selection changes
    accommodationSelect.addEventListener('change', (e) => {
        updateAccommodationInfo(e.target.value);
        calculateBookingSummary();
    });

    // Update summary when add-ons change
    addons.forEach(addon => {
        addon.addEventListener('change', calculateBookingSummary);
    });

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

        // Submit booking (in production, this would call the API)
        try {
            const response = await submitBooking(formData);

            if (response.success) {
                // Show success message
                alert(`Booking confirmed! Your reservation ID is: ${response.reservationId}\n\nYou will receive a confirmation email shortly.`);
                closeBookingModal();
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
    // Simulate API call
    console.log('Submitting booking:', data);

    // In production, this would be:
    // const response = await fetch('/api/booking/create', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(data)
    // });
    // return await response.json();

    // Simulate success
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                reservationId: 'KONCH-' + Date.now().toString().slice(-8)
            });
        }, 1000);
    });
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
    });
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
    // Auto-rotate event images every 4 seconds
    setInterval(() => {
        changeEventSlide(1);
    }, 4000);
}

function changeEventSlide(direction) {
    const slides = document.querySelectorAll('.event-slide');

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
window.showTestimonial = showTestimonial;
window.changeEventSlide = changeEventSlide;
window.closeLightbox = closeLightbox;
window.changeLightboxImage = changeLightboxImage;

console.log('Konchamar Resort initialized successfully');
