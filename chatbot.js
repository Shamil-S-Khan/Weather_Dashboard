class WeatherChatbot {
  constructor() {
    this.chatbot = document.getElementById('chatbot');
    this.messages = [];
    this.isOpen = false;
    this.API_KEY = "AIzaSyDxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx"; // Replace with your Gemini API key
    this.initializeChatbot();
  }

  initializeChatbot() {
    // Create chatbot UI
    this.chatbot.innerHTML = `
      <div class="chatbot-container">
        <div class="chatbot-header">
          <h3><i class="fas fa-robot"></i> Weather Assistant</h3>
          <button class="minimize-btn"><i class="fas fa-minus"></i></button>
        </div>
        <div class="chatbot-messages"></div>
        <div class="chatbot-input">
          <input type="text" placeholder="Ask me about the weather..." />
          <button class="send-btn"><i class="fas fa-paper-plane"></i></button>
        </div>
      </div>
    `;

    // Add event listeners
    const input = this.chatbot.querySelector('input');
    const sendBtn = this.chatbot.querySelector('.send-btn');
    const minimizeBtn = this.chatbot.querySelector('.minimize-btn');

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleUserInput(input.value);
        input.value = '';
      }
    });

    sendBtn.addEventListener('click', () => {
      this.handleUserInput(input.value);
      input.value = '';
    });

    minimizeBtn.addEventListener('click', () => {
      this.toggleChatbot();
    });

    // Add initial greeting
    this.addMessage('Hello! I\'m your AI-powered weather assistant. How can I help you today?', 'bot');
  }

  toggleChatbot() {
    const container = this.chatbot.querySelector('.chatbot-container');
    this.isOpen = !this.isOpen;
    container.style.display = this.isOpen ? 'flex' : 'none';
  }

  async handleUserInput(input) {
    if (!input.trim()) return;

    // Add user message
    this.addMessage(input, 'user');

    try {
      // Get weather data if the question is about weather
      const weatherData = await this.getWeatherDataIfNeeded(input);
      
      // Generate response using Gemini
      const response = await this.generateGeminiResponse(input, weatherData);
      this.addMessage(response, 'bot');
    } catch (error) {
      this.addMessage("I'm sorry, I encountered an error. Please try again later.", 'bot');
      console.error('Error:', error);
    }
  }

  async getWeatherDataIfNeeded(input) {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('weather') || lowerInput.includes('temperature') || lowerInput.includes('forecast')) {
      const city = this.extractCity(input);
      if (city) {
        try {
          return await this.fetchWeatherData(city);
        } catch (error) {
          console.error('Weather API Error:', error);
          return null;
        }
      }
    }
    return null;
  }

  async generateGeminiResponse(input, weatherData) {
    const prompt = this.createPrompt(input, weatherData);
    
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Gemini');
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      return this.getFallbackResponse(input, weatherData);
    }
  }

  createPrompt(input, weatherData) {
    let prompt = `You are a helpful weather assistant. The user asked: "${input}"\n\n`;
    
    if (weatherData) {
      prompt += `Here is the current weather data for ${weatherData.name}:
        Temperature: ${Math.round(weatherData.main.temp)}°C
        Feels like: ${Math.round(weatherData.main.feels_like)}°C
        Condition: ${weatherData.weather[0].description}
        Humidity: ${weatherData.main.humidity}%
        
        Please provide a helpful response using this weather data.`;
    } else {
      prompt += `Please provide a helpful response about weather. If the user is asking about a specific city's weather, ask them to specify the city name.`;
    }

    return prompt;
  }

  getFallbackResponse(input, weatherData) {
    if (weatherData) {
      return this.formatWeatherResponse(weatherData);
    }
    
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('help') || lowerInput.includes('how to')) {
      return `I can help you with:
        - Current weather in any city
        - Temperature information
        - Weather forecasts
        - General weather questions
        
        Just ask me about the weather in a specific city!`;
    }
    
    return "I'm not sure I understand. Try asking me about the weather in a specific city or type 'help' for more information.";
  }

  addMessage(text, sender) {
    const messagesContainer = this.chatbot.querySelector('.chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message fade-in`;
    
    const icon = sender === 'bot' ? 'robot' : 'user';
    messageDiv.innerHTML = `
      <div class="message-content">
        <i class="fas fa-${icon}"></i>
        <p>${text}</p>
      </div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  extractCity(input) {
    // Simple city extraction - can be improved with NLP
    const cityMatch = input.match(/in\s+([A-Za-z\s]+)/i);
    return cityMatch ? cityMatch[1].trim() : null;
  }

  async fetchWeatherData(city) {
    const API_KEY = "e95f2238b47ad7d7e2b5beb638c2448e";
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error('City not found');
    }
    
    return await response.json();
  }

  formatWeatherResponse(data) {
    const { name, main, weather } = data;
    return `Here's the current weather in ${name}:
      - Temperature: ${Math.round(main.temp)}°C
      - Feels like: ${Math.round(main.feels_like)}°C
      - Condition: ${weather[0].description}
      - Humidity: ${main.humidity}%`;
  }
}

// Initialize chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new WeatherChatbot();
}); 