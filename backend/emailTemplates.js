/**
 * Generate HTML email template for issue status update
 */
const getStatusUpdateEmailTemplate = ({
  studentName,
  issueTitle,
  issueCategory,
  oldStatus,
  newStatus,
  remark,
  adminName,
}) => {
  const statusColors = {
    Open: '#3B82F6', // Blue
    'In Progress': '#F59E0B', // Orange
    Resolved: '#10B981', // Green
  };

  const statusColor = statusColors[newStatus] || '#6B7280';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content {
          padding: 30px;
        }
        .greeting {
          font-size: 16px;
          margin-bottom: 20px;
        }
        .issue-card {
          background-color: #f9fafb;
          border-left: 4px solid ${statusColor};
          padding: 20px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .issue-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 10px;
        }
        .issue-detail {
          display: flex;
          justify-content: space-between;
          margin: 8px 0;
          font-size: 14px;
        }
        .label {
          color: #6b7280;
          font-weight: 500;
        }
        .value {
          color: #1f2937;
          font-weight: 600;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          color: #ffffff;
          background-color: ${statusColor};
        }
        .remark-section {
          margin-top: 20px;
          padding: 15px;
          background-color: #eff6ff;
          border-radius: 4px;
          border-left: 3px solid #3b82f6;
        }
        .remark-title {
          font-size: 14px;
          font-weight: 600;
          color: #1e40af;
          margin-bottom: 8px;
        }
        .remark-text {
          font-size: 14px;
          color: #1f2937;
          line-height: 1.5;
        }
        .footer {
          background-color: #f9fafb;
          padding: 20px 30px;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔧 Campus FixIt</h1>
        </div>
        
        <div class="content">
          <p class="greeting">Hi ${studentName},</p>
          
          <p>Your reported issue has been updated by our admin team.</p>
          
          <div class="issue-card">
            <div class="issue-title">${issueTitle}</div>
            
            <div class="issue-detail">
              <span class="label">Category:</span>
              <span class="value">${issueCategory}</span>
            </div>
            
            <div class="issue-detail">
              <span class="label">Status:</span>
              <span class="status-badge">${newStatus}</span>
            </div>
            
            ${
              oldStatus && oldStatus !== newStatus
                ? `
            <div class="issue-detail">
              <span class="label">Previous Status:</span>
              <span class="value">${oldStatus}</span>
            </div>
            `
                : ''
            }
            
            ${
              adminName
                ? `
            <div class="issue-detail">
              <span class="label">Updated By:</span>
              <span class="value">${adminName}</span>
            </div>
            `
                : ''
            }
            
            ${
              remark
                ? `
            <div class="remark-section">
              <div class="remark-title">📝 Admin Remark:</div>
              <div class="remark-text">${remark}</div>
            </div>
            `
                : ''
            }
          </div>
          
          <p>Thank you for using Campus FixIt. We're working hard to resolve your issue!</p>
        </div>
        
        <div class="footer">
          <p><strong>Campus FixIt</strong></p>
          <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  getStatusUpdateEmailTemplate,
};
