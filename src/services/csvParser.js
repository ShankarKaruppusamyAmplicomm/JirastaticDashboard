import Papa from 'papaparse';

/**
 * CSV Parser Service
 * Handles parsing and validation of CSV files containing bug data
 */

const REQUIRED_COLUMNS = ['key', 'summary', 'status', 'created'];
const OPTIONAL_COLUMNS = ['resolutiondate', 'priority', 'assignee', 'labels', 'updated', 'description', 'reporter'];
const ALL_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];

/**
 * Parse CSV file and convert to Jira issue format
 */
export const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => {
                // Remove BOM and other non-printable characters
                return header.replace(/[^\x21-\x7E\s]/g, '').trim().toLowerCase();
            },
            complete: (results) => {
                try {
                    if (!results.data || results.data.length === 0) {
                        reject(new Error('CSV file is empty'));
                        return;
                    }

                    // Map headers to standard fields
                    const rawHeaders = Object.keys(results.data[0]);
                    const fieldMap = mapHeaders(rawHeaders);

                    // Validate required columns
                    const missingRequired = REQUIRED_COLUMNS.filter(col => !fieldMap[col]);
                    if (missingRequired.length > 0) {
                        reject(new Error(`Missing required columns: ${missingRequired.join(', ')} (Checked common variations)`));
                        return;
                    }

                    // Transform CSV data to Jira issue format
                    const issues = transformToJiraFormat(results.data, fieldMap);

                    resolve({
                        issues,
                        count: issues.length,
                        errors: results.errors
                    });
                } catch (error) {
                    reject(error);
                }
            },
            error: (error) => {
                reject(new Error(`CSV parsing failed: ${error.message}`));
            }
        });
    });
};

/**
 * Map CSV headers to standard Jira field names
 */
const mapHeaders = (headers) => {
    const map = {};
    
    // Mapping rules: standard field -> array of possible CSV header names (lowercased)
    // Order matters: the first match in the array will be used
    const mappings = {
        key: ['ticket number', 'issue key', 'key', 'issue id'],
        summary: ['summary'],
        status: ['status'],
        created: ['created', 'created date'],
        resolutiondate: ['resolution date', 'resolved', 'resolutiondate'],
        priority: ['priority'],
        assignee: ['assignee'],
        labels: ['labels'],
        updated: ['updated', 'updated date'],
        description: ['description', 'summary'], // fallback
        reporter: ['reporter']
    };

    Object.entries(mappings).forEach(([field, variations]) => {
        const found = variations.find(v => headers.includes(v));
        if (found) {
            map[field] = found;
        }
    });

    return map;
};

/**
 * Transform CSV data to match Jira issue format
 */
const transformToJiraFormat = (data, fieldMap) => {
    return data.map((row, index) => {
        const getVal = (field) => {
            const header = fieldMap[field];
            return header ? row[header] : null;
        };

        const key = getVal('key');
        const summary = getVal('summary');
        const status = getVal('status');
        const createdRaw = getVal('created');

        // Validate required fields
        if (!key || !summary || !status || !createdRaw) {
            console.warn(`Row ${index + 1}: Missing required fields`, { key, summary, status, createdRaw });
            throw new Error(`Row ${index + 1}: Missing required fields (Key, Summary, Status, or Created)`);
        }

        // Validate date format
        const created = parseDate(createdRaw);
        if (!created) {
            throw new Error(`Row ${index + 1}: Invalid created date format: "${createdRaw}". Supported: YYYY-MM-DD, DD/MM/YYYY, DD/MM/YY HH:mm, DD/MM/YYYY HH:mm:ss AM/PM`);
        }

        const resRaw = getVal('resolutiondate');
        const resolutiondate = resRaw ? parseDate(resRaw) : null;
        
        // Don't throw for invalid resolution date, just log and skip it
        if (resRaw && !resolutiondate) {
            console.warn(`Row ${index + 1}: Could not parse resolution date: "${resRaw}"`);
        }

        const updatedRaw = getVal('updated');
        const updated = updatedRaw ? (parseDate(updatedRaw) || created) : created;

        const priorityRaw = getVal('priority');
        const assigneeRaw = getVal('assignee');
        const labelsRaw = getVal('labels');
        const descriptionRaw = getVal('description');
        const reporterRaw = getVal('reporter');

        // Transform to Jira issue format
        return {
            key: key.trim(),
            fields: {
                summary: summary.trim(),
                status: {
                    name: status.trim()
                },
                created: created,
                resolutiondate: resolutiondate,
                priority: priorityRaw ? { name: priorityRaw.trim() } : { name: 'Medium' },
                assignee: assigneeRaw ? { displayName: assigneeRaw.trim() } : null,
                labels: labelsRaw ? (typeof labelsRaw === 'string' ? labelsRaw.split(',').map(l => l.trim()) : []) : [],
                updated: updated,
                description: descriptionRaw || '',
                reporter: reporterRaw ? { displayName: reporterRaw.trim() } : null
            }
        };
    });
};

