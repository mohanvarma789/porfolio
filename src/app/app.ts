import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  formData = {
    name: '',
    email: '',
    message: ''
  };
  
  // Using Signals for guaranteed UI updates
  showSuccess = signal(false);
  isSubmitting = signal(false);

  ngOnInit() {
    this.initObserver();
  }

  async submitForm() {
    this.isSubmitting.set(true);
    
    const endpoint = 'https://formspree.io/f/xyklwvyk'; 
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.formData)
      });

      console.log('Formspree Response Status:', response.status);

      if (response.ok) {
        // Success path
        this.isSubmitting.set(false); // Turn off loader first
        this.showSuccess.set(true);   // Then show modal
        this.formData = { name: '', email: '', message: '' };
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission Error:', error);
      alert('Failed to send message. Please check your connection or try again later.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  initObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1
    });

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));
  }
}
