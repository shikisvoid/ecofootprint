import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EnvironmentalReport } from './environmentalReportsService';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

class PDFGenerationService {
  // Generate PDF report
  generateReportPDF(report: EnvironmentalReport): void {
    try {
      console.log('📄 Generating PDF report:', report.title);

      // Validate report data
      if (!report || !report.title) {
        throw new Error('Invalid report data provided');
      }

      // Validate required fields
      if (typeof report.totalEmissions !== 'number') {
        report.totalEmissions = 0;
      }
      if (typeof report.reduction !== 'number') {
        report.reduction = 0;
      }
      if (typeof report.greenPoints !== 'number') {
        report.greenPoints = 0;
      }
      if (!report.status) {
        report.status = 'completed';
      }
      if (!report.emissionsByCategory) {
        report.emissionsByCategory = {
          transport: 0,
          energy: 0,
          food: 0,
          waste: 0,
          water: 0,
          shopping: 0
        };
      }
      if (!Array.isArray(report.insights)) {
        report.insights = [];
      }
      if (!Array.isArray(report.recommendations)) {
        report.recommendations = [];
      }
      if (!Array.isArray(report.achievements)) {
        report.achievements = [];
      }

      // Create new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let yPosition = 20;

      try {
        // Add header with logo and title
        this.addHeader(doc, report, yPosition);
        yPosition += 40;

        // Add report summary
        yPosition = this.addReportSummary(doc, report, yPosition);
        yPosition += 10;

        // Add carbon footprint section
        yPosition = this.addCarbonFootprintSection(doc, report, yPosition);
        yPosition += 10;

        // Add environmental conditions
        yPosition = this.addEnvironmentalConditions(doc, report, yPosition);
        yPosition += 10;

        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 20;
        }

        // Add insights section
        yPosition = this.addInsightsSection(doc, report, yPosition);
        yPosition += 10;

        // Add recommendations section
        yPosition = this.addRecommendationsSection(doc, report, yPosition);
        yPosition += 10;

        // Add achievements section
        yPosition = this.addAchievementsSection(doc, report, yPosition);

        // Add footer
        this.addFooter(doc, report);

        // Save the PDF
        const fileName = `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);

        console.log('✅ PDF report generated successfully:', fileName);
      } catch (sectionError) {
        console.error('❌ Error generating PDF section:', sectionError);
        throw new Error(`Failed to generate PDF section: ${(sectionError as Error).message}`);
      }
    } catch (error) {
      console.error('❌ Error generating PDF report:', error);
      throw new Error(`PDF generation failed: ${(error as Error).message}`);
    }
  }

  // Add header section
  private addHeader(doc: jsPDF, report: EnvironmentalReport, yPosition: number): void {
    try {
      const pageWidth = doc.internal.pageSize.width;

      // Add title
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(34, 139, 34); // Forest green
      doc.text(report.title || 'Environmental Report', pageWidth / 2, yPosition, { align: 'center' });

      // Add subtitle
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on ${new Date(report.generatedDate || new Date()).toLocaleDateString()}`, pageWidth / 2, yPosition + 8, { align: 'center' });
      doc.text(`Period: ${report.period || 'N/A'}`, pageWidth / 2, yPosition + 16, { align: 'center' });

      // Add eco-friendly badge
      doc.setFillColor(34, 139, 34);
      doc.roundedRect(pageWidth - 60, yPosition - 10, 50, 20, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('ECO REPORT', pageWidth - 35, yPosition + 2, { align: 'center' });

      // Reset text color
      doc.setTextColor(0, 0, 0);
    } catch (error) {
      console.error('Error adding PDF header:', error);
      // Continue with basic header
      doc.setFontSize(16);
      doc.text('Environmental Report', 20, yPosition);
    }
  }

  // Add report summary section
  private addReportSummary(doc: jsPDF, report: EnvironmentalReport, yPosition: number): number {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 51, 51);
    doc.text('📊 Report Summary', 20, yPosition);
    yPosition += 10;