/**
 * Parse date string to ISO format
 * Supports multiple formats:
 * - YYYY-MM-DD
 * - DD/MM/YYYY
 * - DD/MM/YY HH:mm (24-hour format)
 * - DD/MM/YYYY HH:mm:ss AM/PM
 */
const parseDate = (dateStr) => {
    if (!dateStr || dateStr.trim() === '') return null;

    dateStr = dateStr.trim();

    // Try parsing DD/MM/YY HH:mm format (e.g., "01/04/24 12:53")
    const ddmmyyWithTimeRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{2})\s+(\d{1,2}):(\d{2})$/;
    const ddmmyyWithTimeMatch = dateStr.match(ddmmyyWithTimeRegex);

    if (ddmmyyWithTimeMatch) {
        const [, day, month, year, hour, minute] = ddmmyyWithTimeMatch;
        // Convert 2-digit year to 4-digit (assume 20xx for years 00-49, 19xx for 50-99)
        const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`;
        const date = new Date(fullYear, month - 1, day, hour, minute, 0);
        if (!isNaN(date.getTime())) {
            return date.toISOString();
        }
    }

    // Try parsing DD/MM/YYYY HH:mm:ss AM/PM format (e.g., "21/06/2024 6:25:00 PM")
    const ddmmyyyyWithTimeRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s+(AM|PM)$/i;
    const ddmmyyyyWithTimeMatch = dateStr.match(ddmmyyyyWithTimeRegex);

    if (ddmmyyyyWithTimeMatch) {
        const [, day, month, year, hour, minute, second, ampm] = ddmmyyyyWithTimeMatch;
        let hours = parseInt(hour);

        // Convert 12-hour to 24-hour format
        if (ampm.toUpperCase() === 'PM' && hours !== 12) {
            hours += 12;
        } else if (ampm.toUpperCase() === 'AM' && hours === 12) {
            hours = 0;
        }

        const date = new Date(year, month - 1, day, hours, minute, second);
        if (!isNaN(date.getTime())) {
            return date.toISOString();
        }
    }

    // Try parsing DD/MM/YYYY format (e.g., "21/06/2024")
    const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const ddmmyyyyMatch = dateStr.match(ddmmyyyyRegex);

    if (ddmmyyyyMatch) {
        const [, day, month, year] = ddmmyyyyMatch;
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) {
            return date.toISOString();
        }
    }

    // Try parsing YYYY-MM-DD format
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
        return date.toISOString();
    }

    return null;
};

/**
 * Generate sample CSV template
 */
export const generateSampleCSV = () => {
    const headers = ALL_COLUMNS.join(',');
    const sampleRows = [
        'SEP-1234,Login page not loading,Closed,01/12/2025 9:30:00 AM,05/12/2025 2:15:00 PM,High,John Doe,backend,05/12/2025 2:15:00 PM,User cannot access login page,Jane Smith',
        'SEP-1235,UI alignment issue,Open,10/12/2025 10:45:00 AM,,Medium,Jane Smith,frontend ui,15/12/2025 3:20:00 PM,Buttons are misaligned on mobile,John Doe',
        'SEP-1236,Database connection timeout,Resolved,15/12/2025 2:00:00 PM,20/12/2025 4:30:00 PM,High,Bob Wilson,backend database,20/12/2025 4:30:00 PM,Connection pool exhausted,Alice Brown'
    ];

    return `${headers}\n${sampleRows.join('\n')}`;
};

/**
 * Download sample CSV template
 */
export const downloadSampleCSV = () => {
    const csv = generateSampleCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'jira_bugs_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
};

export default {
    parseCSV,
    generateSampleCSV,
    downloadSampleCSV
};
