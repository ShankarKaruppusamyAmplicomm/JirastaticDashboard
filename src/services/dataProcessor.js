import { format, parseISO, eachDayOfInterval, eachMonthOfInterval, subDays, differenceInHours, differenceInDays } from 'date-fns';

/**
 * Data Processor Service
 * Transforms raw Jira data into dashboard metrics
 */

// Classification Constants
const PRIORITY_MAP = {
    "Highest": 4,
    "High": 3,
    "Medium": 2,
    "Low": 1
};

const STATUS_GROUPS = {
    resolved: ["Closed", "Resolved" , "resolved" ],
    invalid: ["INVALID", "Invalid", "Won't Fix", "Cannot Reproduce", "Not a Bug"],
    duplicate: ["Duplicate", "DUPLICATE"],
    open: ["Open", "Reopened", "To Do", "In Progress"]
};

/**
 * Classify bug priority
 */
export function classifyPriority(priority) {
    const p = priority?.name || priority || "Medium";
    return {
        name: p,
        value: PRIORITY_MAP[p] || 0
    };
}

/**
 * Classify bug status
 */
export function classifyStatus(status) {
    const s = (status?.name || status || "").trim().toLowerCase();
    
    if (STATUS_GROUPS.resolved.some(val => val.toLowerCase() === s)) return "Resolved";
    if (STATUS_GROUPS.invalid.some(val => val.toLowerCase() === s)) return "Invalid";
    if (STATUS_GROUPS.duplicate.some(val => val.toLowerCase() === s)) return "Duplicate";
    
    return "Open";
}

/**
 * Classify environment based on labels or text
 */
export function classifyEnvironment(bug) {
    const text = (bug.fields.labels?.join(' ') || '') + ' ' + (bug.fields.summary || '') + ' ' + (bug.fields.description || '');
    const lowerText = text.toLowerCase();

    // Heuristic: Check for keywords if specific flags aren't available
    const has_uat = lowerText.includes('uat') || lowerText.includes('staging');
    const has_prod = lowerText.includes('prod') || lowerText.includes('production') || lowerText.includes('live');
    const has_qa = lowerText.includes('qa') || lowerText.includes('test') || lowerText.includes('quality');

    if (has_uat) return "UAT";
    if (has_prod) return "PROD";
    if (has_qa) return "QA";
    return "Unknown";
}

/**
 * Classify source (Customer vs Internal)
 */
export function classifySource(bug) {
    // Heuristic: Check labels or reporter (placeholder logic)
    const labels = bug.fields.labels || [];
    if (labels.some(l => l.toLowerCase().includes('customer') || l.toLowerCase().includes('client'))) {
        return "Customer";
    }
    return "Internal";
}

/**
 * Calculate bug aging (days since creation)
 */
export function calculateAge(bug) {
    const created = parseISO(bug.fields.created);
    const now = new Date();
    // If resolved, use resolution date, otherwise use now
    const endParams = bug.fields.resolutiondate ? parseISO(bug.fields.resolutiondate) : now;
    return differenceInDays(endParams, created);
}

/**
 * Calculate bug aging in hours (from creation to resolution or now)
 */
export function calculateAgeInHours(bug) {
    const created = parseISO(bug.fields.created);
    const now = new Date();
    const end = bug.fields.resolutiondate ? parseISO(bug.fields.resolutiondate) : now;
    return Math.max(0, differenceInHours(end, created));
}

/**
 * Calculate average time to close bugs (in hours)
 */
export function calculateAverageTimeToClose(bugs) {
    const resolvedBugs = bugs.filter(bug =>
        bug.fields.resolutiondate && bug.fields.created
    );

    if (resolvedBugs.length === 0) {
        return 0;
    }

    const totalHours = resolvedBugs.reduce((sum, bug) => {
        const created = parseISO(bug.fields.created);
        const resolved = parseISO(bug.fields.resolutiondate);
        return sum + differenceInHours(resolved, created);
    }, 0);

    return Math.round(totalHours / resolvedBugs.length);
}

/**
 * Format hours into human-readable string
 */
