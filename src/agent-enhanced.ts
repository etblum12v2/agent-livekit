import {
  type JobContext,
  type JobProcess,
  WorkerOptions,
  cli,
  defineAgent,
  metrics,
  voice,
  llm,
} from '@livekit/agents';
import * as livekit from '@livekit/agents-plugin-livekit';
import * as silero from '@livekit/agents-plugin-silero';
import { BackgroundVoiceCancellation } from '@livekit/noise-cancellation-node';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { SlideGenerator, type SlideData } from './slide-generator.js';
import fetch from 'node-fetch';

dotenv.config({ path: '.env.local' });

class Assistant extends voice.Agent {
  public currentLesson: string = 'welcome';
  public lessonProgress: number = 0;
  private slideGenerator: SlideGenerator;
  private currentSlide: Buffer | null = null;
  private webInterfaceUrl: string = process.env.WEB_INTERFACE_URL || 'http://localhost:3000';
  private currentRoom: string = '';
  
  private lessonTopics: Record<string, any> = {
    welcome: {
      title: "Welcome to HCV Training",
      description: "Introduction to Housing Choice Voucher program",
      topics: [
        "What is HCV and why it exists",
        "Who administers the program",
        "Basic program overview"
      ]
    },
    eligibility: {
      title: "HCV Eligibility Requirements",
      description: "Understanding who qualifies for HCV assistance",
      topics: [
        "Income limits and calculations",
        "Family composition requirements",
        "Citizenship and immigration status",
        "Background check requirements"
      ]
    },
    application: {
      title: "Application Process",
      description: "How to apply for HCV assistance",
      topics: [
        "Finding your local PHA",
        "Required documents",
        "Waiting list process",
        "Application timeline"
      ]
    },
    income: {
      title: "Income and Asset Calculations",
      description: "Understanding HCV income calculations",
      topics: [
        "Annual income definition",
        "Asset calculations",
        "Income exclusions",
        "Reporting requirements"
      ]
    },
    payment: {
      title: "Payment Standards and Rent",
      description: "How HCV rent calculations work",
      topics: [
        "Payment standards",
        "Utility allowances",
        "Rent calculation methods",
        "Minimum rent requirements"
      ]
    },
    voucher: {
      title: "Voucher Process",
      description: "Using your HCV voucher",
      topics: [
        "Voucher issuance",
        "Housing search process",
        "HQS inspections",
        "Lease requirements"
      ]
    },
    rights: {
      title: "Tenant Rights and Responsibilities",
      description: "Understanding your HCV obligations",
      topics: [
        "Tenant responsibilities",
        "Landlord obligations",
        "Program violations",
        "Appeal processes"
      ]
    }
  };

