import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";
import { SYSTEM_PROMPT } from "@/lib/prompts";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

console.log('OpenAI client initialized with API key:', !!process.env.OPENAI_API_KEY);

export async function POST(request: NextRequest) {
    console.log('API route /api/generate-audio called');

    try {
        const { contentId, conversationHistory = [] } = await request.json();

        if (!contentId) {
            console.log('No contentId provided, returning 400');
            return NextResponse.json(
                { success: false, error: "Content ID is required" },
                { status: 400 }
            );
        }

        // Build messages array based on content ID - exactly as you specified
        const messages: any[] = [
            {
                "role": "system",
                "content": [
                    {
                        "type": "text",
                        "text": SYSTEM_PROMPT.text
                    }
                ]
            }
        ];

        // Add conversation history if available
        if (conversationHistory.length > 0) {
            conversationHistory.forEach((entry: any, index: number) => {
                // Add user message
                messages.push({
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": `${entry.cardId}`
                        }
                    ]
                });

                // Add assistant response if audio ID exists
                if (entry.audioId) {
                    messages.push({
                        "role": "assistant",
                        "content": [],
                        "audio": {
                            "id": entry.audioId
                        }
                    });
                }
            });
        }

        // Add current user message with content ID
        messages.push({
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": `${contentId}`
                }
            ]
        });

        console.log('=== CALLING OPENAI API ===');
        console.log('Messages being sent to OpenAI:', JSON.stringify(messages, null, 2));
        console.log('OpenAI API Key exists:', !!process.env.OPENAI_API_KEY);

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini-audio-preview-2024-12-17",
            messages,
            modalities: ["text", "audio"],
            audio: {
                "voice": "alloy",
                "format": "pcm16"
            },
            temperature: 1,
            max_completion_tokens: 2048,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        });

        console.log('=== OPENAI API RESPONSE ===');
        console.log('Response received from OpenAI');

        // Extract audio ID from response
        const audioId = response.choices[0]?.message?.audio?.id;
        const audioContent = response.choices[0]?.message?.content;

        console.log('OpenAI response audioId:', audioId);
        console.log('OpenAI response content:', audioContent);

        // The OpenAI audio API should return the audio content directly
        // We need to extract it from the response
        let audioBase64 = null;

        // Check if audio content is in the response
        if (response.choices[0]?.message?.audio) {
            const audioData = response.choices[0].message.audio;
            console.log('Audio data from OpenAI:', audioData);

            // The audio content might be in different fields
            if ((audioData as any).content) {
                audioBase64 = (audioData as any).content;
                console.log('Found audio content in audio object');
            } else if ((audioData as any).data) {
                audioBase64 = (audioData as any).data;
                console.log('Found audio data in audio object');
            }
        }

        // If no audio content found, log the full response for debugging
        if (!audioBase64) {
            console.log('No audio content found. Full response:', JSON.stringify(response, null, 2));
        }

        const result = {
            success: true,
            audioId: audioId || undefined,
            audioContent: audioBase64,
            message: "Audio generated successfully"
        };

        console.log('Returning result with audio content:', !!audioBase64);
        return NextResponse.json(result);

    } catch (error) {
        console.error("OpenAI API Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error occurred"
            },
            { status: 500 }
        );
    }
}