    // Create summary table
    const summaryData = [
      ['Total Emissions', `${report.totalEmissions.toFixed(2)} kg CO₂`],
      ['Emission Reduction', `${report.reduction.toFixed(1)}%`],
      ['Green Points Earned', `${report.greenPoints} points`],
      ['Report Status', report.status.toUpperCase()]
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [34, 139, 34], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
      margin: { left: 20, right: 20 }
    });

    return (doc as any).lastAutoTable.finalY + 10;
  }

  // Add carbon footprint breakdown section
  private addCarbonFootprintSection(doc: jsPDF, report: EnvironmentalReport, yPosition: number): number {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 51, 51);
    doc.text('🌱 Carbon Footprint Breakdown', 20, yPosition);
    yPosition += 10;

    // Create emissions breakdown table
    const emissionsData = Object.entries(report.emissionsByCategory).map(([category, value]) => [
      category.charAt(0).toUpperCase() + category.slice(1),
      `${value.toFixed(2)} kg CO₂`,
      `${((value / report.totalEmissions) * 100).toFixed(1)}%`
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Category', 'Emissions', 'Percentage']],
      body: emissionsData,
      theme: 'striped',
      headStyles: { fillColor: [52, 152, 219], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
      margin: { left: 20, right: 20 }
    });

    return (doc as any).lastAutoTable.finalY + 10;
  }

  // Add environmental conditions section
  private addEnvironmentalConditions(doc: jsPDF, report: EnvironmentalReport, yPosition: number): number {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 51, 51);
    doc.text('🌍 Environmental Conditions', 20, yPosition);
    yPosition += 10;

    const environmentalData = [
      ['Air Quality Index', `${report.airQuality?.aqi || 'N/A'}`],
      ['Air Quality Status', report.airQuality?.status || 'N/A'],
      ['Location', report.airQuality?.location || 'N/A'],
      ['Temperature', `${report.weather?.temperature || 'N/A'}°C`],
      ['Weather Condition', report.weather?.condition || 'N/A'],
      ['Humidity', `${report.weather?.humidity || 'N/A'}%`],
      ['Carbon Intensity', `${report.carbonIntensity?.intensity || 'N/A'} gCO₂/kWh`],
      ['Grid Region', report.carbonIntensity?.region || 'N/A']
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Environmental Factor', 'Value']],
      body: environmentalData,
      theme: 'grid',
      headStyles: { fillColor: [155, 89, 182], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
      margin: { left: 20, right: 20 }
    });

    return (doc as any).lastAutoTable.finalY + 10;
  }

  // Add insights section
  private addInsightsSection(doc: jsPDF, report: EnvironmentalReport, yPosition: number): number {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 51, 51);
    doc.text('💡 Key Insights', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    report.insights.forEach((insight, index) => {
      const lines = doc.splitTextToSize(`${index + 1}. ${insight}`, 170);
      doc.text(lines, 20, yPosition);
      yPosition += lines.length * 5 + 3;
    });

    return yPosition;
  }

  // Add recommendations section
  private addRecommendationsSection(doc: jsPDF, report: EnvironmentalReport, yPosition: number): number {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 51, 51);
    doc.text('🎯 Recommendations', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    report.recommendations.forEach((recommendation, index) => {
      const lines = doc.splitTextToSize(`${index + 1}. ${recommendation}`, 170);
      doc.text(lines, 20, yPosition);
      yPosition += lines.length * 5 + 3;
    });

    return yPosition;
  }

  // Add achievements section
  private addAchievementsSection(doc: jsPDF, report: EnvironmentalReport, yPosition: number): number {
    if (report.achievements.length === 0) return yPosition;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 51, 51);
    doc.text('🏆 Achievements', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    report.achievements.forEach((achievement, index) => {
      const lines = doc.splitTextToSize(`${index + 1}. ${achievement}`, 170);
      doc.text(lines, 20, yPosition);
      yPosition += lines.length * 5 + 3;
    });

    return yPosition;
  }

  // Add footer
  private addFooter(doc: jsPDF, report: EnvironmentalReport): void {
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;

    // Add footer line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, pageHeight - 30, pageWidth - 20, pageHeight - 30);

    // Add footer text
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Generated by Eco Footprint Guardian', 20, pageHeight - 20);
    doc.text(`Report ID: ${report.id}`, 20, pageHeight - 15);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 20, pageHeight - 20, { align: 'right' });
    doc.text('🌱 Protecting our planet, one report at a time', pageWidth - 20, pageHeight - 15, { align: 'right' });
  }

  // Generate chart as image (placeholder for future implementation)
  private addChart(doc: jsPDF, chartData: any, yPosition: number): number {
    // This would integrate with a charting library to generate chart images
    // For now, we'll add a placeholder
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150, 150, 150);
    doc.text('[Chart visualization would appear here]', 20, yPosition);
    return yPosition + 20;
  }
}

export const pdfGenerationService = new PDFGenerationService();