  constructor() {
    super({
      instructions: `You are a specialized HCV (Housing Choice Voucher) Training Assistant with a structured lesson plan system and automatic visual slide generation.

      Your role is to:
      - Provide structured HCV education through guided lessons
      - Start each session with a lesson plan overview
      - Progress through topics systematically
      - Automatically generate visual slides for each topic
      - Adapt to user needs while maintaining educational structure
      - Provide accurate information about HUD regulations and PHA requirements
      - Help users understand rent calculations, payment standards, and procedures
      - Be patient, encouraging, and supportive while maintaining accuracy
      
      LESSON STRUCTURE:
      - Always begin by presenting the current lesson plan
      - Guide users through topics in logical order
      - Ask comprehension questions to ensure understanding
      - Provide practical examples and scenarios
      - Allow users to ask questions but keep focus on lesson objectives
      - Automatically generate slides when starting topics or lessons
      
      VISUAL INTEGRATION:
      - Generate slides automatically when starting lessons
      - Create slides for each major topic
      - Use different slide types (title, content, chart, process) as appropriate
      - Send slide updates to the web interface in real-time
      
      You speak clearly and conversationally, as if teaching HCV concepts step by step.
      Keep responses educational and structured, always encouraging further learning.`,

      tools: {
        checkEligibility: llm.tool({
          description: `Check if a family might be eligible for HCV assistance based on their income and family size.
          
          This tool helps users understand basic HCV eligibility requirements.`,
          parameters: z.object({
            familySize: z.number().describe('Number of people in the family'),
            annualIncome: z.number().describe('Total annual household income in dollars'),
            location: z.string().nullable().describe('City or state (optional, for area-specific income limits)'),
          }),
          execute: async ({ familySize, annualIncome, location }) => {
            // Basic eligibility check - typically 80% of Area Median Income
            // This is a simplified calculation for educational purposes
            const incomeLimits: Record<number, number> = {
              1: 50000,  // 1 person
              2: 57000,  // 2 people  
              3: 64000,  // 3 people
              4: 71000,  // 4 people
              5: 77000,  // 5 people
              6: 83000,  // 6 people
              7: 89000,  // 7 people
              8: 95000,  // 8 people
            };
            
            const limit = incomeLimits[familySize] || incomeLimits[8]!;
            const isEligible = annualIncome <= limit;
            
            return `Based on your family size of ${familySize} and annual income of $${annualIncome.toLocaleString()}, ${isEligible ? 'you may be eligible' : 'you may not be eligible'} for HCV assistance. The income limit for a family of ${familySize} is typically around $${limit.toLocaleString()} per year. However, actual limits vary by location and are set by local PHAs. I recommend contacting your local Public Housing Authority for exact income limits in your area.`;
          },
        }),
        
        calculateRent: llm.tool({
          description: `Calculate how much rent a family would pay with HCV assistance.
          
          This helps users understand HCV rent calculation methods.`,
          parameters: z.object({
            adjustedIncome: z.number().describe('Monthly adjusted income (after deductions)'),
            totalRent: z.number().describe('Total monthly rent for the unit'),
            paymentStandard: z.number().nullable().describe('Local payment standard (optional)'),
          }),
          execute: async ({ adjustedIncome, totalRent, paymentStandard }) => {
            // HCV rent calculation: tenant pays 30% of adjusted income
            const tenantPortion = adjustedIncome * 0.30;
            const hcvPortion = totalRent - tenantPortion;
            
            let result = `With HCV assistance, you would pay approximately $${tenantPortion.toFixed(2)} per month (30% of your adjusted income of $${adjustedIncome}).`;
            
            if (paymentStandard && totalRent > paymentStandard) {
              result += ` However, since the rent ($${totalRent}) exceeds the payment standard ($${paymentStandard}), you would need to pay the difference, making your total payment $${tenantPortion + (totalRent - paymentStandard)}.`;
            } else {
              result += ` HCV would pay approximately $${hcvPortion.toFixed(2)} toward your rent.`;
            }
            
            return result;
          },
        }),
        
        explainHCVTerm: llm.tool({
          description: `Explain HCV-related terms and concepts to help users understand the program better.`,
          parameters: z.object({
            term: z.string().describe('The HCV term or concept to explain'),
          }),
          execute: async ({ term }) => {
            const explanations: Record<string, string> = {
              'hcv': 'Housing Choice Voucher - a federal program that helps low-income families afford decent, safe, and sanitary housing in the private market.',
              'pha': 'Public Housing Authority - the local government agency that administers HCV programs in your area.',
              'hud': 'Housing and Urban Development - the federal department that oversees HCV programs nationwide.',
              'payment standard': 'The maximum amount HCV will pay toward rent and utilities, set by the local PHA.',
              'fair market rent': 'The maximum rent amount HCV will cover, determined by HUD based on local market conditions.',
              'housing quality standards': 'Minimum requirements that HCV housing must meet for safety and habitability.',
              'portability': 'The ability to use your HCV voucher in a different PHA area when moving.',
              'recertification': 'Annual review of your continued eligibility for HCV assistance.',
              'voucher': 'The document that provides rental assistance and allows you to rent from private landlords.',
              'income limit': 'Maximum income allowed for HCV participation, typically 80% of Area Median Income.',
            };
            
            const explanation = explanations[term.toLowerCase()];
            
            if (explanation) {
              return explanation;
            } else {
              return `I don't have a specific explanation for "${term}" in my HCV glossary. Could you ask me about a different HCV term, or would you like me to explain what HCV, PHA, or Payment Standard means?`;
            }
          },
        }),

        startLesson: llm.tool({
          description: `Start a specific HCV lesson or show the lesson plan overview.`,
          parameters: z.object({
            lessonType: z.string().nullable().describe('The lesson to start (welcome, eligibility, application, income, payment, voucher, rights) or null for overview'),
          }),
          execute: async ({ lessonType }) => {
            if (!lessonType) {
              // Show lesson plan overview
              let overview = "Welcome to HCV Training! Here's your complete lesson plan:\n\n";
              Object.entries(this.lessonTopics).forEach(([key, lesson], index) => {
                overview += `${index + 1}. ${lesson.title}\n   ${lesson.description}\n   Topics: ${lesson.topics.join(', ')}\n\n`;
              });
              overview += "Which lesson would you like to start with? Just say the lesson name or number!";
              return overview;
            }

            const lesson = this.lessonTopics[lessonType.toLowerCase()];
            if (!lesson) {
              return `I don't have a lesson called "${lessonType}". Available lessons are: ${Object.keys(this.lessonTopics).join(', ')}`;
            }

            this.currentLesson = lessonType.toLowerCase();
            this.lessonProgress = 0;

            let response = `Starting Lesson: ${lesson.title}\n\n${lesson.description}\n\n`;
            response += `We'll cover these topics:\n`;
            lesson.topics.forEach((topic: string, index: number) => {
              response += `${index + 1}. ${topic}\n`;
            });
            response += `\nLet's begin with the first topic: ${lesson.topics[0]}`;
            
            // Automatically generate and send slide for lesson start
            await this.sendSlideUpdate('title', lesson.topics[0]);
            
            return response;
          },
        }),

        nextTopic: llm.tool({
          description: `Move to the next topic in the current lesson.`,
          parameters: z.object({}),
          execute: async () => {
            const currentLessonData = this.lessonTopics[this.currentLesson];
            if (!currentLessonData) {
              return "No lesson is currently active. Use startLesson to begin a lesson first.";
            }

            this.lessonProgress++;
            if (this.lessonProgress >= currentLessonData.topics.length) {
              this.lessonProgress = currentLessonData.topics.length - 1;
              
              // Generate completion slide
              await this.sendSlideUpdate('content', 'Lesson Complete', [
                `Congratulations! You've completed the ${currentLessonData.title} lesson.`,
                `Topics covered: ${currentLessonData.topics.length}`,
                'Would you like to start a new lesson or review any topics?'
              ]);
              
              return `We've completed all topics in the ${currentLessonData.title} lesson! Would you like to start a new lesson or review any topics?`;
            }

            const currentTopic = currentLessonData.topics[this.lessonProgress];
            
            // Automatically generate slide for new topic
            await this.sendSlideUpdate('content', currentTopic);
            
            return `Moving to topic ${this.lessonProgress + 1}: ${currentTopic}\n\nLet me explain this topic in detail...`;
          },
        }),

        getCurrentLesson: llm.tool({
          description: `Get information about the current lesson and progress.`,
          parameters: z.object({}),
          execute: async () => {
            const currentLessonData = this.lessonTopics[this.currentLesson];
            if (!currentLessonData) {
              return "No lesson is currently active.";
            }

            const currentTopic = currentLessonData.topics[this.lessonProgress];
            return `Current Lesson: ${currentLessonData.title}\nTopic ${this.lessonProgress + 1} of ${currentLessonData.topics.length}: ${currentTopic}\n\nProgress: ${Math.round(((this.lessonProgress + 1) / currentLessonData.topics.length) * 100)}% complete`;
          },
        }),

        generateSlide: llm.tool({
          description: `Generate a visual slide for the current topic.`,
          parameters: z.object({
            slideType: z.string().describe('Type of slide: title, content, chart, or process'),
            customContent: z.array(z.string()).nullable().describe('Custom content for the slide'),
          }),
          execute: async ({ slideType, customContent }) => {
            const currentLessonData = this.lessonTopics[this.currentLesson];
            if (!currentLessonData) {
              return "No lesson is currently active. Please start a lesson first.";
            }

            const currentTopic = currentLessonData.topics[this.lessonProgress];
            
            // Generate and send slide
            await this.sendSlideUpdate(slideType as 'title' | 'content' | 'chart' | 'process', currentTopic, customContent);
            
            return `[Visual slide generated and displayed for: ${currentTopic}]`;
          },
        }),
      },
    });
    
    this.slideGenerator = new SlideGenerator();
  }

