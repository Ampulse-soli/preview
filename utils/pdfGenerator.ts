import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DocumentTemplate, DocumentVariable } from '../types/index';
import { getModernTemplate } from './modernTemplates';

export interface PDFGenerationOptions {
  template: DocumentTemplate;
  variables: Record<string, string>;
  filename?: string;
  format?: 'A4' | 'A3' | 'Letter';
  orientation?: 'portrait' | 'landscape';
}

export class PDFGenerator {
  private static formatPageSize(format: string, orientation: string): [number, number] {
    const sizes = {
      A4: [210, 297],
      A3: [297, 420],
      Letter: [216, 279]
    };
    
    const [width, height] = sizes[format as keyof typeof sizes] || sizes.A4;
    return orientation === 'landscape' ? [height, width] : [width, height];
  }

  private static replaceVariables(content: string, variables: Record<string, string>): string {
    let processedContent = content;
    
    // Remplacer toutes les variables {{variable}} par leurs valeurs
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedContent = processedContent.replace(regex, value || '');
    });

    // Remplacer la date actuelle si présente
    const currentDate = new Date().toLocaleDateString('fr-FR');
    processedContent = processedContent.replace(/{{DATE_ACTUELLE}}/g, currentDate);
    processedContent = processedContent.replace(/{{date_generation}}/g, currentDate);

    return processedContent;
  }

  private static formatContentForPDF(content: string): string {
    // Convertir le contenu en HTML formaté pour le PDF
    const lines = content.split('\n');
    let htmlContent = '<div style="font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; padding: 20px;">';
    
    lines.forEach(line => {
      line = line.trim();
      if (!line) {
        htmlContent += '<br>';
      } else if (line.startsWith('EN-TÊTE EXPÉDITEUR:')) {
        htmlContent += '<h3 style="color: #f97316; font-size: 16px; margin-top: 20px; margin-bottom: 10px;">EN-TÊTE EXPÉDITEUR</h3>';
      } else if (line.startsWith('STRUCTURE DU DOCUMENT:')) {
        htmlContent += '<h3 style="color: #f97316; font-size: 16px; margin-top: 20px; margin-bottom: 10px;">STRUCTURE DU DOCUMENT</h3>';
      } else if (line.startsWith('INFORMATIONS DESTINATAIRE:')) {
        htmlContent += '<h3 style="color: #f97316; font-size: 16px; margin-top: 20px; margin-bottom: 10px;">INFORMATIONS DESTINATAIRE</h3>';
      } else if (line.startsWith('DÉTAILS DE LA')) {
        htmlContent += '<h3 style="color: #f97316; font-size: 16px; margin-top: 20px; margin-bottom: 10px;">' + line + '</h3>';
      } else if (line.startsWith('OCCUPANTS:')) {
        htmlContent += '<h3 style="color: #f97316; font-size: 16px; margin-top: 20px; margin-bottom: 10px;">OCCUPANTS</h3>';
      } else if (line.startsWith('INSTRUCTION DE LIBÉRATION:')) {
        htmlContent += '<h3 style="color: #f97316; font-size: 16px; margin-top: 20px; margin-bottom: 10px;">INSTRUCTION DE LIBÉRATION</h3>';
      } else if (line.startsWith('INFORMATIONS COMPLÉMENTAIRES:')) {
        htmlContent += '<h3 style="color: #f97316; font-size: 16px; margin-top: 20px; margin-bottom: 10px;">INFORMATIONS COMPLÉMENTAIRES</h3>';
      } else if (line.startsWith('INFORMATIONS FINANCIÈRES:')) {
        htmlContent += '<h3 style="color: #f97316; font-size: 16px; margin-top: 20px; margin-bottom: 10px;">INFORMATIONS FINANCIÈRES</h3>';
      } else if (line.startsWith('MISE EN FORME:')) {
        htmlContent += '<h3 style="color: #f97316; font-size: 16px; margin-top: 20px; margin-bottom: 10px;">MISE EN FORME</h3>';
      } else if (line.includes(':')) {
        const [label, value] = line.split(':');
        htmlContent += `<p><strong>${label}:</strong> ${value}</p>`;
      } else {
        htmlContent += `<p>${line}</p>`;
      }
    });
    
    htmlContent += '</div>';
    return htmlContent;
  }

  static async generatePDF(options: PDFGenerationOptions): Promise<Blob> {
    const { template, variables, filename = 'document.pdf', format = 'A4', orientation = 'portrait' } = options;
    
    // Vérifier s'il existe un template moderne pour ce type
    const modernTemplate = getModernTemplate(template.type);
    
    let htmlContent: string;
    
    if (modernTemplate) {
      // Utiliser le template moderne
      htmlContent = this.replaceVariables(modernTemplate, variables);
    } else {
      // Utiliser l'ancien format
      const processedContent = this.replaceVariables(template.contenu, variables);
      htmlContent = this.formatContentForPDF(processedContent);
    }
    
    // Créer un élément temporaire pour le rendu
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '800px';
    tempDiv.style.backgroundColor = 'white';
    document.body.appendChild(tempDiv);

    try {
      // Convertir en canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Créer le PDF
      const [width, height] = this.formatPageSize(format, orientation);
      const pdf = new jsPDF({
        orientation: orientation as 'portrait' | 'landscape',
        unit: 'mm',
        format: format as 'a4' | 'a3' | 'letter'
      });

      // Ajouter l'en-tête si défini
      if (template.enTete) {
        const enTete = this.replaceVariables(template.enTete, variables);
        pdf.setFontSize(14);
        pdf.setTextColor(249, 115, 22); // Orange
        pdf.text(enTete, 20, 20);
        pdf.setDrawColor(249, 115, 22);
        pdf.line(20, 25, width - 20, 25);
      }

      // Ajouter le contenu principal
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = width - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 20, template.enTete ? 35 : 20, imgWidth, imgHeight);

      // Ajouter le pied de page si défini
      if (template.piedDePage) {
        const piedDePage = this.replaceVariables(template.piedDePage, variables);
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(piedDePage, 20, height - 10);
      }

      // Générer le blob
      const pdfBlob = pdf.output('blob');
      
      return pdfBlob;
    } finally {
      // Nettoyer l'élément temporaire
      document.body.removeChild(tempDiv);
    }
  }

  static async downloadPDF(options: PDFGenerationOptions): Promise<void> {
    try {
      const blob = await this.generatePDF(options);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = options.filename || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      throw error;
    }
  }

  static async previewPDF(options: PDFGenerationOptions): Promise<string> {
    try {
      const blob = await this.generatePDF(options);
      const url = URL.createObjectURL(blob);
      return url;
    } catch (error) {
      console.error('Erreur lors de la prévisualisation du PDF:', error);
      throw error;
    }
  }
}

// Fonction utilitaire pour valider les variables requises
export function validateRequiredVariables(template: DocumentTemplate, variables: Record<string, string>): string[] {
  const missingVariables: string[] = [];
  
  template.variables.forEach(variable => {
    if (variable.obligatoire && (!variables[variable.nom] || variables[variable.nom].trim() === '')) {
      missingVariables.push(variable.nom);
    }
  });
  
  return missingVariables;
}

// Fonction utilitaire pour obtenir les exemples de variables
export function getVariableExamples(template: DocumentTemplate): Record<string, string> {
  const examples: Record<string, string> = {};
  
  template.variables.forEach(variable => {
    if (variable.exemple) {
      examples[variable.nom] = variable.exemple;
    }
  });
  
  return examples;
} 