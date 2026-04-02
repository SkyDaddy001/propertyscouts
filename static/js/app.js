/**
 * Property Scouts App - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
  initFormHandling();
  initChatTriggers();
  initScrollBehaviors();
  initHamburgerMenu();
  trackPageView();
});

/**
 * Form Handling
 */
function initFormHandling() {
  var forms = document.querySelectorAll('.nurture-form');
  forms.forEach(function(form) {
    form.addEventListener('submit', handleFormSubmit);
  });
}

async function handleFormSubmit(e) {
  e.preventDefault();

  var form = e.target;
  var formData = new FormData(form);
  var data = Object.fromEntries(formData);

  data.whatsapp = form.querySelector('[name="whatsapp"]') && form.querySelector('[name="whatsapp"]').checked ? 'on' : '';
  data.newsletter = form.querySelector('[name="newsletter"]') && form.querySelector('[name="newsletter"]').checked ? 'on' : '';
  data.timestamp = new Date().toISOString();
  data.source = window.location.href;
  data.property = data.property || form.dataset.property || '';
  data.persona = data.persona || form.dataset.persona || '';

  var webhookUrl = window.SITE_CONFIG && window.SITE_CONFIG.formWebhookUrl;

  console.log('Form data:', data);
  console.log('Webhook URL:', webhookUrl);
  console.log('SITE_CONFIG:', window.SITE_CONFIG);

  try {
    if (webhookUrl) {
      console.log('Posting to webhook...');
      var response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        mode: 'cors'
      });
      console.log('Webhook response:', response.status, response.statusText);
      if (!response.ok) throw new Error('Webhook ' + response.status);
    } else {
      console.log('No webhook URL configured');
    }

    showSuccessMessage(form, data);

    if (data.whatsapp && data.phone) {
      sendWhatsAppMessage(data);
    }
  } catch (error) {
    console.error('Form submission error:', error);
    if (!webhookUrl) {
      showSuccessMessage(form, data);
      sendWhatsAppMessage(data);
    } else {
      showErrorMessage(form, 'Submission failed. Please call us or use WhatsApp.');
    }
  }
}

function showSuccessMessage(form, data) {
  var successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.innerHTML =
    '<h3>\u2705 Thank You!</h3>' +
    '<p>We\u2019ve received your information. Our team will contact you within 24 hours.</p>' +
    '<p style="font-size:0.9rem;color:#666;margin-top:1rem;">' +
    'Expecting a call on <strong>' + (data.phone || '') + '</strong></p>';

  form.parentElement.insertBefore(successDiv, form);
  form.style.display = 'none';
}

function showErrorMessage(form, message) {
  var errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.innerHTML = '<p>\u274C ' + message + '</p>';
  form.insertBefore(errorDiv, form.firstChild);
  setTimeout(function() { errorDiv.remove(); }, 5000);
}

function sendWhatsAppMessage(data) {
  var businessNumber = window.SITE_CONFIG && window.SITE_CONFIG.whatsappNumber
    ? window.SITE_CONFIG.whatsappNumber
    : '91XXXXXXXXXX';

  var propertyName = data.property || 'a property';
  var message = encodeURIComponent(
    'Hi, I am ' + (data.name || 'a visitor') + ' and I am interested in ' +
    propertyName + '. Please contact me on ' + (data.phone || '') + '.'
  );
  var whatsappURL = 'https://wa.me/' + businessNumber + '?text=' + message;
  window.open(whatsappURL, '_blank', 'noopener,noreferrer');
}

/**
 * Chat Widget Triggers
 */
function initChatTriggers() {
  var chatTriggers = document.querySelectorAll('[id^="chat-trigger"]');
  chatTriggers.forEach(function(trigger) {
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      if (window.chatWidget) {
        window.chatWidget.toggleChat();
      }
    });
  });
}

/**
 * Hamburger Menu
 */
function initHamburgerMenu() {
  var hamburger = document.querySelector('.hamburger');
  var navMenu = document.querySelector('.nav-menu');
  if (!hamburger || !navMenu) return;

  hamburger.addEventListener('click', function() {
    var isOpen = navMenu.classList.toggle('nav-open');
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    hamburger.classList.toggle('hamburger-active', isOpen);
  });

  navMenu.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
      navMenu.classList.remove('nav-open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.classList.remove('hamburger-active');
    });
  });
}

/**
 * Scroll Behaviors
 */
function initScrollBehaviors() {
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var href = this.getAttribute('href');
      if (href !== '#' && document.querySelector(href)) {
        e.preventDefault();
        document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  window.scrollTo(0, 0);
}

window.scrollToSection = function(sectionId) {
  var el = document.getElementById(sectionId);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

window.openChat = function() {
  if (window.chatWidget) window.chatWidget.toggleChat();
};

/**
 * GA4 Analytics
 */
function trackPageView() {
  var gaId = window.SITE_CONFIG && window.SITE_CONFIG.gaTrackingId;
  if (!gaId) return;

  if (!document.getElementById('gtag-script')) {
    var s = document.createElement('script');
    s.id = 'gtag-script';
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaId;
    document.head.appendChild(s);
  }

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', gaId, { page_path: window.location.pathname });
}