  // Method to send slide updates to web interface
  private async sendSlideUpdate(slideType: 'title' | 'content' | 'chart' | 'process', topic: string, customContent?: string[]) {
    try {
      console.log('📊 Agent sending slide update to room:', this.currentRoom);
      console.log('📊 Slide type:', slideType, 'Topic:', topic);
      
      const currentLessonData = this.lessonTopics[this.currentLesson];
      if (!currentLessonData) return;

      const slideData = await this.generateSlideForTopic(slideType, customContent);
      
      // Send slide update to web interface
      const response = await fetch(`${this.webInterfaceUrl}/api/agent/slide-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName: this.currentRoom,
          slideData: slideData
        })
      });

      if (!response.ok) {
        console.warn('Failed to send slide update to web interface');
      }
    } catch (error) {
      console.warn('Error sending slide update:', error);
    }
  }

  // Method to send agent messages to web interface
  private async sendAgentMessage(message: string, type: string = 'agent-speech') {
    try {
      const response = await fetch(`${this.webInterfaceUrl}/api/agent/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName: this.currentRoom,
          message: message,
          type: type
        })
      });

      if (!response.ok) {
        console.warn('Failed to send message to web interface');
      }
    } catch (error) {
      console.warn('Error sending message:', error);
    }
  }

  // Set current room for web interface communication
  setCurrentRoom(roomName: string) {
    this.currentRoom = roomName;
  }

  private async generateSlideForTopic(slideType: 'title' | 'content' | 'chart' | 'process', customContent?: string[]): Promise<any> {
    const currentLessonData = this.lessonTopics[this.currentLesson];
    if (!currentLessonData) {
      return null;
    }

    const currentTopic = currentLessonData.topics[this.lessonProgress];
    
    let slideData: SlideData;
    
    switch (slideType) {
      case 'title':
        slideData = {
          title: currentLessonData.title,
          content: [
            currentLessonData.description,
            `Topic ${this.lessonProgress + 1} of ${currentLessonData.topics.length}`,
            currentTopic
          ],
          type: 'title'
        };
        break;
        
      case 'content':
        slideData = {
          title: currentTopic,
          content: customContent || this.getTopicContent(currentTopic),
          type: 'content'
        };
        break;
        
      case 'chart':
        slideData = {
          title: `${currentTopic} - Data Visualization`,
          content: customContent || [`Visual representation of ${currentTopic}`],
          type: 'chart',
          chartData: this.getChartDataForTopic(currentTopic)
        };
        break;
        
      case 'process':
        slideData = {
          title: `${currentTopic} - Process Flow`,
          content: customContent || [`Step-by-step process for ${currentTopic}`],
          type: 'process',
          processSteps: this.getProcessStepsForTopic(currentTopic)
        };
        break;
        
      default:
        slideData = {
          title: currentTopic,
          content: customContent || this.getTopicContent(currentTopic),
          type: 'content'
        };
    }

    try {
      // Generate slide data as JSON for frontend rendering
      const slideDataJson = this.slideGenerator.generateSlideData(slideData);
      this.currentSlide = Buffer.from(JSON.stringify(slideDataJson), 'utf-8');
      
      // Also save as HTML file for debugging
      this.slideGenerator.saveSlide(slideData, `slide_${Date.now()}.html`);
      
      return slideDataJson;
    } catch (error) {
      console.error('Error generating slide:', error);
      return null;
    }
  }

  private getTopicContent(topic: string): string[] {
    const contentMap: Record<string, string[]> = {
      'What is HCV and why it exists': [
        'Federal housing assistance program',
        'Helps low-income families afford housing',
        'Provides housing stability',
        'Reduces homelessness'
      ],
      'Income limits and calculations': [
        'Based on Area Median Income (AMI)',
        'Typically 80% of AMI for eligibility',
        'Varies by family size and location',
        'Updated annually by HUD'
      ],
      'Family composition requirements': [
        'At least one family member must be elderly, disabled, or have children',
        'All household members must be listed',
        'Income of all members counts toward eligibility',
        'Changes in family size affect assistance'
      ],
      'Application process': [
        'Contact local Public Housing Agency (PHA)',
        'Complete application with required documents',
        'Join waiting list if eligible',
        'Wait for voucher availability'
      ]
    };

    return contentMap[topic] || [
      'Detailed information about this topic',
      'Key concepts and requirements',
      'Important considerations',
      'Next steps and actions'
    ];
  }

  private getChartDataForTopic(topic: string): any[] {
    if (topic.includes('income') || topic.includes('eligibility')) {
      return [
        { label: 'Family of 1', value: 35000 },
        { label: 'Family of 2', value: 40000 },
        { label: 'Family of 3', value: 45000 },
        { label: 'Family of 4', value: 50000 }
      ];
    }
    
    if (topic.includes('payment') || topic.includes('rent')) {
      return [
        { label: 'Tenant Portion', value: 30 },
        { label: 'HCV Assistance', value: 70 },
        { label: 'Total Rent', value: 100 }
      ];
    }

    return [
      { label: 'Category A', value: 40 },
      { label: 'Category B', value: 35 },
      { label: 'Category C', value: 25 }
    ];
  }

  private getProcessStepsForTopic(topic: string): string[] {
    if (topic.includes('application')) {
      return [
        'Contact PHA',
        'Submit Application',
        'Provide Documents',
        'Join Waiting List',
        'Receive Voucher'
      ];
    }
    
    if (topic.includes('voucher') || topic.includes('housing search')) {
      return [
        'Receive Voucher',
        'Find Housing',
        'Landlord Approval',
        'HQS Inspection',
        'Sign Lease'
      ];
    }

    return [
      'Step 1',
      'Step 2', 
      'Step 3',
      'Step 4'
    ];
  }

  // Method to get current slide for external use
  getCurrentSlide(): Buffer | null {
    return this.currentSlide;
  }
}

