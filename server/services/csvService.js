export function exportStudentsToCSV(students) {
  const headers = [
    'Name',
    'Email',
    'Phone',
    'Codeforces Handle',
    'Current Rating',
    'Max Rating',
    'Last Updated',
    'Email Notifications',
    'Reminders Sent',
    'Last Submission Date'
  ];

  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    return `"${str.replace(/"/g, '""')}"`; // Escape double quotes
  };

  const rows = students.map(student => [
    student.name,
    student.email,
    student.phone,
    student.codeforcesHandle,
    student.currentRating,
    student.maxRating,
    student.lastUpdated ? student.lastUpdated.toISOString().split('T')[0] : '',
    student.emailNotifications ? 'Yes' : 'No',
    student.remindersSent,
    student.lastSubmissionDate ? student.lastSubmissionDate.toISOString().split('T')[0] : ''
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(escapeCSV).join(','))
    .join('\r\n'); // Use CRLF for compatibility

  return csvContent;
}