export function formatDuration(hours) {
    if (hours < 24) {
        return `${hours}h`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) {
        return `${days}d`;
    }
    return `${days}d ${remainingHours}h`;
}

/**
 * Group bugs by date
 */
export function groupBugsByDate(bugs, dateField = 'created') {
    const grouped = {};

    bugs.forEach(bug => {
        const dateStr = bug.fields[dateField];
        if (!dateStr) return;

        const date = format(parseISO(dateStr), 'yyyy-MM-dd');
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(bug);
    });

    return grouped;
}

/**
 * Get daily bug counts for a date range
 */
export function getDailyCounts(bugs, startDate, endDate, dateField = 'created') {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const grouped = groupBugsByDate(bugs, dateField);

    return days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        return {
            date: dateStr,
            count: grouped[dateStr]?.length || 0
        };
    });
}

/**
 * Calculate Monthly Trends
 */
export function calculateMonthlyTrends(bugs, startDate, endDate) {
    const months = eachMonthOfInterval({ start: startDate, end: endDate });

    return months.map(month => {
        const monthStr = format(month, 'yyyy-MM');
        const monthLabel = format(month, 'MMM yyyy');

        // Filter bugs created in this month (by created date, any status)
        const createdInMonth = bugs.filter(b => {
            try { return format(parseISO(b.fields.created), 'yyyy-MM') === monthStr; }
            catch { return false; }
        });

        // Filter bugs resolved in this month (by resolutiondate, regardless of when created)
        const resolvedInMonth = bugs.filter(b => {
            if (!b.fields.resolutiondate) return false;
            if (classifyStatus(b.fields.status) !== 'Resolved') return false;
            try { return format(parseISO(b.fields.resolutiondate), 'yyyy-MM') === monthStr; }
            catch { return false; }
        });

        return {
            month: monthLabel,
            raised: createdInMonth.length,
            resolved: resolvedInMonth.length,
            openRate: createdInMonth.filter(b => classifyStatus(b.fields.status) === 'Open').length
        };
    });
}

/**
 * Calculate daily trends for short-term aging buckets (0-24 hrs)
 */
export function calculateShortTermTrends(bugs, startDate, endDate) {
    const buckets = [
        { key: '0-4 Hrs', min: 0, max: 4 },
        { key: '4-8 Hrs', min: 4, max: 8 },
        { key: '8-12 Hrs', min: 8, max: 12 },
        { key: '12-24 Hrs', min: 12, max: 24 }
    ];

    // Get daily counts for each bucket
    const bucketTrends = buckets.map(bucket => {
        const bucketBugs = bugs.filter(bug => {
            const ageHrs = calculateAgeInHours(bug);
            // Include lower bound to capture 0-hour bugs in 0-4 bucket
            return ageHrs >= bucket.min && ageHrs <= bucket.max;
        });
        
        // We use 'created' as the baseline for the trend line
        return {
            key: bucket.key,
            dailyCounts: getDailyCounts(bucketBugs, startDate, endDate, 'created')
        };
    });

    // Merge into Recharts format: [{ date: '2023-01-01', '0-4 Hrs': 5, '4-8 Hrs': 2, ... }]
    const mergedTrend = [];
    const dateCount = bucketTrends[0]?.dailyCounts.length || 0;

    for (let i = 0; i < dateCount; i++) {
        const entry = {
            date: bucketTrends[0].dailyCounts[i].date
        };
        bucketTrends.forEach(trend => {
            entry[trend.key] = trend.dailyCounts[i].count;
        });
        mergedTrend.push(entry);
    }

    return mergedTrend;
}

/**
 * Filter bugs by status category (Legacy support)
 */
export function filterBugsByStatus(bugs, statusCategory) {
    // Mapping legacy requests to new classification
    if (statusCategory === 'open') {
        return bugs.filter(b => classifyStatus(b.fields.status) === 'Open');
    }
    if (statusCategory === 'closed') {
        return bugs.filter(b => classifyStatus(b.fields.status) === 'Resolved');
    }
    return bugs;
}

/**
 * Get team from bug fields
 */
