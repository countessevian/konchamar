/**
 * Konchamar Resort - Multilingual Translation System
 * Supported Languages: Spanish (es), English (en)
 */

const translations = {
    es: {
        // Navigation
        'nav.home': 'Inicio',
        'nav.rooms': 'Habitaciones y Suites',
        'nav.event': 'Salón de Eventos',
        'nav.gallery': 'Galería',
        'nav.contact': 'Contacto',
        'nav.book': 'Reservar Ahora',

        // Hero
        'hero.title': 'Escape a la Serenidad Exclusiva',
        'hero.subtitle': 'Experimente el lujo en el principal resort frente al mar de El Salvador',
        'hero.cta': 'Reserva Tu Estancia',

        // About
        'about.label': 'Bienvenido a Konchamar',
        'about.title': 'Donde el Lujo se Encuentra con el Pacífico',
        'about.desc1': 'Ubicado en las costas prístinas de La Libertad, Konchamar ofrece un escape incomparable de lo ordinario. Nuestro resort boutique combina amenidades de clase mundial con la belleza natural de Playa El Majahual, creando un santuario exclusivo para viajeros exigentes.',
        'about.desc2': 'Con alojamientos limitados que garantizan privacidad y servicio personalizado, cada estadía en Konchamar se elabora a la perfección. Desde sesiones de surf al amanecer hasta cócteles al atardecer, descubre el arte de la vida costera.',
        'about.feature1': 'Vistas al Océano',
        'about.feature2': 'Piscina Infinita',
        'about.feature3': 'Servicios de Spa',
        'about.feature4': 'Playa Privada',

        // Accommodations
        'acc.label': 'Nuestros Alojamientos',
        'acc.title': 'Espacios Curados para Estancias Inolvidables',
        'acc.subtitle': 'Disponibilidad limitada garantiza exclusividad y servicio excepcional',
        'acc.room.title': 'Habitación Vista al Jardín',
        'acc.room.desc': 'Refugio sereno con vistas al jardín exuberante, ropa de cama premium y comodidades modernas. Perfecto para parejas que buscan tranquilidad.',
        'acc.room.feat1': 'Cama king-size',
        'acc.room.feat2': 'Balcón privado',
        'acc.room.feat3': 'Aire acondicionado',
        'acc.room.feat4': 'Máx. 2 huéspedes',
        'acc.suite.badge': 'Más Popular',
        'acc.suite.title': 'Suite Frente al Océano',
        'acc.suite.desc': 'Despierta con vistas panorámicas al océano. Suite espaciosa con sala de estar separada, baño de lujo y acceso directo a la playa.',
        'acc.suite.feat1': 'Balcón con vista al mar',
        'acc.suite.feat2': 'Baño de mármol',
        'acc.suite.feat3': 'Sala de estar',
        'acc.suite.feat4': 'Máx. 4 huéspedes',
        'acc.villa.title': 'Villa con Piscina Privada',
        'acc.villa.desc': 'Lujo supremo con tu propia piscina infinita, ducha al aire libre y amplia terraza. El pináculo de la vida exclusiva.',
        'acc.villa.feat1': 'Piscina infinita privada',
        'acc.villa.feat2': 'Habitación principal + habitación de huéspedes',
        'acc.villa.feat3': 'Cocina completa',
        'acc.villa.feat4': 'Máx. 8 huéspedes',
        'acc.price.from': 'Desde',
        'acc.price.night': '/noche',
        'acc.btn.room': 'Reservar Habitación',
        'acc.btn.suite': 'Reservar Suite',
        'acc.btn.villa': 'Reservar Villa',

        // Event Hall
        'event.label': 'Lugar Exclusivo',
        'event.title': 'Salón de Eventos Frente al Mar',
        'event.desc': 'Organice celebraciones inolvidables en nuestro sofisticado espacio para eventos. Desde bodas íntimas hasta retiros corporativos, nuestro versátil lugar acomoda hasta 50 huéspedes con impresionantes vistas al océano como telón de fondo.',
        'event.capacity': 'Capacidad',
        'event.capacity.value': 'Hasta 50 huéspedes',
        'event.catering': 'Catering',
        'event.catering.value': 'Opciones gourmet disponibles',
        'event.av': 'Audio/Visual',
        'event.av.value': 'Equipo profesional',
        'event.duration': 'Duración',
        'event.duration.value': 'Renta de día completo disponible',
        'event.price.label': 'Desde',
        'event.price.period': '/día',
        'event.cta': 'Consultar sobre Eventos',

        // Rooms Section
        'rooms.label': 'Comodidad y Elegancia',
        'rooms.title': 'Habitaciones Vista al Jardín',
        'rooms.subtitle': 'Refugios serenos con comodidades modernas y vistas exuberantes al jardín',

        // Suites Section
        'suites.label': 'Experiencia Premium',
        'suites.title': 'Suites Frente al Océano',
        'suites.subtitle': 'Lujo espacioso con vistas panorámicas al océano y acceso directo a la playa',
        'suites.coming': 'Fotos próximamente - Contáctenos para disponibilidad',

        // Villas Section
        'villas.label': 'Lujo Supremo',
        'villas.title': 'Villas con Piscina Privada',
        'villas.subtitle': 'El pináculo de la vida exclusiva con piscinas infinitas privadas y amplias terrazas',

        // Beach Views Section
        'beach.label': 'Paisajes Impresionantes',
        'beach.title': 'Vistas Espectaculares de la Playa',
        'beach.subtitle': 'Descubre la belleza natural de Playa El Majahual, donde las costas prístinas se encuentran con el Pacífico',
        'beach.description': 'Experimenta acceso directo a una de las playas más hermosas de El Salvador. Perfecto para surfear, nadar o simplemente relajarse bajo el sol tropical.',
        'beach.cta': 'Reserva Tu Escape a la Playa',

        // Gallery
        'gallery.label': 'Viaje Visual',
        'gallery.title': 'Experimenta Konchamar',
        'gallery.filter.all': 'Todo',
        'gallery.filter.rooms': 'Habitaciones',
        'gallery.filter.villas': 'Villas',
        'gallery.filter.events': 'Eventos',
        'gallery.filter.beach': 'Playa',
        'gallery.filter.dining': 'Comedor',
        'gallery.filter.activities': 'Actividades',

        // Testimonials
        'test.label': 'Experiencias de Huéspedes',
        'test.title': 'Lo Que Dicen Nuestros Huéspedes',
        'test.1.text': '"¡Resort absolutamente impresionante! La suite frente al mar superó todas las expectativas. La atención al detalle del personal y la playa prístina hicieron que nuestro aniversario fuera inolvidable."',
        'test.1.author': 'Maria & Carlos Rodriguez',
        'test.1.location': 'California, EE.UU.',
        'test.2.text': '"Organizamos nuestra boda destino en el salón de eventos de Konchamar. El lugar fue perfecto, el telón de fondo del atardecer fue mágico y cada detalle se manejó con profesionalismo."',
        'test.2.author': 'Sophie & James Chen',
        'test.2.location': 'Vancouver, Canadá',
        'test.3.text': '"La villa con piscina privada es puro lujo. Despertar con los sonidos del océano, surfear olas de clase mundial y disfrutar de tratamientos de spa - ¡así se siente el paraíso!"',
        'test.3.author': 'Lucas Fernández',
        'test.3.location': 'Madrid, España',

        // Contact
        'contact.label': 'Contáctanos',
        'contact.title': 'Contáctanos',
        'contact.desc': '¿Tienes preguntas sobre tu estadía o estás planificando un evento especial? Nuestro equipo de conserjes está aquí para ayudarte.',
        'contact.notice': '<strong>Aviso Importante:</strong> Nuestra línea de El Salvador está temporalmente fuera de servicio. Por favor use nuestro número de Estados Unidos <strong>+1 314-2023148</strong> o WhatsApp para asistencia inmediata.',
        'contact.location': 'Ubicación',
        'contact.phone': 'Teléfono',
        'contact.email': 'Correo Electrónico',
        'contact.whatsapp': 'WhatsApp',
        'contact.social': 'Síguenos en Redes Sociales',
        'contact.form.name': 'Nombre Completo',
        'contact.form.email': 'Correo Electrónico',
        'contact.form.phone': 'Número de Teléfono (Opcional)',
        'contact.form.message': 'Tu Mensaje',
        'contact.form.submit': 'Enviar Mensaje',

        // Footer
        'footer.tagline': 'Experimente serenidad exclusiva en el principal resort frente al mar de El Salvador',
        'footer.quicklinks': 'Enlaces Rápidos',
        'footer.info': 'Información',
        'footer.policy': 'Política de Privacidad',
        'footer.terms': 'Términos de Servicio',
        'footer.faq': 'Preguntas Frecuentes',
        'footer.cancel': 'Política de Cancelación',
        'footer.newsletter': 'Mantente Actualizado',
        'footer.newsletter.desc': 'Suscríbete para ofertas exclusivas',
        'footer.newsletter.placeholder': 'Tu correo electrónico',
        'footer.copyright': '© 2025 Konchamar Resort. Todos los derechos reservados. | Diseñado con excelencia',

        // Booking Modal
        'booking.title': 'Reserva Tu Estadía Exclusiva',
        'booking.subtitle': 'Disponibilidad limitada - Reserva ahora para asegurar tus fechas',
        'booking.step1.title': 'Selecciona Tus Fechas y Alojamiento',
        'booking.checkin': 'Fecha de Entrada',
        'booking.checkout': 'Fecha de Salida',
        'booking.length.title': 'Selección Rápida de Fechas',
        'booking.length.label': 'Duración de la Estadía (noches)',
        'booking.length.button': 'Buscar Fechas Disponibles',
        'booking.availability.title': 'Unidades Disponibles para la Fecha Seleccionada',
        'booking.type': 'Tipo de Alojamiento',
        'booking.type.select': 'Selecciona alojamiento...',
        'booking.type.room': 'Habitación Vista al Jardín - $100/noche',
        'booking.type.suite': 'Suite Frente al Océano - $200/noche',
        'booking.type.villa': 'Villa con Piscina Privada - $500/noche',
        'booking.type.event': 'Salón de Eventos - $1,000/día',
        'booking.guests': 'Número de Huéspedes',
        'booking.guests.select': 'Selecciona huéspedes...',
        'booking.guests.1': '1 Huésped',
        'booking.guests.2': '2 Huéspedes',
        'booking.guests.3': '3 Huéspedes',
        'booking.guests.4': '4 Huéspedes',
        'booking.guests.5': '5 Huéspedes',
        'booking.guests.6': '6 Huéspedes',
        'booking.guests.7': '7 Huéspedes',
        'booking.guests.8': '8 Huéspedes',
        'booking.guests.50': 'Hasta 50 (Salón de Eventos)',
        'booking.check': 'Verificar Disponibilidad',
        'booking.step2.title': 'Mejora Tu Experiencia',
        'booking.addon.spa': 'Paquete de Spa',
        'booking.addon.spa.desc': 'Disfruta de la relajación',
        'booking.addon.surf': 'Lección de Surf',
        'booking.addon.surf.desc': 'Instrucción profesional',
        'booking.addon.transfer': 'Traslado al Aeropuerto',
        'booking.addon.transfer.desc': 'Transporte de lujo',
        'booking.addon.catering': 'Catering Gourmet',
        'booking.addon.catering.desc': 'Por persona',
        'booking.summary': 'Resumen de Reserva',
        'booking.summary.acc': 'Alojamiento',
        'booking.summary.nights': 'noches',
        'booking.summary.addons': 'Extras',
        'booking.summary.tax': 'Impuesto (13%)',
        'booking.summary.fee': 'Tarifa del Resort (5%)',
        'booking.summary.total': 'Total',
        'booking.btn.back': 'Atrás',
        'booking.btn.continue': 'Continuar',
        'booking.step3.title': 'Detalles del Huésped',
        'booking.guest.name': 'Nombre Completo',
        'booking.guest.email': 'Correo Electrónico',
        'booking.guest.phone': 'Número de Teléfono',
        'booking.guest.address': 'Dirección',
        'booking.guest.requests': 'Solicitudes Especiales (Opcional)',
        'booking.btn.payment': 'Continuar al Pago',
        'booking.step4.title': 'Método de Pago',
        'booking.payment.card': 'Tarjeta de Crédito',
        'booking.payment.bitcoin': 'Bitcoin',
        'booking.card.number': 'Número de Tarjeta',
        'booking.card.expiry': 'Fecha de Vencimiento',
        'booking.card.cvv': 'CVV',
        'booking.bitcoin.info': 'Recibirás instrucciones de pago en Bitcoin después de hacer clic en "Completar Reserva"',
        'booking.btn.complete': 'Completar Reserva',
    },
    en: {
        // Navigation
        'nav.home': 'Home',
        'nav.rooms': 'Rooms & Suites',
        'nav.event': 'Event Hall',
        'nav.gallery': 'Gallery',
        'nav.contact': 'Contact',
        'nav.book': 'Book Now',

        // Hero
        'hero.title': 'Escape to Exclusive Serenity',
        'hero.subtitle': 'Experience luxury at El Salvador\'s premier beachfront resort',
        'hero.cta': 'Book Your Stay',

        // About
        'about.label': 'Welcome to Konchamar',
        'about.title': 'Where Luxury Meets the Pacific',
        'about.desc1': 'Nestled along the pristine shores of La Libertad, Konchamar offers an unparalleled escape from the ordinary. Our boutique resort combines world-class amenities with the natural beauty of Playa El Majahual, creating an exclusive sanctuary for discerning travelers.',
        'about.desc2': 'With limited accommodations ensuring privacy and personalized service, every stay at Konchamar is crafted to perfection. From sunrise surf sessions to sunset cocktails, discover the art of coastal living.',
        'about.feature1': 'Oceanfront Views',
        'about.feature2': 'Infinity Pool',
        'about.feature3': 'Spa Services',
        'about.feature4': 'Private Beach',

        // Accommodations
        'acc.label': 'Our Accommodations',
        'acc.title': 'Curated Spaces for Unforgettable Stays',
        'acc.subtitle': 'Limited availability ensures exclusivity and exceptional service',
        'acc.room.title': 'Garden View Room',
        'acc.room.desc': 'Serene retreat with lush garden views, premium linens, and modern amenities. Perfect for couples seeking tranquility.',
        'acc.room.feat1': 'King-size bed',
        'acc.room.feat2': 'Private balcony',
        'acc.room.feat3': 'Air conditioning',
        'acc.room.feat4': 'Max 2 guests',
        'acc.suite.badge': 'Most Popular',
        'acc.suite.title': 'Oceanfront Suite',
        'acc.suite.desc': 'Wake up to panoramic ocean views. Spacious suite with separate living area, luxury bathroom, and direct beach access.',
        'acc.suite.feat1': 'Ocean view balcony',
        'acc.suite.feat2': 'Marble bathroom',
        'acc.suite.feat3': 'Living area',
        'acc.suite.feat4': 'Max 4 guests',
        'acc.villa.title': 'Private Pool Villa',
        'acc.villa.desc': 'Ultimate luxury with your own infinity pool, outdoor shower, and expansive terrace. The pinnacle of exclusive living.',
        'acc.villa.feat1': 'Private infinity pool',
        'acc.villa.feat2': 'Master bedroom + guest room',
        'acc.villa.feat3': 'Full kitchen',
        'acc.villa.feat4': 'Max 8 guests',
        'acc.price.from': 'From',
        'acc.price.night': '/night',
        'acc.btn.room': 'Book Room',
        'acc.btn.suite': 'Book Suite',
        'acc.btn.villa': 'Book Villa',

        // Event Hall
        'event.label': 'Exclusive Venue',
        'event.title': 'Beachfront Event Hall',
        'event.desc': 'Host unforgettable celebrations in our sophisticated event space. From intimate weddings to corporate retreats, our versatile venue accommodates up to 50 guests with stunning ocean views as your backdrop.',
        'event.capacity': 'Capacity',
        'event.capacity.value': 'Up to 50 guests',
        'event.catering': 'Catering',
        'event.catering.value': 'Gourmet options available',
        'event.av': 'Audio/Visual',
        'event.av.value': 'Professional equipment',
        'event.duration': 'Duration',
        'event.duration.value': 'Full-day rental available',
        'event.price.label': 'Starting at',
        'event.price.period': '/day',
        'event.cta': 'Inquire About Events',

        // Rooms Section
        'rooms.label': 'Comfort & Elegance',
        'rooms.title': 'Garden View Rooms',
        'rooms.subtitle': 'Serene retreats with modern amenities and lush garden views',

        // Suites Section
        'suites.label': 'Premium Experience',
        'suites.title': 'Oceanfront Suites',
        'suites.subtitle': 'Spacious luxury with panoramic ocean views and direct beach access',
        'suites.coming': 'Photos coming soon - Contact us for availability',

        // Villas Section
        'villas.label': 'Ultimate Luxury',
        'villas.title': 'Private Pool Villas',
        'villas.subtitle': 'The pinnacle of exclusive living with private infinity pools and expansive terraces',

        // Beach Views Section
        'beach.label': 'Breathtaking Scenery',
        'beach.title': 'Stunning Beach Views',
        'beach.subtitle': 'Discover the natural beauty of Playa El Majahual, where pristine shores meet the Pacific',
        'beach.description': 'Experience direct access to one of El Salvador\'s most beautiful beaches. Perfect for surfing, swimming, or simply relaxing under the tropical sun.',
        'beach.cta': 'Book Your Beach Escape',

        // Gallery
        'gallery.label': 'Visual Journey',
        'gallery.title': 'Experience Konchamar',
        'gallery.filter.all': 'All',
        'gallery.filter.rooms': 'Rooms',
        'gallery.filter.villas': 'Villas',
        'gallery.filter.events': 'Events',
        'gallery.filter.beach': 'Beach',
        'gallery.filter.dining': 'Dining',
        'gallery.filter.activities': 'Activities',

        // Testimonials
        'test.label': 'Guest Experiences',
        'test.title': 'What Our Guests Say',
        'test.1.text': '"Absolutely stunning resort! The oceanfront suite exceeded all expectations. The staff\'s attention to detail and the pristine beach made our anniversary unforgettable."',
        'test.1.author': 'Maria & Carlos Rodriguez',
        'test.1.location': 'California, USA',
        'test.2.text': '"We hosted our destination wedding at Konchamar\'s event hall. The venue was perfect, the sunset backdrop was magical, and every detail was handled with professionalism."',
        'test.2.author': 'Sophie & James Chen',
        'test.2.location': 'Vancouver, Canada',
        'test.3.text': '"The private pool villa is pure luxury. Waking up to ocean sounds, surfing world-class waves, and enjoying spa treatments - this is what paradise feels like!"',
        'test.3.author': 'Lucas Fernández',
        'test.3.location': 'Madrid, Spain',

        // Contact
        'contact.label': 'Get in Touch',
        'contact.title': 'Contact Us',
        'contact.desc': 'Have questions about your stay or planning a special event? Our concierge team is here to assist you.',
        'contact.notice': '<strong>Important Notice:</strong> Our El Salvador line is temporarily down. Please use our United States number <strong>+1 314-2023148</strong> or WhatsApp for immediate assistance.',
        'contact.location': 'Location',
        'contact.phone': 'Phone',
        'contact.email': 'Email',
        'contact.whatsapp': 'WhatsApp',
        'contact.social': 'Follow Us on Social Media',
        'contact.form.name': 'Full Name',
        'contact.form.email': 'Email Address',
        'contact.form.phone': 'Phone Number (Optional)',
        'contact.form.message': 'Your Message',
        'contact.form.submit': 'Send Message',

        // Footer
        'footer.tagline': 'Experience exclusive serenity at El Salvador\'s premier beachfront resort',
        'footer.quicklinks': 'Quick Links',
        'footer.info': 'Information',
        'footer.policy': 'Privacy Policy',
        'footer.terms': 'Terms of Service',
        'footer.faq': 'FAQ',
        'footer.cancel': 'Cancellation Policy',
        'footer.newsletter': 'Stay Updated',
        'footer.newsletter.desc': 'Subscribe for exclusive offers',
        'footer.newsletter.placeholder': 'Your email',
        'footer.copyright': '© 2025 Konchamar Resort. All rights reserved. | Designed with excellence',

        // Booking Modal
        'booking.title': 'Reserve Your Exclusive Stay',
        'booking.subtitle': 'Limited availability - Book now to secure your dates',
        'booking.step1.title': 'Select Your Dates & Accommodation',
        'booking.checkin': 'Check-in Date',
        'booking.checkout': 'Check-out Date',
        'booking.length.title': 'Quick Date Selection',
        'booking.length.label': 'Length of Stay (nights)',
        'booking.length.button': 'Find Available Dates',
        'booking.availability.title': 'Available Units for Selected Date',
        'booking.type': 'Accommodation Type',
        'booking.type.select': 'Select accommodation...',
        'booking.type.room': 'Garden View Room - $100/night',
        'booking.type.suite': 'Oceanfront Suite - $200/night',
        'booking.type.villa': 'Private Pool Villa - $500/night',
        'booking.type.event': 'Event Hall - $1,000/day',
        'booking.guests': 'Number of Guests',
        'booking.guests.select': 'Select guests...',
        'booking.guests.1': '1 Guest',
        'booking.guests.2': '2 Guests',
        'booking.guests.3': '3 Guests',
        'booking.guests.4': '4 Guests',
        'booking.guests.5': '5 Guests',
        'booking.guests.6': '6 Guests',
        'booking.guests.7': '7 Guests',
        'booking.guests.8': '8 Guests',
        'booking.guests.50': 'Up to 50 (Event Hall)',
        'booking.check': 'Check Availability',
        'booking.step2.title': 'Enhance Your Experience',
        'booking.addon.spa': 'Spa Package',
        'booking.addon.spa.desc': 'Indulge in relaxation',
        'booking.addon.surf': 'Surf Lesson',
        'booking.addon.surf.desc': 'Professional instruction',
        'booking.addon.transfer': 'Airport Transfer',
        'booking.addon.transfer.desc': 'Luxury transportation',
        'booking.addon.catering': 'Gourmet Catering',
        'booking.addon.catering.desc': 'Per person',
        'booking.summary': 'Booking Summary',
        'booking.summary.acc': 'Accommodation',
        'booking.summary.nights': 'nights',
        'booking.summary.addons': 'Add-ons',
        'booking.summary.tax': 'Tax (13%)',
        'booking.summary.fee': 'Resort Fee (5%)',
        'booking.summary.total': 'Total',
        'booking.btn.back': 'Back',
        'booking.btn.continue': 'Continue',
        'booking.step3.title': 'Guest Details',
        'booking.guest.name': 'Full Name',
        'booking.guest.email': 'Email Address',
        'booking.guest.phone': 'Phone Number',
        'booking.guest.address': 'Address',
        'booking.guest.requests': 'Special Requests (Optional)',
        'booking.btn.payment': 'Continue to Payment',
        'booking.step4.title': 'Payment Method',
        'booking.payment.card': 'Credit Card',
        'booking.payment.bitcoin': 'Bitcoin',
        'booking.card.number': 'Card Number',
        'booking.card.expiry': 'Expiry Date',
        'booking.card.cvv': 'CVV',
        'booking.bitcoin.info': 'You will receive Bitcoin payment instructions after clicking "Complete Booking"',
        'booking.btn.complete': 'Complete Booking',
    }
};

