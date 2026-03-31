package org.example.formation_service.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class InvoiceService {
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final double TVA_RATE = 0.19; // 19% TVA in Tunisia
    
    /**
     * Generate PDF invoice for subscription payment
     */
    public byte[] generateInvoice(
            String invoiceNumber,
            String customerEmail,
            String planName,
            double priceHT,
            String maskedCard,
            String transactionId,
            LocalDateTime paymentDate
    ) {
        try {
            log.info("📄 Generating invoice: {}", invoiceNumber);
            
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);
            
            // Colors
            DeviceRgb primaryColor = new DeviceRgb(102, 126, 234); // #667eea
            DeviceRgb darkColor = new DeviceRgb(45, 55, 72); // #2d3748
            
            // Header - Company Info
            Paragraph header = new Paragraph("SkillSphere")
                    .setFontSize(24)
                    .setBold()
                    .setFontColor(primaryColor)
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(header);
            
            Paragraph subHeader = new Paragraph("Plateforme d'apprentissage en ligne")
                    .setFontSize(10)
                    .setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(5);
            document.add(subHeader);
            
            Paragraph companyInfo = new Paragraph("Tunis, Tunisie | support@skillsphere.tn | +216 26 51 21 08")
                    .setFontSize(9)
                    .setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20);
            document.add(companyInfo);
            
            // Invoice Title
            Paragraph invoiceTitle = new Paragraph("FACTURE")
                    .setFontSize(20)
                    .setBold()
                    .setFontColor(darkColor)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20);
            document.add(invoiceTitle);
            
            // Invoice Details Table
            Table infoTable = new Table(2);
            infoTable.setWidth(UnitValue.createPercentValue(100));
            
            // Left column - Invoice info
            infoTable.addCell(createInfoCell("Numéro de facture:", invoiceNumber, true));
            infoTable.addCell(createInfoCell("Client:", customerEmail, false));
            infoTable.addCell(createInfoCell("Date d'émission:", paymentDate.format(DATE_FORMATTER), true));
            infoTable.addCell(createInfoCell("Transaction ID:", transactionId, false));
            
            document.add(infoTable);
            document.add(new Paragraph("\n"));
            
            // Items Table
            Table itemsTable = new Table(new float[]{3, 1, 1, 1});
            itemsTable.setWidth(UnitValue.createPercentValue(100));
            
            // Table Header
            itemsTable.addHeaderCell(createHeaderCell("Description"));
            itemsTable.addHeaderCell(createHeaderCell("Prix HT"));
            itemsTable.addHeaderCell(createHeaderCell("TVA (19%)"));
            itemsTable.addHeaderCell(createHeaderCell("Total TTC"));
            
            // Calculate amounts
            double tva = priceHT * TVA_RATE;
            double totalTTC = priceHT + tva;
            
            // Table Row
            itemsTable.addCell(createCell("Abonnement " + planName + " - Mensuel"));
            itemsTable.addCell(createCell(String.format("%.3f DT", priceHT)));
            itemsTable.addCell(createCell(String.format("%.3f DT", tva)));
            itemsTable.addCell(createCell(String.format("%.3f DT", totalTTC)));
            
            document.add(itemsTable);
            document.add(new Paragraph("\n"));
            
            // Total Summary
            Table totalTable = new Table(2);
            totalTable.setWidth(UnitValue.createPercentValue(50));
            totalTable.setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.RIGHT);
            
            totalTable.addCell(createTotalLabelCell("Sous-total HT:"));
            totalTable.addCell(createTotalValueCell(String.format("%.3f DT", priceHT)));
            
            totalTable.addCell(createTotalLabelCell("TVA (19%):"));
            totalTable.addCell(createTotalValueCell(String.format("%.3f DT", tva)));
            
            totalTable.addCell(createTotalLabelCell("Total TTC:").setBold().setFontSize(12));
            totalTable.addCell(createTotalValueCell(String.format("%.3f DT", totalTTC)).setBold().setFontSize(12).setFontColor(primaryColor));
            
            document.add(totalTable);
            document.add(new Paragraph("\n"));
            
            // Payment Info
            Paragraph paymentInfo = new Paragraph("Informations de paiement")
                    .setFontSize(12)
                    .setBold()
                    .setMarginBottom(10);
            document.add(paymentInfo);
            
            Paragraph paymentDetails = new Paragraph()
                    .add("Méthode: Carte bancaire (" + (maskedCard != null ? maskedCard : "****") + ")\n")
                    .add("Statut: Payé\n")
                    .add("Date: " + paymentDate.format(DATETIME_FORMATTER))
                    .setFontSize(10)
                    .setMarginBottom(20);
            document.add(paymentDetails);
            
            // Footer
            Paragraph footer = new Paragraph("Merci pour votre confiance!")
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(ColorConstants.GRAY)
                    .setMarginTop(30);
            document.add(footer);
            
            Paragraph legalFooter = new Paragraph("Cette facture est générée automatiquement et ne nécessite pas de signature.")
                    .setFontSize(8)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(ColorConstants.LIGHT_GRAY);
            document.add(legalFooter);
            
            document.close();
            
            byte[] pdfBytes = baos.toByteArray();
            log.info("✅ Invoice generated successfully: {} bytes", pdfBytes.length);
            
            return pdfBytes;
            
        } catch (Exception e) {
            log.error("❌ Failed to generate invoice: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate invoice", e);
        }
    }
    
    private Cell createHeaderCell(String text) {
        return new Cell()
                .add(new Paragraph(text).setBold())
                .setBackgroundColor(new DeviceRgb(102, 126, 234))
                .setFontColor(ColorConstants.WHITE)
                .setTextAlignment(TextAlignment.CENTER)
                .setPadding(8);
    }
    
    private Cell createCell(String text) {
        return new Cell()
                .add(new Paragraph(text))
                .setTextAlignment(TextAlignment.CENTER)
                .setPadding(8);
    }
    
    private Cell createInfoCell(String label, String value, boolean isLeft) {
        Paragraph p = new Paragraph()
                .add(new Paragraph(label).setBold().setFontSize(10))
                .add("\n")
                .add(new Paragraph(value).setFontSize(10));
        
        return new Cell()
                .add(p)
                .setBorder(null)
                .setPadding(5);
    }
    
    private Cell createTotalLabelCell(String text) {
        return new Cell()
                .add(new Paragraph(text))
                .setTextAlignment(TextAlignment.RIGHT)
                .setBorder(null)
                .setPadding(5);
    }
    
    private Cell createTotalValueCell(String text) {
        return new Cell()
                .add(new Paragraph(text))
                .setTextAlignment(TextAlignment.RIGHT)
                .setBorder(null)
                .setPadding(5);
    }
    
    /**
     * Generate invoice number based on date and payment ID
     */
    public String generateInvoiceNumber(Long paymentId) {
        String year = String.valueOf(LocalDateTime.now().getYear());
        String paddedId = String.format("%05d", paymentId);
        return "INV-" + year + "-" + paddedId;
    }
}
