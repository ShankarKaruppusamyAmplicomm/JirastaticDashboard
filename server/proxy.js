import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

/**
 * Proxy endpoint for Jira API requests
 * This bypasses CORS restrictions by making requests from the server
 */
app.post('/api/jira/search', async (req, res) => {
    try {
        const { domain, email, apiToken, jql, fields, pageToken } = req.body;

        if (!domain || !email || !apiToken) {
            return res.status(400).json({
                error: 'Missing required fields: domain, email, or apiToken'
            });
        }

        // Build basic auth header
        const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');

        // Prepare headers
        const headers = {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        try {
            // POST request to Jira search/jql endpoint with token-based pagination
            // Using the new /rest/api/3/search/jql endpoint as per CHANGE-2046
            // https://developer.atlassian.com/changelog/#CHANGE-2046
            // IMPORTANT: pageToken must be sent as a query parameter, NOT in the request body
            const requestBody = {
                jql
            };

            // Build URL with pageToken as query parameter if provided
            let url = `https://${domain}/rest/api/3/search/jql`;
            if (pageToken) {
                url += `?pageToken=${encodeURIComponent(pageToken)}`;
                console.log('Paginating with token (query param):', pageToken);
            }

            console.log('Requesting JQL:', jql);
            console.log('Request URL:', url);

            const response = await axios.post(
                url,
                requestBody,
                { headers }
            );

            res.json(response.data);
        } catch (error) {
            console.error('Jira API Proxy Error:', error.response ? error.response.data : error.message);
            res.status(error.response ? error.response.status : 500).json({
                error: 'Failed to fetch data from Jira',
                details: error.response ? error.response.data : error.message
            });
        }
    } catch (error) {
        console.error('Jira API Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.errorMessages?.[0] || error.message,
            details: error.response?.data
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Jira proxy server is running' });
});

app.listen(PORT, () => {
    console.log(`🚀 Jira proxy server running on http://localhost:${PORT}`);
    console.log(`📡 Ready to proxy requests to Jira API`);
});