export function getTeamFromBug(bug, teamField = 'labels') {
    const value = bug.fields[teamField];
    if (!value) return 'Unknown';

    if (Array.isArray(value)) {
        // Labels or multiple choice field
        return value.map(v => typeof v === 'string' ? v : v.value).join(', ');
    } else if (typeof value === 'string') {
        return value;
    } else if (value.value) {
        return value.value;
    }

    return 'Unknown';
}


/**
 * Process analytics data
 */
export function processAnalyticsData(bugs) {
    return bugs.map(bug => ({
        key: bug.key,
        summary: bug.fields.summary,
        priority: classifyPriority(bug.fields.priority).name,
        priorityVal: classifyPriority(bug.fields.priority).value, // For sorting
        status: classifyStatus(bug.fields.status),
        rawStatus: bug.fields.status?.name,
        assignee: bug.fields.assignee?.displayName || 'Unassigned',
        updated: format(parseISO(bug.fields.updated), 'yyyy-MM-dd HH:mm'),
        created: format(parseISO(bug.fields.created), 'yyyy-MM-dd'),
        resolutiondate: bug.fields.resolutiondate ? format(parseISO(bug.fields.resolutiondate), 'yyyy-MM-dd HH:mm') : null,
        environment: classifyEnvironment(bug),
        source: classifySource(bug),
        age: calculateAge(bug),
        ageInHours: calculateAgeInHours(bug)
    }));
}

/**
 * Process project-wide data with extended analytics
 */
export function processProjectData(bugs, dateRange) {
    const metrics = calculateProjectMetrics(bugs, dateRange);
    const { startDate, endDate } = dateRange;

    // Filter bugs for advanced analytics to match the date range
    // Include bugs that were either created OR resolved within the range
    const filteredBugs = bugs.filter(bug => {
        const created = parseISO(bug.fields.created);
        const resolved = bug.fields.resolutiondate ? parseISO(bug.fields.resolutiondate) : null;
        
        const createdInRange = created >= startDate && created <= endDate;
        const resolvedInRange = resolved && resolved >= startDate && resolved <= endDate;
        
        return createdInRange || resolvedInRange;
    });

    // Add advanced analytics data using ONLY filtered bugs
    metrics.monthlyTrends = calculateMonthlyTrends(filteredBugs, startDate, endDate);
    metrics.detailedBugs = processAnalyticsData(filteredBugs);
    metrics.shortTermTrends = calculateShortTermTrends(filteredBugs, startDate, endDate);

    // Classifications for charts
    metrics.byEnvironment = {
        UAT: metrics.detailedBugs.filter(b => b.environment === 'UAT').length,
        PROD: metrics.detailedBugs.filter(b => b.environment === 'PROD').length,
        QA: metrics.detailedBugs.filter(b => b.environment === 'QA').length,
        Unknown: metrics.detailedBugs.filter(b => b.environment === 'Unknown').length
    };

    metrics.bySource = {
        Customer: metrics.detailedBugs.filter(b => b.source === 'Customer').length,
        Internal: metrics.detailedBugs.filter(b => b.source === 'Internal').length
    };

    metrics.byPriority = {
        Highest: metrics.detailedBugs.filter(b => b.priority === 'Highest').length,
        High: metrics.detailedBugs.filter(b => b.priority === 'High').length,
        Medium: metrics.detailedBugs.filter(b => b.priority === 'Medium').length,
        Low: metrics.detailedBugs.filter(b => b.priority === 'Low').length
    };

    metrics.byStatus = {
        Open: metrics.detailedBugs.filter(b => b.status === 'Open').length,
        Resolved: metrics.detailedBugs.filter(b => b.status === 'Resolved').length,
        Invalid: metrics.detailedBugs.filter(b => b.status === 'Invalid').length,
        Duplicate: metrics.detailedBugs.filter(b => b.status === 'Duplicate').length
    };

    return metrics;
}

/**
 * Process teams data with extended analytics (DEPRECATED - kept for backward compatibility)
 */
