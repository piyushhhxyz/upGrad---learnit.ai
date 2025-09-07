export interface ApiResponse {
    success: boolean;
    audioId?: string;
    audioContent?: string; // Base64 encoded audio content
    message?: string;
    error?: string;
}

export const callOpenAI = async (contentId: number, conversationHistory: Array<{ cardId: number; audioId?: string; audioContent?: string; timestamp: number }> = []): Promise<ApiResponse> => {
    console.log('callOpenAI called with contentId:', contentId, 'conversationHistory:', conversationHistory);

    try {
        console.log('Making fetch request to /api/generate-audio');

        const response = await fetch('/api/generate-audio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contentId,
                conversationHistory
            }),
        });

        console.log('Fetch response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log('API response data:', data);
        return data;
    } catch (error) {
        console.error("API call failed:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Network error occurred"
        };
    }
};
