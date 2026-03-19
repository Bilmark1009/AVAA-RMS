<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appeal Submitted Notification</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f3f4f6;
            margin: 0;
            padding: 20px;
        }

        .container {
            max-width: 560px;
            margin: 0 auto;
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 4px rgba(0, 0, 0, .08);
        }

        .header {
            background: linear-gradient(135deg, #f59e0b, #f97316);
            padding: 28px 32px;
        }

        .header h1 {
            color: #fff;
            font-size: 20px;
            margin: 0;
        }

        .header p {
            color: #fed7aa;
            font-size: 13px;
            margin: 6px 0 0 0;
        }

        .body {
            padding: 28px 32px;
            color: #374151;
            font-size: 15px;
            line-height: 1.7;
        }

        .info-box {
            background: #f3f4f6;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px 20px;
            margin: 20px 0;
            color: #4b5563;
            font-size: 14px;
            line-height: 1.6;
        }

        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }

        .info-row:last-child {
            border-bottom: none;
        }

        .info-label {
            font-weight: 600;
            color: #6b7280;
        }

        .info-value {
            color: #1f2937;
            font-weight: 500;
        }

        .appeal-box {
            background: #fef3c7;
            border: 1px solid #fcd34d;
            border-radius: 8px;
            padding: 16px 20px;
            margin: 20px 0;
            color: #78350f;
        }

        .appeal-header {
            font-weight: 600;
            color: #92400e;
            margin-bottom: 8px;
        }

        .appeal-message {
            white-space: pre-wrap;
            word-wrap: break-word;
            font-size: 13px;
            line-height: 1.6;
            background: #fffbeb;
            padding: 12px;
            border-left: 3px solid #f59e0b;
            border-radius: 4px;
            margin-top: 8px;
        }

        .action-box {
            background: #dbeafe;
            border: 1px solid #93c5fd;
            border-radius: 8px;
            padding: 16px 20px;
            margin: 20px 0;
            color: #1e40af;
            font-size: 14px;
            line-height: 1.6;
        }

        .footer {
            padding: 20px 32px;
            background: #f9fafb;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
        }

        .footer a {
            color: #f59e0b;
            text-decoration: none;
        }

        .footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Appeal Submitted</h1>
            <p>Job Posting Suspension Appeal</p>
        </div>

        <div class="body">
            <p>Hello AVAA RMS Admin Team,</p>

            <p>An employer has submitted an appeal for a suspended job posting. Please review the details below:</p>

            <div class="info-box">
                <div class="info-row">
                    <span class="info-label">Employer Name:</span>
                    <span class="info-value">{{ $employer->first_name }} {{ $employer->last_name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Employer Email:</span>
                    <span class="info-value">{{ $employer->email }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Job Posting Title:</span>
                    <span class="info-value">{{ $job->title }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Report Reason:</span>
                    <span class="info-value">{{ $reportReason }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Appeal Submitted:</span>
                    <span class="info-value">{{ now()->format('M d, Y \a\t H:i A') }}</span>
                </div>
            </div>

            <h3 style="color: #374151; margin-top: 24px; margin-bottom: 12px; font-size: 16px;">Employer's Appeal Message:</h3>

            <div class="appeal-box">
                <div class="appeal-header">Statement from Employer:</div>
                <div class="appeal-message">{{ $appealMessage }}</div>
            </div>

            <h3 style="color: #374151; margin-top: 24px; margin-bottom: 12px; font-size: 16px;">Next Steps:</h3>

            <div class="action-box">
                <strong>Action Required:</strong> Please review this appeal at your earliest convenience. You can:
                <ul style="margin: 8px 0 0 0; padding-left: 20px;">
                    <li>Approve the appeal and reactivate the job posting</li>
                    <li>Reject the appeal with a detailed explanation</li>
                    <li>Request additional information from the employer</li>
                </ul>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
                Best regards,<br>
                <strong>AVAA RMS System</strong>
            </p>
        </div>

        <div class="footer">
            <p style="margin: 0;">This is an automated notification from AVAA RMS.</p>
            <p style="margin: 8px 0 0 0;">For support, contact <a href="mailto:support@avaarms.com">support@avaarms.com</a></p>
        </div>
    </div>
</body>
</html>