export function processTeamsData(bugs, dateRange, targetTeams, teamField = 'labels') {
    const teams = Array.isArray(targetTeams) ? targetTeams : [targetTeams];
    const teamsData = {};

    teams.forEach(team => {
        const teamBugs = bugs.filter(bug => {
            const val = bug.fields[teamField];
            if (!val) return false;

            if (Array.isArray(val)) {
                return val.some(v => (typeof v === 'string' ? v : v.value) === team);
            }
            return (typeof val === 'string' ? val : val.value) === team;
        });

        const metrics = calculateTeamMetrics(teamBugs, dateRange);

        // Add advanced analytics data
        metrics.monthlyTrends = calculateMonthlyTrends(teamBugs, dateRange.startDate, dateRange.endDate);
        metrics.detailedBugs = processAnalyticsData(teamBugs);

        // Classifications for charts
        metrics.byEnvironment = {
            UAT: metrics.detailedBugs.filter(b => b.environment === 'UAT').length,
            PROD: metrics.detailedBugs.filter(b => b.environment === 'PROD').length,
            QA: metrics.detailedBugs.filter(b => b.environment === 'QA').length,
            Unknown: metrics.detailedBugs.filter(b => b.environment === 'Unknown').length
        };

        metrics.bySource = {
            Customer: metrics.detailedBugs.filter(b => b.source === 'Customer').length,
            Internal: metrics.detailedBugs.filter(b => b.source === 'Internal').length
        };

        metrics.byPriority = {
            Highest: metrics.detailedBugs.filter(b => b.priority === 'Highest').length,
            High: metrics.detailedBugs.filter(b => b.priority === 'High').length,
            Medium: metrics.detailedBugs.filter(b => b.priority === 'Medium').length,
            Low: metrics.detailedBugs.filter(b => b.priority === 'Low').length
        };

        teamsData[team] = metrics;
    });

    return teamsData;
}

/**
 * Calculate metrics for the project (project-wide)
 */
export function calculateProjectMetrics(bugs, dateRange) {
    const { startDate, endDate } = dateRange;

    // Filter bugs within date range for total count and status metrics
    const bugsInRange = bugs.filter(bug => {
        const created = parseISO(bug.fields.created);
        return created >= startDate && created <= endDate;
    });

    // Filter "Open" bugs based on their creation date within the selected range
    const openBugs = bugsInRange.filter(b => classifyStatus(b.fields.status) === 'Open');
    
    // Filter "Resolved" bugs based on their resolution date within the selected range (even if created before)
    const closedBugs = bugs.filter(bug => {
        if (!bug.fields.resolutiondate) return false;
        const resolved = parseISO(bug.fields.resolutiondate);
        return resolved >= startDate && resolved <= endDate && classifyStatus(bug.fields.status) === 'Resolved';
    });

    // Calculate daily trends
    const openTrend = getDailyCounts(openBugs, startDate, endDate, 'created');
    const resolvedTrend = getDailyCounts(closedBugs, startDate, endDate, 'resolutiondate');

    // Calculate average time to close
    const avgTimeToClose = calculateAverageTimeToClose(closedBugs);

    return {
        openCount: openBugs.length,
        closedCount: closedBugs.length,
        avgTimeToClose,
        avgTimeToCloseFormatted: formatDuration(avgTimeToClose),
        openTrend,
        resolvedTrend,
        totalBugs: bugsInRange.length
    };
}

/**
 * Calculate metrics for a team
 */
export function calculateTeamMetrics(bugs, dateRange) {
    const { startDate, endDate } = dateRange;

    // Filter bugs within date range for total count and status metrics
    const bugsInRange = bugs.filter(bug => {
        const created = parseISO(bug.fields.created);
        return created >= startDate && created <= endDate;
    });

    // Filter "Open" bugs based on their creation date within the selected range
    const openBugs = bugsInRange.filter(b => classifyStatus(b.fields.status) === 'Open');
    
    // Filter "Resolved" bugs based on their resolution date within the selected range (even if created before)
    const closedBugs = bugs.filter(bug => {
        if (!bug.fields.resolutiondate) return false;
        const resolved = parseISO(bug.fields.resolutiondate);
        return resolved >= startDate && resolved <= endDate && classifyStatus(bug.fields.status) === 'Resolved';
    });

    // Calculate daily trends
    const openTrend = getDailyCounts(openBugs, startDate, endDate, 'created');
    const resolvedTrend = getDailyCounts(closedBugs, startDate, endDate, 'resolutiondate');

    // Calculate average time to close
    const avgTimeToClose = calculateAverageTimeToClose(closedBugs);

    return {
        openCount: openBugs.length,
        closedCount: closedBugs.length,
        avgTimeToClose,
        avgTimeToCloseFormatted: formatDuration(avgTimeToClose),
        openTrend,
        resolvedTrend,
        totalBugs: bugsInRange.length
    };
}

