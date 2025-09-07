// Application constants and configuration

export const API_ENDPOINTS = {
    GENERATE_GRAPH: '/api/generate-graph',
    UPLOAD_DOCUMENT: '/api/upload-document',
    ANALYZE_CONTENT: '/api/analyze-content'
} as const;

export const FILE_CONSTRAINTS = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ACCEPTED_TYPES: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'application/rtf'
    ]
} as const;

export const UI_MESSAGES = {
    UPLOAD_SUCCESS: 'Content uploaded successfully!',
    GENERATING_GRAPH: 'Generating content graph...',
    GRAPH_SUCCESS: 'Content graph generated successfully!',
    UPLOAD_ERROR: 'Failed to upload file. Please try again.',
    GENERATION_ERROR: 'Failed to generate content graph. Please try again.',
    API_KEY_ERROR: 'OpenAI API key is not configured. Please contact support.'
} as const;

export const ANIMATION_DURATIONS = {
    SNACKBAR_DISPLAY: 3000,
    UPLOAD_DELAY: 2000,
    GENERATION_DELAY: 3000,
    SCROLL_DURATION: 500
} as const;
