/**
 * Gemini AI Chat Widget for Home Realtors
 * Real estate intelligent assistant with lead capture
 */

class GeminiChatWidget {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.isOpen = false;
    this.conversationHistory = [];
    this.leadData = {};
    this.init();
  }

  init() {
    this.createWidget();
    this.attachEventListeners();
  }

  createWidget() {
    const widgetHTML = `
      <div id="gemini-chat-widget" class="chat-widget">
        <div class="chat-header">
          <div class="chat-title">
            <h3>Property Scouts AI Assistant</h3>
            <p>Find your perfect property</p>
          </div>
          <button id="chat-close-btn" class="chat-close" aria-label="Close chat">×</button>
        </div>
        <div id="chat-messages" class="chat-messages"></div>
        <div class="chat-input-area">
          <input
            type="text"
            id="chat-input"
            placeholder="Ask about properties, investments, locations..."
            disabled
          />
          <button id="chat-send-btn" class="chat-send" disabled>Send</button>
        </div>
      </div>
      <button id="chat-toggle-btn" class="chat-toggle" aria-label="Open chat">
        💬 Need Help?
      </button>
    `;

    document.body.insertAdjacentHTML('beforeend', widgetHTML);
    this.widget = document.getElementById('gemini-chat-widget');
    this.chatMessages = document.getElementById('chat-messages');
    this.chatInput = document.getElementById('chat-input');
    this.sendBtn = document.getElementById('chat-send-btn');
  }

  attachEventListeners() {
    document.getElementById('chat-toggle-btn').addEventListener('click', () => this.toggleChat());
    document.getElementById('chat-close-btn').addEventListener('click', () => this.toggleChat());
    document.getElementById('chat-send-btn').addEventListener('click', () => this.sendMessage());
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    // Enable input after widget initializes
    setTimeout(() => {
      this.chatInput.disabled = false;
      this.sendBtn.disabled = false;
      this.addMessage('assistant', 'Hi! 👋 I\'m your real estate assistant. Ask me about properties, investments, locations, or schools in Tambaram & Kattupakkam!');
    }, 500);
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    this.widget.classList.toggle('open', this.isOpen);
    if (this.isOpen) {
      this.chatInput.focus();
    }
  }

  addMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${sender}`;
    messageDiv.innerHTML = `<p>${this.escapeHtml(text)}</p>`;
    this.chatMessages.appendChild(messageDiv);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  async sendMessage() {
    const message = this.chatInput.value.trim();
    if (!message) return;

    this.addMessage('user', message);
    this.chatInput.value = '';
    this.sendBtn.disabled = true;

    try {
      const response = await this.callGeminiAPI(message);
      this.addMessage('assistant', response);

      // Detect lead intent
      this.detectLeadIntent(message, response);
    } catch (error) {
      this.addMessage('assistant', 'Sorry, I encountered an error. Please call us or use WhatsApp to reach our team.');
      console.error('Gemini API error:', error);
    } finally {
      this.sendBtn.disabled = false;
      this.chatInput.focus();
    }
  }

  async callGeminiAPI(userMessage) {
    const systemPrompt = `You are an expert real estate advisor for Home Realtors in Chennai.
You help buyers find perfect properties across 3 premium projects:
1. SkyLiving Tambaram - 175 units, high-rise, ₹62L-₹1Cr
2. League One Kattupakkam - 125 units, 4 blocks, ₹59L-₹95L
3. Luxe One Kattupakkam - Ultra-premium, low-density, ₹65L-₹1.1Cr

Provide personalized recommendations based on:
- Budget constraints
- Investment vs lifestyle focus
- Family needs vs investor ROI
- Commute preferences (location)

Be concise, helpful, and mention specific properties when relevant.
Always offer to schedule a site visit or consultation call.`;

    const messages = [
      ...this.conversationHistory,
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    const requestBody = {
      contents: messages,
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    const assistantMessage = data.candidates[0].content.parts[0].text;

    // Store in history
    this.conversationHistory.push(
      { role: 'user', parts: [{ text: userMessage }] },
      { role: 'model', parts: [{ text: assistantMessage }] }
    );

    return assistantMessage;
  }

  detectLeadIntent(userMessage, assistantResponse) {
    // Simple lead intent detection
    const keywords = ['call', 'visit', 'schedule', 'appointment', 'interested', 'book', 'contact'];
    const hasLeadIntent = keywords.some(kw =>
      userMessage.toLowerCase().includes(kw) ||
      assistantResponse.toLowerCase().includes(kw)
    );

    if (hasLeadIntent && !this.leadData.captured) {
      setTimeout(() => this.showLeadForm(), 1000);
    }
  }

  showLeadForm() {
    const formHTML = `
      <div class="lead-form-popup">
        <h4>Schedule Your Property Visit</h4>
        <input type="text" id="lead-name" placeholder="Your name" />
        <input type="tel" id="lead-phone" placeholder="Phone number" />
        <button onclick="window.chatWidget.submitLead()">Schedule Now</button>
      </div>
    `;
    this.chatMessages.insertAdjacentHTML('beforeend', formHTML);
  }

  submitLead() {
    const name = document.getElementById('lead-name')?.value;
    const phone = document.getElementById('lead-phone')?.value;

    if (!name || !phone) return;

    this.leadData = { name, phone, timestamp: new Date().toISOString(), source: window.location.href };

    const webhookUrl = window.SITE_CONFIG && window.SITE_CONFIG.formWebhookUrl;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'chat-lead', ...this.leadData })
      }).catch(err => console.error('Lead POST failed:', err));
    }

    this.leadData.captured = true;
    this.addMessage('assistant', 'Great! We\'ll contact you soon to schedule your visit. 🏠');

    const popup = this.chatMessages.querySelector('.lead-form-popup');
    if (popup) popup.remove();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  const apiKey = document.querySelector('[data-gemini-key]')?.dataset.geminiKey;
  if (apiKey) {
    window.chatWidget = new GeminiChatWidget(apiKey);
  }
});
