# LISH - Digital Workspace Platform

A comprehensive digital workplace platform for managing projects, employees, and client relationships.

## Features

- **Multi-Role System**: Separate dashboards for Admins, Employees, and Clients
- **Project Management**: Track service requests from submission to completion
- **Real-time Notifications**: Stay updated on project status changes
- **Employee Management**: Attendance tracking, task assignment, and performance monitoring
- **Payment Processing**: Integrated payment workflow with upfront and final payments
- **Support System**: Built-in ticketing system for client support
- **Meeting Scheduler**: Request and schedule meetings with clients

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **State Management**: TanStack Query
- **Animations**: Framer Motion

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials

3. Run development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

- `/src/components/lish/admin` - Admin dashboard components
- `/src/components/lish/client` - Client dashboard components
- `/src/components/lish/employee` - Employee dashboard components
- `/src/hooks` - Custom React hooks (auth, notifications)
- `/supabase/migrations` - Database schema and migrations

## Default Access Codes

- **Employee**: `LISH-EMP-2024`
- **Admin**: `LISH-ADMIN-SECRET`

## License

Proprietary - All rights reserved
