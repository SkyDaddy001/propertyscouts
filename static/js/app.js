/**
 * Home Realtors App - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
  initFormHandling();
  initChatTriggers();
  initScrollBehaviors();
});

/**
 * Form Handling
 */
function initFormHandling() {
  const forms = document.querySelectorAll('.nurture-form');

  forms.forEach(form => {
    form.addEventListener('submit', handleFormSubmit);
  });
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  // Add metadata
  data.timestamp = new Date().toISOString();
  data.userAgent = navigator.userAgent;
  data.source = window.location.href;

  try {
    // Send to backend (replace with your API endpoint)
    console.log('Lead captured:', data);

    // Show success message
    showSuccessMessage(form, data);

    // Send WhatsApp message if enabled
    if (data.whatsapp) {
      sendWhatsAppMessage(data);
    }
  } catch (error) {
    console.error('Form submission error:', error);
    showErrorMessage(form, 'Error submitting form. Please try again.');
  }
}

function showSuccessMessage(form, data) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.innerHTML = `
    <h3>✅ Thank You!</h3>
    <p>We've received your information. Our team will contact you within 24 hours.</p>
    <p style="font-size: 0.9rem; color: #666; margin-top: 1rem;">
      Expecting a message on <strong>${data.phone}</strong>
    </p>
  `;

  form.parentElement.insertBefore(successDiv, form);
  form.style.display = 'none';

  // Add success styling
  const style = document.createElement('style');
  style.textContent = `
    .success-message {
      background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
      border: 2px solid #27ae60;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
}

function showErrorMessage(form, message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.innerHTML = `<p>❌ ${message}</p>`;
  form.insertBefore(errorDiv, form.firstChild);

  // Remove error after 5 seconds
  setTimeout(() => errorDiv.remove(), 5000);
}

function sendWhatsAppMessage(data) {
  const message = encodeURIComponent(
    `Hi ${data.name}, thanks for your interest in ${data.property}. ` +
    `Our team will contact you shortly with details. - Home Realtors`
  );
  const whatsappURL = `https://wa.me/91${data.phone.replace(/\D/g, '').slice(-10)}?text=${message}`;
  console.log('WhatsApp URL:', whatsappURL);
}

/**
 * Chat Widget Triggers
 */
function initChatTriggers() {
  const chatTriggers = document.querySelectorAll('[id^="chat-trigger"]');

  chatTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.chatWidget) {
        window.chatWidget.toggleChat();
      }
    });
  });
}

/**
 * Scroll Behaviors
 */
function initScrollBehaviors() {
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#' && document.querySelector(href)) {
        e.preventDefault();
        document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Scroll to top on page load
  window.scrollTo(0, 0);
}

/**
 * Utility Functions
 */
window.scrollToSection = function(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

window.openChat = function() {
  if (window.chatWidget) {
    window.chatWidget.toggleChat();
  }
};

// Track page analytics (placeholder)
function trackPageView() {
  console.log('Page View:', {
    url: window.location.href,
    title: document.title,
    timestamp: new Date().toISOString()
  });
}

trackPageView();
