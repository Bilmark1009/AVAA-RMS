<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Banned</title>
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
            background: linear-gradient(135deg, #991b1b, #dc2626);
            padding: 28px 32px;
        }

        .header h1 {
            color: #fff;
            font-size: 20px;
            margin: 0;
        }

        .header p {
            color: #fecaca;
            font-size: 13px;
            margin: 6px 0 0 0;
        }

        .body {
            padding: 28px 32px;
            color: #374151;
            font-size: 15px;
            line-height: 1.7;
        }

        .alert-box {
            background: #fef2f2;
            border-left: 4px solid #dc2626;
            border-radius: 8px;
            padding: 16px 20px;
            margin: 20px 0;
            color: #991b1b;
            font-size: 14px;
            line-height: 1.6;
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
        }

        .consequences {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 16px 20px;
            margin: 20px 0;
        }

        .consequence-item {
            display: flex;
            gap: 12px;
            margin-bottom: 12px;
        }

        .consequence-item:last-child {
            margin-bottom: 0;
        }

        .consequence-icon {
            color: #dc2626;
            font-weight: bold;
            margin-top: 2px;
            flex-shrink: 0;
        }

        .consequence-text {
            color: #7f1d1d;
            font-size: 14px;
            line-height: 1.5;
        }

        .consequence-text strong {
            color: #991b1b;
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
            color: #dc2626;
            text-decoration: none;
        }

        .footer a:hover {
            text-decoration: underline;
        }

        .divider {
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Job Posting Permanently Removed</h1>
            <p>Effective immediately</p>
        </div>

        <div class="body">
            <p>Dear {{ $user->first_name }},</p>

            <p>We are writing to inform you that one of your job postings has been <strong>permanently removed</strong> due to severe policy violations reported on our platform. This action is final and effective immediately.</p>

            <div class="info-box">
                <div class="info-row">
                    <span class="info-label">Report Reason:</span>
                    <span class="info-value">{{ $reportReason }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Posting Status:</span>
                    <span class="info-value">Permanently Removed</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Date:</span>
                    <span class="info-value">{{ now()->format('M d, Y') }}</span>
                </div>
            </div>

            <h3 style="color: #991b1b; margin-top: 24px; margin-bottom: 12px; font-size: 16px;">What This Means:</h3>

            <div class="consequences">
                <div class="consequence-item">
                    <div class="consequence-icon">✕</div>
                    <div class="consequence-text">
                        <strong>Posting Removed:</strong> This specific job posting has been permanently deleted and will not be restored.
                    </div>
                </div>

                <div class="consequence-item">
                    <div class="consequence-icon">✓</div>
                    <div class="consequence-text">
                        <strong>Your Account:</strong> Your account remains fully functional. You can log in, manage other jobs, post new listings, and send/receive messages.
                    </div>
                </div>

                <div class="consequence-item">
                    <div class="consequence-icon">📋</div>
                    <div class="consequence-text">
                        <strong>Other Postings:</strong> Your other active job postings are not affected and remain visible.
                    </div>
                </div>

                <div class="consequence-item">
                    <div class="consequence-icon">⚠</div>
                    <div class="consequence-text">
                        <strong>Future Violations:</strong> Additional policy violations may result in stricter action including account restrictions or permanent ban.
                    </div>
                </div>
            </div>

            <div class="alert-box">
                <strong>Important:</strong> This posting removal is permanent and cannot be reversed. We enforce these policies strictly to maintain a safe and trustworthy community.
            </div>

            <h3 style="color: #374151; margin-top: 24px; margin-bottom: 12px; font-size: 16px;">Questions or Concerns?</h3>

            <p>If you believe this removal was issued in error, please contact our support team within 14 days:</p>

            <div class="info-box">
                <p style="margin: 0; margin-bottom: 8px;"><strong>Email:</strong> <a href="mailto:support@avaarms.com" style="color: #dc2626;">support@avaarms.com</a></p>
                <p style="margin: 0;"><strong>Subject:</strong> "Job Posting Removal Review"</p>
            </div>

            <p>In your message, please include:</p>
            <ul style="color: #374151; font-size: 15px; line-height: 1.7; margin: 12px 0;">
                <li>Your account email address</li>
                <li>The job posting title that was removed</li>
                <li>Explanation of why you believe the removal is incorrect</li>
            </ul>

            <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">Best regards,<br><strong>AVAA RMS Moderation Team</strong></p>
        </div>

        <div class="footer">
            <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
            <p style="margin: 8px 0 0 0;">If you need assistance, contact <a href="mailto:support@avaarms.com">support@avaarms.com</a></p>
        </div>
    </div>
</body>
</html>
