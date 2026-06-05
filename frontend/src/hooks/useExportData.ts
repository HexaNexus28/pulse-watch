export const useExportData = () => {
  const exportToCSV = (data: any[], filename: string) => {
    // Convert data to CSV
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle values that contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = (data: any[], filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = (data: any[], filename: string) => {
    // For now, just export as JSON with .pdf extension
    // In a real implementation, you would use a library like jsPDF
    console.log('PDF export not implemented yet, falling back to JSON');
    exportToJSON(data, filename);
  };

  const exportToMarkdown = (data: any[], filename: string) => {
    // Convert data to Markdown table
    const headers = Object.keys(data[0] || {});
    const markdownContent = [
      `# ${filename}`,
      '',
      '| ' + headers.join(' | ') + ' |',
      '|' + headers.map(() => '---').join('|') + '|',
      ...data.map(row => 
        '| ' + headers.map(header => {
          const value = row[header];
          return String(value || '');
        }).join(' | ') + ' |'
      )
    ].join('\n');

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.md`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    exportToCSV,
    exportToJSON,
    exportToPDF,
    exportToMarkdown
  };
};