export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    proc.userData.vad = await silero.VAD.load();
  },
  entry: async (ctx: JobContext) => {
    // Set up a voice AI pipeline using OpenAI, Cartesia, AssemblyAI, and the LiveKit turn detector
    const session = new voice.AgentSession({
      // Speech-to-text (STT) is your agent's ears, turning the user's speech into text that the LLM can understand
      // See all available models at https://docs.livekit.io/agents/models/stt/
      stt: 'assemblyai/universal-streaming:en',

      // A Large Language Model (LLM) is your agent's brain, processing user input and generating a response
      // See all providers at https://docs.livekit.io/agents/models/llm/
      llm: 'openai/gpt-4.1-mini',

      // Text-to-speech (TTS) is your agent's voice, turning the LLM's text into speech that the user can hear
      // See all available models as well as voice selections at https://docs.livekit.io/agents/models/tts/
      tts: 'cartesia/sonic-2:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc',

      // VAD and turn detection are used to determine when the user is speaking and when the agent should respond
      // See more at https://docs.livekit.io/agents/build/turns
      turnDetection: new livekit.turnDetector.MultilingualModel(),
      vad: ctx.proc.userData.vad! as silero.VAD,
    });

    // Metrics collection, to measure pipeline performance
    // For more information, see https://docs.livekit.io/agents/build/metrics/
    const usageCollector = new metrics.UsageCollector();
    session.on(voice.AgentSessionEventTypes.MetricsCollected, (ev) => {
      metrics.logMetrics(ev.metrics);
      usageCollector.collect(ev.metrics);
    });

    const logUsage = async () => {
      const summary = usageCollector.getSummary();
      console.log(`Usage: ${JSON.stringify(summary)}`);
    };

    ctx.addShutdownCallback(logUsage);

    // Create assistant instance
    const assistant = new Assistant();
    
    // Set the current room for web interface communication
    console.log('Room context:', ctx.room);
    console.log('Room name:', ctx.room.name);
    console.log('Room SID:', ctx.room.sid);
    
    // Use room SID or name, fallback to default
    const roomIdentifier = ctx.room.name || ctx.room.sid || 'hcv-training-room';
    console.log('Setting room identifier:', roomIdentifier);
    assistant.setCurrentRoom(roomIdentifier);

    // Start the session, which initializes the voice pipeline and warms up the models
    await session.start({
      agent: assistant,
      room: ctx.room,
      inputOptions: {
        // LiveKit Cloud enhanced noise cancellation
        // - If self-hosting, omit this parameter
        // - For telephony applications, use `BackgroundVoiceCancellationTelephony` for best results
        noiseCancellation: BackgroundVoiceCancellation(),
      },
    });

    // Join the room and connect to the user
    await ctx.connect();

    // Send welcome message and automatically start the welcome lesson
    setTimeout(async () => {
      try {
        await session.say("Welcome to HCV Training! I'm your HCV learning assistant with visual slides. Let me start with our welcome lesson.", {
          allowInterruptions: true,
        });
        
        // Automatically start the welcome lesson with slides
        setTimeout(async () => {
          // Set up the welcome lesson
          assistant.currentLesson = 'welcome';
          assistant.lessonProgress = 0;
          
          // Generate and send the welcome slide
          await assistant.sendSlideUpdate('title', 'What is HCV and why it exists');
          
          // Continue with the lesson content
          await session.say("Let's begin with understanding what HCV is and why this program exists. HCV stands for Housing Choice Voucher, which is a federal program that helps low-income families afford decent, safe, and sanitary housing in the private market.", {
            allowInterruptions: true,
          });
          
          // Generate content slide for the first topic
          setTimeout(async () => {
            await assistant.sendSlideUpdate('content', 'What is HCV and why it exists');
            
            await session.say("The program was created to provide housing stability, reduce homelessness, and give families the freedom to choose where they want to live. As we go through each topic, I'll be showing you visual slides to help explain the concepts.", {
              allowInterruptions: true,
            });
          }, 3000);
          
        }, 2000);
      } catch (error) {
        console.error('Error sending welcome message:', error);
      }
    }, 1000);
  },
});

cli.runApp(new WorkerOptions({ agent: fileURLToPath(import.meta.url) }));
