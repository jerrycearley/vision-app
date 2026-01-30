import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  RoadmapGenerationRequest,
  RoadmapGenerationResponse,
  RecommendationGenerationRequest,
  RecommendationGenerationResponse,
  ExplanationRequest,
  ExplanationResponse,
  GeneratedRoadmap,
  GeneratedRecommendation,
} from '@vision/shared';

@Injectable()
export class GeminiProvider {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('gemini.apiKey');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: this.configService.get<string>('gemini.model') || 'gemini-pro',
      });
    }
  }

  isAvailable(): boolean {
    return this.model !== null;
  }

  async generateRoadmap(request: RoadmapGenerationRequest): Promise<RoadmapGenerationResponse> {
    if (!this.model) {
      return {
        success: false,
        error: 'Gemini API not configured',
        provider: 'gemini',
      };
    }

    try {
      const prompt = this.buildRoadmapPrompt(request);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const roadmap = this.parseRoadmapResponse(text);

      return {
        success: true,
        roadmap,
        provider: 'gemini',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        provider: 'gemini',
      };
    }
  }

  async generateRecommendations(
    request: RecommendationGenerationRequest,
  ): Promise<RecommendationGenerationResponse> {
    if (!this.model) {
      return {
        success: false,
        recommendations: [],
        error: 'Gemini API not configured',
        provider: 'gemini',
      };
    }

    try {
      const prompt = this.buildRecommendationsPrompt(request);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const recommendations = this.parseRecommendationsResponse(text);

      return {
        success: true,
        recommendations,
        provider: 'gemini',
      };
    } catch (error) {
      return {
        success: false,
        recommendations: [],
        error: error.message,
        provider: 'gemini',
      };
    }
  }

  async explainRecommendation(request: ExplanationRequest): Promise<ExplanationResponse> {
    if (!this.model) {
      return {
        success: false,
        error: 'Gemini API not configured',
        provider: 'gemini',
      };
    }

    try {
      const prompt = this.buildExplanationPrompt(request);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        explanation: text,
        provider: 'gemini',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        provider: 'gemini',
      };
    }
  }

  private buildRoadmapPrompt(request: RoadmapGenerationRequest): string {
    return `You are a career and education advisor. Create a detailed roadmap for achieving the following goal.

Goal: ${request.goal}

User Profile:
- Interests: ${request.userProfile.interests.join(', ')}
- Current Skills: ${request.userProfile.skills.join(', ')}
- Goals: ${request.userProfile.goals.join(', ')}
- Education Level: ${request.userProfile.educationLevel || 'Not specified'}
${request.userProfile.age ? `- Age: ${request.userProfile.age}` : ''}

Preferences:
${request.preferences?.preferFreeResources ? '- Prefer free resources' : ''}
${request.preferences?.maxDuration ? `- Maximum duration: ${request.preferences.maxDuration}` : ''}
${request.preferences?.learningStyle ? `- Learning style: ${request.preferences.learningStyle}` : ''}

Please provide a roadmap in the following JSON format:
{
  "title": "Roadmap title",
  "description": "Brief description of the roadmap",
  "estimatedDuration": "e.g., 3 months",
  "milestones": [
    {
      "title": "Milestone title",
      "description": "What to accomplish",
      "estimatedDuration": "e.g., 2 weeks",
      "resources": [
        {
          "title": "Resource name",
          "type": "course/article/video/book/tool",
          "url": "https://example.com (if known)",
          "description": "Brief description",
          "isFree": true/false
        }
      ],
      "skills": ["skill1", "skill2"],
      "verificationSuggestion": "How to verify completion"
    }
  ],
  "prerequisites": ["Any prerequisites"],
  "tips": ["Helpful tips"]
}

Respond ONLY with the JSON, no additional text.`;
  }

  private buildRecommendationsPrompt(request: RecommendationGenerationRequest): string {
    return `You are a personalized recommendation engine. Based on the user's profile, generate ${request.count || 5} relevant recommendations.

User Profile:
- Interests: ${request.userProfile.interests.join(', ')}
- Skills: ${request.userProfile.skills.join(', ')}
- Goals: ${request.userProfile.goals.join(', ')}
- Education Level: ${request.userProfile.educationLevel || 'Not specified'}
${request.userProfile.age ? `- Age: ${request.userProfile.age}` : ''}

${request.category ? `Focus on category: ${request.category}` : ''}

Please provide recommendations in the following JSON format:
{
  "recommendations": [
    {
      "type": "activity/event/course/career/community/content/opportunity",
      "category": "education/career/hobby/social/health/entertainment/volunteer/skill_building",
      "title": "Recommendation title",
      "description": "Detailed description",
      "relevanceScore": 0.0-1.0,
      "reasoning": "Why this is recommended for the user",
      "tags": ["tag1", "tag2"]
    }
  ]
}

Respond ONLY with the JSON, no additional text.`;
  }

  private buildExplanationPrompt(request: ExplanationRequest): string {
    return `Explain why the following recommendation is relevant for this user in a friendly, personalized way.

Recommendation:
- Title: ${request.recommendation.title}
- Description: ${request.recommendation.description}
- Category: ${request.recommendation.category}
${request.recommendation.reasoning ? `- Initial reasoning: ${request.recommendation.reasoning}` : ''}

User Profile:
- Interests: ${request.userProfile.interests.join(', ')}
- Skills: ${request.userProfile.skills.join(', ')}
- Goals: ${request.userProfile.goals.join(', ')}

Provide a personalized explanation in 2-3 paragraphs that:
1. Connects the recommendation to their specific interests
2. Explains how it helps with their goals
3. Suggests next steps they could take`;
  }

  private parseRoadmapResponse(text: string): GeneratedRoadmap {
    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing roadmap response:', error);
    }

    // Return a default structure if parsing fails
    return {
      title: 'Generated Roadmap',
      description: 'Unable to parse AI response',
      estimatedDuration: 'Unknown',
      milestones: [],
    };
  }

  private parseRecommendationsResponse(text: string): GeneratedRecommendation[] {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.recommendations || [];
      }
    } catch (error) {
      console.error('Error parsing recommendations response:', error);
    }

    return [];
  }
}
