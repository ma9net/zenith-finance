export class CsvEngine {
  /**
   * Converts an array of objects into a downloadable CSV file.
   * Hardened for Zenith Auditor standards.
   */
  static export(data: any[], fileName: string): void {
    if (!data || !data.length) {
      console.warn('CsvEngine: No data provided for export.');
      return;
    }

    // Extract headers
    const headers = Object.keys(data[0]);

    // Build rows with quote-wrapping for security
    const csvRows = data.map((row) =>
      headers
        .map((header) => {
          const value = row[header] ?? '';
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(','),
    );

    // Combine and create Blob
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Trigger Download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log(`✅ Zenith Vault: ${fileName} exported successfully.`);
  }
}
