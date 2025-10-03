import fs from 'fs';
import path from 'path';

export interface SlideData {
  title: string;
  content: string[];
  type: 'title' | 'content' | 'chart' | 'process';
  chartData?: any;
  processSteps?: string[];
}

export class SlideGenerator {
  private width = 1920;
  private height = 1080;

  constructor() {
    // Ensure slides directory exists
    const slidesDir = path.join(process.cwd(), 'slides');
    if (!fs.existsSync(slidesDir)) {
      fs.mkdirSync(slidesDir, { recursive: true });
    }
  }

  generateSlide(slideData: SlideData): Buffer {
    // For now, we'll create HTML-based slides that can be rendered in the browser
    // This avoids native compilation issues while still providing visual content
    const html = this.generateSlideHTML(slideData);
    return Buffer.from(html, 'utf-8');
  }

  private generateSlideHTML(slideData: SlideData): string {
    const backgroundColor = '#ffffff';
    const primaryColor = '#2c5aa0';
    const secondaryColor = '#666666';
    const accentColor = '#FFD700';

    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: ${backgroundColor};
                width: ${this.width}px;
                height: ${this.height}px;
                overflow: hidden;
            }
            .slide-container {
                width: 100%;
                height: 100%;
                position: relative;
                display: flex;
                flex-direction: column;
            }
            .header {
                background: ${primaryColor};
                color: white;
                padding: 20px 40px;
                font-size: 32px;
                font-weight: bold;
                display: flex;
                align-items: center;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .content {
                flex: 1;
                padding: 40px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
            .slide-title {
                color: ${primaryColor};
                font-size: 72px;
                font-weight: bold;
                text-align: center;
                margin-bottom: 40px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            }
            .slide-subtitle {
                color: ${secondaryColor};
                font-size: 36px;
                text-align: center;
                margin-bottom: 60px;
            }
            .bullet-list {
                list-style: none;
                padding: 0;
                margin: 0;
                width: 100%;
                max-width: 800px;
            }
            .bullet-item {
                font-size: 32px;
                color: #333333;
                margin: 20px 0;
                padding-left: 40px;
                position: relative;
                line-height: 1.4;
            }
            .bullet-item::before {
                content: "•";
                color: ${primaryColor};
                font-weight: bold;
                font-size: 40px;
                position: absolute;
                left: 0;
                top: 0;
            }
            .chart-container {
                width: 100%;
                max-width: 800px;
                height: 400px;
                background: #f8f9fa;
                border: 2px solid #dee2e6;
                border-radius: 10px;
                padding: 20px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
            .chart-title {
                font-size: 24px;
                font-weight: bold;
                color: #333;
                margin-bottom: 20px;
            }
            .chart-bars {
                display: flex;
                align-items: end;
                height: 200px;
                width: 100%;
                gap: 20px;
            }
            .chart-bar {
                background: ${primaryColor};
                border-radius: 4px 4px 0 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-end;
                min-width: 80px;
                position: relative;
            }
            .bar-value {
                color: #333;
                font-weight: bold;
                font-size: 16px;
                margin-bottom: 5px;
            }
            .bar-label {
                color: #333;
                font-size: 14px;
                margin-top: 10px;
                text-align: center;
            }
            .process-steps {
                display: flex;
                justify-content: center;
                align-items: center;
                flex-wrap: wrap;
                gap: 30px;
                width: 100%;
                max-width: 1000px;
            }
            .process-step {
                background: #e3f2fd;
                border: 3px solid ${primaryColor};
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                min-width: 150px;
                position: relative;
            }
            .step-number {
                background: ${primaryColor};
                color: white;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .step-text {
                color: #333;
                font-size: 16px;
                line-height: 1.3;
            }
            .step-arrow {
                color: ${primaryColor};
                font-weight: bold;
                font-size: 24px;
                position: absolute;
                right: -20px;
                top: 50%;
                transform: translateY(-50%);
            }
        </style>
    </head>
    <body>
        <div class="slide-container">
            <div class="header">
                HCV Training System
            </div>
            <div class="content">
    `;

    switch (slideData.type) {
      case 'title':
        html += `
            <div class="slide-title">${slideData.title}</div>
            <div class="slide-subtitle">Housing Choice Voucher Program</div>
            <ul class="bullet-list">
        `;
        slideData.content.forEach(item => {
          html += `<li class="bullet-item">${item}</li>`;
        });
        html += `</ul>`;
        break;

      case 'content':
        html += `
            <div class="slide-title" style="font-size: 48px; margin-bottom: 60px;">${slideData.title}</div>
            <ul class="bullet-list">
        `;
        slideData.content.forEach(item => {
          html += `<li class="bullet-item">${item}</li>`;
        });
        html += `</ul>`;
        break;

      case 'chart':
        html += `
            <div class="slide-title" style="font-size: 48px; margin-bottom: 40px;">${slideData.title}</div>
            <div class="chart-container">
                <div class="chart-title">Data Visualization</div>
                <div class="chart-bars">
        `;
        if (slideData.chartData) {
          const maxValue = Math.max(...slideData.chartData.map((d: any) => d.value));
          slideData.chartData.forEach((item: any) => {
            const height = (item.value / maxValue) * 100;
            html += `
                <div class="chart-bar" style="height: ${height}%;">
                    <div class="bar-value">$${item.value.toLocaleString()}</div>
                    <div class="bar-label">${item.label}</div>
                </div>
            `;
          });
        }
        html += `
                </div>
            </div>
        `;
        break;

      case 'process':
        html += `
            <div class="slide-title" style="font-size: 48px; margin-bottom: 40px;">${slideData.title}</div>
            <div class="process-steps">
        `;
        if (slideData.processSteps) {
          slideData.processSteps.forEach((step, index) => {
            html += `
                <div class="process-step">
                    <div class="step-number">${index + 1}</div>
                    <div class="step-text">${step}</div>
                    ${index < slideData.processSteps!.length - 1 ? '<div class="step-arrow">→</div>' : ''}
                </div>
            `;
          });
        }
        html += `</div>`;
        break;
    }

    html += `
            </div>
        </div>
    </body>
    </html>
    `;

    return html;
  }

  // Save slide to file (for debugging)
  saveSlide(slideData: SlideData, filename: string): void {
    const html = this.generateSlideHTML(slideData);
    const filepath = path.join(process.cwd(), 'slides', filename);
    fs.writeFileSync(filepath, html);
  }

  // Generate slide data as JSON for frontend rendering
  generateSlideData(slideData: SlideData): any {
    return {
      type: slideData.type,
      title: slideData.title,
      content: slideData.content,
      chartData: slideData.chartData,
      processSteps: slideData.processSteps,
      timestamp: Date.now()
    };
  }
}