// Current language (default: English)
let currentLang = 'en';

// Update language toggle active state
function updateLanguageToggle() {
    document.querySelectorAll('.lang-option').forEach(option => {
        if (option.dataset.lang === currentLang) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

// Update placeholders for inputs/textareas based on language
function updatePlaceholders() {
    document.querySelectorAll('[data-update-placeholder="true"]').forEach(element => {
        if (element.esPlaceholder && element.enPlaceholder) {
            element.placeholder = currentLang === 'es' ? element.esPlaceholder : element.enPlaceholder;
        }
    });
}

// Update option elements based on language
function updateOptionElements() {
    document.querySelectorAll('option[data-es-text][data-en-text]').forEach(option => {
        option.textContent = currentLang === 'es' ? option.dataset.esText : option.dataset.enText;
    });
}

// Change language function - simplified for conditional rendering
function changeLanguage(lang) {
    console.log('changeLanguage called with:', lang);
    currentLang = lang;
    localStorage.setItem('konchamar_lang', lang);
    document.documentElement.lang = lang;
    updateLanguageToggle();
    updatePlaceholders();
    updateOptionElements();
    console.log('Language changed to:', lang, 'HTML lang attribute:', document.documentElement.lang);
}

// Convert data-i18n elements to bilingual spans
function convertToBilingualContent() {
    console.log('Converting content to bilingual...');
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const esText = translations.es[key];
        const enText = translations.en[key];

        if (!esText || !enText) {
            console.warn('Missing translation for key:', key);
            return;
        }

        // Skip if already converted
        if (element.querySelector('.lang-es, .lang-en')) return;

        // Skip if marked as no-translate
        if (element.getAttribute('data-no-translate') === 'true') return;

        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            // For inputs, handle placeholders differently
            // Store placeholders on element
            element.dataset.updatePlaceholder = 'true';
            element.esPlaceholder = esText;
            element.enPlaceholder = enText;

            // Set initial placeholder
            element.placeholder = currentLang === 'es' ? esText : enText;
        } else if (element.tagName === 'OPTION') {
            // For option elements, store both translations as data attributes
            // Options cannot contain HTML, so we store translations and update on language change
            element.dataset.esText = esText;
            element.dataset.enText = enText;
            element.textContent = currentLang === 'es' ? esText : enText;
        } else {
            // Check if element has child elements (like icons)
            const hasChildElements = Array.from(element.children).some(child =>
                !child.classList.contains('lang-es') && !child.classList.contains('lang-en')
            );

            if (hasChildElements) {
                // Find text nodes and replace them
                const walker = document.createTreeWalker(
                    element,
                    NodeFilter.SHOW_TEXT,
                    {
                        acceptNode: function(node) {
                            // Skip empty text nodes and those already inside lang spans
                            if (node.textContent.trim() === '') return NodeFilter.FILTER_REJECT;
                            if (node.parentElement.classList.contains('lang-es') ||
                                node.parentElement.classList.contains('lang-en')) {
                                return NodeFilter.FILTER_REJECT;
                            }
                            return NodeFilter.FILTER_ACCEPT;
                        }
                    }
                );

                const textNodes = [];
                let node;
                while (node = walker.nextNode()) {
                    textNodes.push(node);
                }

                if (textNodes.length > 0) {
                    const textNode = textNodes[0];
                    const span = document.createElement('span');
                    span.innerHTML = `<span class="lang-es">${esText}</span><span class="lang-en">${enText}</span>`;
                    textNode.parentNode.replaceChild(span, textNode);
                }
            } else {
                // No child elements, replace entire content
                const hasHTML = /<[^>]+>/.test(esText) || /<[^>]+>/.test(enText);

                if (hasHTML) {
                    element.innerHTML = `<span class="lang-es">${esText}</span><span class="lang-en">${enText}</span>`;
                } else {
                    element.textContent = '';
                    const esSpan = document.createElement('span');
                    esSpan.className = 'lang-es';
                    esSpan.textContent = esText;
                    const enSpan = document.createElement('span');
                    enSpan.className = 'lang-en';
                    enSpan.textContent = enText;
                    element.appendChild(esSpan);
                    element.appendChild(enSpan);
                }
            }
        }
    });
    console.log('Bilingual content conversion complete');
}

// Attach event listeners to language toggle buttons
function attachLanguageToggleListeners() {
    const langButtons = document.querySelectorAll('.lang-option');
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            changeLanguage(lang);
        });
    });
    console.log('Language toggle listeners attached');
}

// Initialize language on page load
function initializeLanguage() {
    console.log('Initializing language system...');
    // Check for saved language preference
    const savedLang = localStorage.getItem('konchamar_lang');
    if (savedLang && (savedLang === 'es' || savedLang === 'en')) {
        currentLang = savedLang;
    }

    document.documentElement.lang = currentLang;
    console.log('Initial language set to:', currentLang);

    convertToBilingualContent();
    updateLanguageToggle();
    updatePlaceholders();
    attachLanguageToggleListeners();
}

// Export functions for global use
window.changeLanguage = changeLanguage;
window.initializeLanguage = initializeLanguage;

// Auto-initialize on script load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLanguage);
} else {
    // DOM already loaded, initialize immediately
    initializeLanguage();
}
