Training and Certification Platform
#Overview

This project is a Training and professional certification platform developed as part of the 4th Year Engineering Program at Esprit School of Engineering – Tunisia (2025–2026).

The platform provides a full-stack microservices solution for individual learners, companies, and communities. It includes advanced training, certification, gamification, hackathons, professional events, and a social networking ecosystem.

Its architecture allows modular development with Angular frontend, Spring Boot backend, and Maven for build and dependency management.

#Features
Module 1 — Learning & Training (B2C Core)

Course creation and management

Enrollment system and learning paths

Video lessons, documents, quizzes

Progress tracking and analytics

AI-based personalized learning recommendations

Skill-gap analysis and prerequisite management

Module 2 — Evaluation, Certification & Hackathons

Online exams and auto-corrected quizzes

Digital certificates (PDF & optional blockchain validation)

Hackathon creation, project submissions, real-time leaderboard

Jury evaluation and winner certificate generation

Module 3 — Corporate Module (B2B)

Employee certification management and HR analytics

Job offer publication and AI-based candidate matching

Freelance marketplace with secure contracts and ratings

Module 4 — Gamification & Real-Time Labs (Gamix)

Real-time virtual labs with Docker container isolation

Interactive scenario simulations

Level, XP, and points system with global leaderboard

Daily challenges and certification unlocking

Module 5 — Community & Social Network

Post creation (text, image, video) with likes, comments, and shares

User following, groups, and reputation system

Q&A forum with best-answer selection

Private messaging

Module 6 — Professional Events & Innovation Ecosystem

Online and physical event management with ticketing

Speaker and sponsor management

Workshops, bootcamps, and competition systems

Event-to-certification integration and analytics dashboard

#Tech Stack
Frontend

Angular

HTML, CSS,TypeScript

Backend

Java Spring Boot (Microservices)

Maven for build and dependency management

PostgreSQL/MySQL (depending on microservice)

Docker for containerized labs and microservices

#Architecture

The platform uses a microservices architecture:

Frontend: Angular SPA communicating with backend APIs via REST

Backend Services: Independent Spring Boot microservices handling:

User management

Course & learning module

Certification & evaluation

Corporate module

Gamification & labs

Community 

Competetion

Database: Each microservice maintains its own database schema for isolation

Docker: Used for real-time labs and deployment isolation

Integration: Services communicate via REST APIs and message queues where needed

Contributors

Team Members: jalel nasr - sahar khiari -Aziz Guizani -Badiss Benzarti -Yasmine Fakhfekh - Mohamed Ali Chraita

Project Supervisor: Alaa RAMI

#Academic Context

Developed as part of the 4th Year Engineering Program – Esprit School of Engineering, Tunisia (2025–2026).
The project demonstrates advanced full-stack development, microservices architecture, and professional e-learning solutions.

#Getting Started

Clone the repository:

git clone https://github.com/jalelnasr/PI_4eme.git

Backend setup:

Navigate to each microservice folder

Run mvn clean install

Configure application.properties for database and SMTP

Start microservices using:

mvn spring-boot:run

Frontend setup:

Navigate to frontend folder

Install dependencies:

npm install

Run development server:

ng serve

Access the app at http://localhost:4200

Docker Labs:

Ensure Docker is running

Labs are launched dynamically via the platform interface

#Acknowledgments

Esprit School of Engineering – Academic guidance

Open-source libraries and frameworks: Angular, Spring Boot, Maven, Docker

Inspiration from modern e-learning and professional development platforms
