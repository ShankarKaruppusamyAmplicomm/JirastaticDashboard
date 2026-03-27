# Jira Bug Trend Dashboard

A modern React web application that integrates with the Jira REST API to provide comprehensive bug tracking and trend analysis across testing teams.

## Features

- 📊 **Team-wise Bug Metrics**: Track bugs across Automation, UAT, and System Testing teams
- 📈 **Daily Trends**: Visualize open/in-progress and closed/fixed bugs over time
- ⏱️ **Average Resolution Time**: Calculate and display average time to close bugs
- 🎨 **Modern UI**: Beautiful dark mode with glassmorphism effects and smooth animations
- 🔄 **Real-time Data**: Connect to your Jira instance or use mock data for testing
- 📅 **Flexible Date Ranges**: Select custom date ranges or use preset options

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Proxy Server (Required for Jira Connection)
```bash
npm run proxy
```
This starts the CORS proxy server on port 3001.

### 3. Start the Development Server
In a new terminal:
```bash
npm run dev
```

### 4. Open the Dashboard
Visit http://localhost:5173

The app will load with **mock data** by default. To connect to your Jira instance, click "Configure Jira" and enter your credentials.

## Connecting to Jira

### Prerequisites
- Jira Cloud account
- API token from https://id.atlassian.com/manage-profile/security/api-tokens
- Bugs labeled with: `Automation Team`, `UAT Team`, or `System Testing Team`

### Configuration Steps
1. Make sure the **proxy server is running** (`npm run proxy`)
2. Click **"Configure Jira"** in the dashboard
3. Enter your details:
   - **Jira Domain**: yourcompany.atlassian.net
   - **Email**: your-email@example.com
   - **API Token**: paste your token
   - **Project Key**: your project key (e.g., SEP)
4. Click **"Save Configuration"**

The app will now fetch real data from your Jira instance!

## Why the Proxy Server?

Browsers block direct requests to Jira's API due to CORS (Cross-Origin Resource Sharing) restrictions. The proxy server runs on your machine and forwards requests to Jira, bypassing these restrictions.

## Technologies

React 18 • Vite • Recharts • Axios • date-fns • Lucide Icons • Express (proxy)

---

**Note**: Both the dev server (`npm run dev`) and proxy server (`npm run proxy`) must be running to connect to Jira. The app works with mock data if only the dev server is running.
