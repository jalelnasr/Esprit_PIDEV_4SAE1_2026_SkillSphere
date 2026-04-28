import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ExportService {

  /**
   * Export data to Excel (.xlsx)
   * @param data Array of objects
   * @param fileName File name without extension
   * @param sheetName Sheet name
   */
  async exportToExcel(data: any[], fileName: string, sheetName = 'Sheet1'): Promise<void> {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(data);

    // Auto column widths
    const colWidths = Object.keys(data[0] || {}).map(key => {
      const maxLen = Math.max(
        key.length,
        ...data.map(row => String(row[key] || '').length)
      );
      return { wch: Math.min(maxLen + 2, 40) };
    });
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  /**
   * Export data to PDF with a professional table layout
   * @param columns Column headers
   * @param rows 2D array of row data
   * @param fileName File name without extension
   * @param title Document title
   */
  async exportToPdf(
    columns: string[],
    rows: (string | number)[][],
    fileName: string,
    title: string
  ): Promise<void> {
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
    const autoTableModule = await import('jspdf-autotable');

    const doc = new jsPDF('l', 'mm', 'a4'); // landscape

    // Title
    doc.setFontSize(18);
    doc.setTextColor(99, 102, 241); // indigo
    doc.text(title, 14, 20);

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 28);

    // Table
    (autoTableModule as any).default(doc, {
      head: [columns],
      body: rows,
      startY: 34,
      theme: 'grid',
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [15, 23, 42]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { top: 34 },
      styles: {
        cellPadding: 4,
        lineColor: [226, 232, 240],
        lineWidth: 0.1
      }
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `SkillSphere B2B Corporate — Page ${i}/${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'center' }
      );
    }

    doc.save(`${fileName}.pdf`);
  }

  /**
   * Export data to CSV
   */
  exportToCsv(data: any[], fileName: string): void {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(h => {
          const val = String(row[h] ?? '');
          return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
        }).join(',')
      )
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
