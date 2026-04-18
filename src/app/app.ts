import { Component, OnInit, signal, NgZone, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, AfterViewInit {
  formData = {
    name: '',
    email: '',
    message: ''
  };
  
  showSuccess = signal(false);
  isSubmitting = signal(false);

  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    this.initObserver();
    this.initScrollListener();
  }

  initScrollListener() {
    window.addEventListener('scroll', () => {
      const nav = document.querySelector('.navbar');
      if (window.scrollY > 50) {
        nav?.classList.add('scrolled');
      } else {
        nav?.classList.remove('scrolled');
      }
    });
  }

  ngAfterViewInit() {
    this.initParticles();
    this.initTiltEffect();
  }

  async submitForm() {
    this.isSubmitting.set(true);
    const endpoint = 'https://formspree.io/f/xyklwvyk'; 
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(this.formData)
      });
      if (response.ok) {
        this.showSuccess.set(true);
        this.formData = { name: '', email: '', message: '' };
      }
    } catch (error) {
      console.error('Submission Error:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  // GRAPHICS: High-Level Particle System
  initParticles() {
    this.ngZone.runOutsideAngular(() => {
      const canvas = document.getElementById('particle-canvas') as HTMLCanvasElement;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let particles: any[] = [];
      const particleCount = 60;

      const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };

      class Particle {
        x: number; y: number; vx: number; vy: number; size: number;
        constructor() {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.vx = (Math.random() - 0.5) * 0.5;
          this.vy = (Math.random() - 0.5) * 0.5;
          this.size = Math.random() * 2;
        }
        update() {
          this.x += this.vx; this.y += this.vy;
          if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
          if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
      }

      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 243, 255, 0.4)';
        particles.forEach((p, i) => {
          p.update();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (dist < 150) {
              ctx.strokeStyle = `rgba(0, 243, 255, ${0.1 * (1 - dist / 150)})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        });
        requestAnimationFrame(animate);
      };

      window.addEventListener('resize', resize);
      resize();
      animate();
    });
  }

  // GRAPHICS: 3D Tilt Interaction
  initTiltEffect() {
    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach((card: any) => {
      card.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 30; // Subtler tilt
        const rotateY = (centerX - x) / 30; // Subtler tilt
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
      });
    });
  }

  initObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  }
}
