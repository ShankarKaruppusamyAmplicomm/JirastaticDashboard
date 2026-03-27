import axios from 'axios';

/**
 * Jira API Service
 * Handles all interactions with the Jira REST API
 * Now uses proxy server to avoid CORS issues
 */

class JiraService {
  constructor() {
    this.baseUrl = null;
    this.auth = null;
    this.projectKey = null;
    this.teamFieldId = null; // Optional team field
    this.initialized = false;
    this.useProxy = true; // Use proxy server by default
    this.proxyUrl = 'http://localhost:3001/api/jira/search';
  }

  /**
   * Initialize the Jira service with configuration
   */
  configure(config) {
    const { domain, email, apiToken, projectKey, teamFieldId } = config;

    this.baseUrl = `https://${domain}/rest/api/3`;
    this.auth = {
      username: email,
      password: apiToken
    };
    this.domain = domain;
    this.email = email;
    this.apiToken = apiToken;
    this.projectKey = projectKey;
    if (teamFieldId) {
      this.teamFieldId = teamFieldId;
    }
    this.initialized = true;
  }

  /**
   * Check if service is configured
   */
  isConfigured() {
    return this.initialized;
  }

  /**
   * Build JQL query for fetching bugs (project-wide, no team filtering)
   */
  buildJQL({ status, startDate, endDate, dateField = 'created' }) {
    const conditions = [];

    // Project filter
    if (this.projectKey) {
      conditions.push(`project = ${this.projectKey}`);
    }

    // Issue type filter (bugs only)
    conditions.push(`issuetype = Bug`);

    // Status filter
    if (status && status.length > 0) {
      if (status.length === 1) {
        conditions.push(`status = "${status[0]}"`);
      } else {
        const statusList = status.map(s => `"${s}"`).join(', ');
        conditions.push(`status IN (${statusList})`);
      }
    }

    // Date range filter
    if (startDate) {
      conditions.push(`${dateField} >= "${startDate}"`);
    }
    if (endDate) {
      conditions.push(`${dateField} <= "${endDate}"`);
    }

    return conditions.join(' AND ');
  }

  /**
   * Fetch issues from Jira using proxy server with token-based pagination
   * Fetches ALL issues matching the JQL query using the new /rest/api/3/search/jql endpoint
   */
  async fetchIssues(jql, fields = ['key', 'summary', 'status', 'created', 'resolutiondate', 'labels', 'priority', 'assignee', 'updated', 'description', 'reporter']) {
    if (!this.initialized) {
      throw new Error('Jira service not configured');
    }

    try {
      const allIssues = [];
      let pageToken = null;
      let isLast = false;
      let pageCount = 0;

      // Keep fetching until we get all issues using token-based pagination
      while (!isLast) {
        pageCount++;
        console.log(`Fetching page ${pageCount}...`);

        // Add delay between requests to avoid rate limiting (except for first page)
        if (pageCount > 1) {
          await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
        }

        if (this.useProxy) {
          // Use proxy server to avoid CORS
          const requestBody = {
            domain: this.domain,
            email: this.email,
            apiToken: this.apiToken,
            jql,
            fields: fields.join(',')
          };

          // Add pageToken for subsequent pages
          if (pageToken) {
            requestBody.pageToken = pageToken;
          }

          const response = await axios.post(this.proxyUrl, requestBody);

          const { issues, nextPageToken, isLast: lastPage } = response.data;
          allIssues.push(...issues);

          // Update pagination state
          pageToken = nextPageToken;
          isLast = lastPage;

          console.log(`Fetched ${allIssues.length} issues so far...`);
        } else {
          // Direct API call not supported for new endpoint
          throw new Error('Direct API calls not supported. Please use proxy server.');
        }
      }

      console.log(`✓ Fetched all ${allIssues.length} issues in ${pageCount} pages`);
      return allIssues;
    } catch (error) {
      console.error('Error fetching Jira issues:', error);

      // If proxy fails, provide helpful error message
      if (this.useProxy && error.code === 'ERR_NETWORK') {
        throw new Error('Proxy server not running. Start it with: npm run proxy');
      }

      throw new Error(`Failed to fetch issues: ${error.message}`);
    }
  }

  /**
   * Get bugs by status for a specific date range
   */
  async getBugsByStatus(status, startDate, endDate) {
    const jql = this.buildJQL({ status, startDate, endDate });
    return await this.fetchIssues(jql);
  }

  /**
   * Get all bugs for the project within a date range
   */
  async getAllBugs(startDate, endDate) {
    const jql = this.buildJQL({ startDate, endDate });
    return await this.fetchIssues(jql);
  }

  /**
   * Get bugs created on a specific date
   */
  async getBugsCreatedOnDate(date) {
    const jql = this.buildJQL({
      startDate: date,
      endDate: date,
      dateField: 'created'
    });
    return await this.fetchIssues(jql);
  }

  /**
   * Get bugs resolved on a specific date
   */
  async getBugsResolvedOnDate(date) {
    const jql = this.buildJQL({
      startDate: date,
      endDate: date,
      dateField: 'resolutiondate'
    });
    return await this.fetchIssues(jql);
  }

  /**
   * Get open/in-progress bugs count
   */
  async getOpenBugsCount(date) {
    const bugs = await this.getBugsByStatus(
      ['Open', 'In Progress', 'To Do', 'Reopened'],
      null,
      date
    );
    return bugs.length;
  }

  /**
   * Get closed/fixed bugs count
   */
  async getClosedBugsCount(startDate, endDate) {
    const bugs = await this.getBugsByStatus(
      ['Closed', 'Done', 'Resolved', 'Fixed'],
      startDate,
      endDate
    );
    return bugs.length;
  }
}

// Create singleton instance
const jiraService = new JiraService();

export default jiraService;
