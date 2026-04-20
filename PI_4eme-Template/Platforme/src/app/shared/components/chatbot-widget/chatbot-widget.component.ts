import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface ChatMessage {
  text: string;
  isBot: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-widget.component.html',
  styleUrls: ['./chatbot-widget.component.css']
})
export class ChatbotWidgetComponent implements OnInit {
  isOpen = false;
  isMinimized = false;
  messages: ChatMessage[] = [];
  userInput = '';
  isTyping = false;

  private apiUrl = 'http://localhost:8087/api/chatbot';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Message de bienvenue
    this.addBotMessage('👋 Bonjour! Je suis EventBot, ton assistant virtuel.\n\nComment puis-je t\'aider aujourd\'hui?\n\nTape "aide" pour voir ce que je peux faire!');
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.isMinimized = false;
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  minimizeChat(): void {
    this.isMinimized = !this.isMinimized;
  }

  closeChat(): void {
    this.isOpen = false;
    this.isMinimized = false;
  }

  sendMessage(): void {
    if (!this.userInput.trim()) {
      return;
    }

    // Ajouter le message de l'utilisateur
    this.addUserMessage(this.userInput);
    const question = this.userInput;
    this.userInput = '';

    // Afficher l'indicateur de frappe
    this.isTyping = true;

    // Envoyer la question au backend
    this.http.post<any>(`${this.apiUrl}/ask`, { question })
      .subscribe({
        next: (response) => {
          setTimeout(() => {
            this.isTyping = false;
            if (response.success) {
              this.addBotMessage(response.response);
            } else {
              this.addBotMessage('Désolé, je n\'ai pas pu traiter ta question. Réessaie plus tard.');
            }
          }, 500); // Délai pour rendre la réponse plus naturelle
        },
        error: (err) => {
          console.error('Erreur chatbot:', err);
          this.isTyping = false;
          this.addBotMessage('Oups! Une erreur s\'est produite. Vérifie que le serveur est démarré.');
        }
      });
  }

  private addUserMessage(text: string): void {
    this.messages.push({
      text,
      isBot: false,
      timestamp: new Date()
    });
    setTimeout(() => this.scrollToBottom(), 100);
  }

  private addBotMessage(text: string): void {
    this.messages.push({
      text,
      isBot: true,
      timestamp: new Date()
    });
    setTimeout(() => this.scrollToBottom(), 100);
  }

  private scrollToBottom(): void {
    const chatMessages = document.querySelector('.chatbot-messages');
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