/**
 * Generate mock data for testing (when Jira is not configured)
 */
export function generateMockData(dateRange) {
    const { startDate, endDate } = dateRange;
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const months = eachMonthOfInterval({ start: startDate, end: endDate });

    const baseOpen = 15;
    const baseClosed = 10;

    const openTrend = days.map((day) => ({
        date: format(day, 'yyyy-MM-dd'),
        count: Math.max(0, baseOpen + Math.floor(Math.random() * 5) - 2)
    }));

    const resolvedTrend = days.map((day) => ({
        date: format(day, 'yyyy-MM-dd'),
        count: Math.max(0, baseClosed + Math.floor(Math.random() * 3))
    }));

    // Mock Monthly Trends
    const monthlyTrends = months.map(m => ({
        month: format(m, 'MMM yyyy'),
        raised: 60 + Math.floor(Math.random() * 30),
        resolved: 45 + Math.floor(Math.random() * 20),
        openRate: 15 + Math.floor(Math.random() * 10)
    }));

    // Mock Detailed Bugs
    const detailedBugs = Array(100).fill(0).map((_, i) => ({
        key: `SEP-${1000 + i}`,
        summary: `Mock Issue ${i + 1}: Sample bug description`,
        priority: ['Low', 'Medium', 'High', 'Highest'][Math.floor(Math.random() * 4)],
        priorityVal: Math.floor(Math.random() * 4) + 1,
        status: ['Open', 'Resolved', 'Invalid', 'Duplicate'][Math.floor(Math.random() * 4)],
        rawStatus: ['Open', 'Closed', 'Invalid', 'Duplicate'][Math.floor(Math.random() * 4)],
        assignee: `User ${Math.floor(Math.random() * 10) + 1}`,
        updated: format(subDays(new Date(), Math.floor(Math.random() * 30)), 'yyyy-MM-dd HH:mm'),
        created: format(subDays(new Date(), Math.floor(Math.random() * 60)), 'yyyy-MM-dd'),
        resolutiondate: format(subDays(new Date(), Math.floor(Math.random() * 30)), 'yyyy-MM-dd HH:mm'),
        environment: ['UAT', 'PROD', 'QA', 'Unknown'][Math.floor(Math.random() * 4)],
        source: ['Customer', 'Internal'][Math.floor(Math.random() * 2)],
        age: Math.floor(Math.random() * 60),
        ageInHours: Math.floor(Math.random() * 1440)
    }));

    return {
        openCount: openTrend.reduce((sum, d) => sum + d.count, 0),
        closedCount: resolvedTrend.reduce((sum, d) => sum + d.count, 0),
        avgTimeToClose: 36 + Math.floor(Math.random() * 24),
        avgTimeToCloseFormatted: formatDuration(36 + Math.floor(Math.random() * 24)),
        openTrend,
        resolvedTrend,
        totalBugs: openTrend.reduce((sum, d) => sum + d.count, 0) + resolvedTrend.reduce((sum, d) => sum + d.count, 0),
        monthlyTrends,
        detailedBugs,
        byEnvironment: { UAT: 30, PROD: 15, QA: 45, Unknown: 10 },
        bySource: { Customer: 25, Internal: 75 },
        byPriority: { Highest: 10, High: 30, Medium: 40, Low: 20 },
        byStatus: { Open: 40, Resolved: 50, Invalid: 5, Duplicate: 5 }
    };
}
