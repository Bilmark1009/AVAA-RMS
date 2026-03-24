<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Suspended</title>
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
            background: linear-gradient(135deg, #92400e, #ea580c);
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

        .alert-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            border-radius: 8px;
            padding: 16px 20px;
            margin: 20px 0;
            color: #78350f;
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
            font-weight: 500;
        }

        .duration-badge {
            display: inline-block;
            background: #fed7aa;
            color: #92400e;
            padding: 6px 14px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
            margin-top: 2px;
        }

        .consequences {
            background: #fffbeb;
            border: 1px solid #fcd34d;
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
            color: #f59e0b;
            font-weight: bold;
            margin-top: 2px;
            flex-shrink: 0;
        }

        .consequence-text {
            color: #78350f;
            font-size: 14px;
            line-height: 1.5;
        }

        .consequence-text strong {
            color: #92400e;
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

        .divider {
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 20px 0;
        }

        .timeline {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px 20px;
            margin: 20px 0;
        }

        .timeline-item {
            display: flex;
            gap: 12px;
            margin-bottom: 12px;
        }

        .timeline-item:last-child {
            margin-bottom: 0;
        }

        .timeline-icon {
            color: #f59e0b;
            font-weight: bold;
            font-size: 18px;
            margin-top: -2px;
            flex-shrink: 0;
            width: 24px;
            text-align: center;
        }

        .timeline-text {
            color: #4b5563;
            font-size: 14px;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Job Posting Suspended</h1>
            <p>Suspension period: {{ $duration }}</p>
        </div>

        <div class="body">
            <p>Dear {{ $user->first_name }},</p>

            <p>We are writing to inform you that one of your job postings has been <strong>temporarily suspended</strong> for {{ strtolower($duration) }} due to a policy violation reported on our platform. Your account remains fully accessible and operational. Only the specific reported job posting is affected.</p>

            <div class="info-box">
                <div class="info-row">
                    <span class="info-label">Report Reason:</span>
                    <span class="info-value">{{ $reportReason }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Suspension Duration:</span>
                    <span class="duration-badge">{{ $duration }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Suspension Date:</span>
                    <span class="info-value">{{ now()->format('M d, Y') }}</span>
                </div>
            </div>

            <h3 style="color: #92400e; margin-top: 24px; margin-bottom: 12px; font-size: 16px;">What This Means:</h3>

            <div class="consequences">
                <div class="consequence-item">
                    <div class="consequence-icon">⏸</div>
                    <div class="consequence-text">
                        <strong>Posting Visibility:</strong> This job posting is now hidden from public view and will not appear in search results or listings for {{ strtolower($duration) }}.
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
                        <strong>Reactivation:</strong> This posting will automatically reappear after the suspension period unless further violations occur.
                    </div>
                </div>
            </div>

            <h3 style="color: #374151; margin-top: 24px; margin-bottom: 12px; font-size: 16px;">Timeline:</h3>

            <div class="timeline">
                <div class="timeline-item">
                    <div class="timeline-icon">⏱</div>
                    <div class="timeline-text">
                        <strong>Suspension Effective:</strong> Your job posting is now suspended
                    </div>
                </div>

                <div class="timeline-item">
                    <div class="timeline-icon">📅</div>
                    <div class="timeline-text">
                        <strong>Reactivation Date:</strong> {{ now()->add(str_replace(' Days', ' days', strtolower($duration)))->format('M d, Y') }}
                    </div>
                </div>

                <div class="timeline-item">
                    <div class="timeline-icon">✓</div>
                    <div class="timeline-text">
                        <strong>Automatic Reactivation:</strong> Your posting will be restored automatically (pending no further violations)
                    </div>
                </div>
            </div>

            <div class="alert-box">
                <strong>Important:</strong> Further policy violations may result in stricter action including permanent removal of the posting or account restrictions.
            </div>

            <h3 style="color: #374151; margin-top: 24px; margin-bottom: 12px; font-size: 16px;">Questions or Concerns?</h3>

            <p>If you believe this action was issued in error, please contact our support team:</p>

            <div class="info-box">
                <p style="margin: 0; margin-bottom: 8px;"><strong>Email:</strong> <a href="mailto:support@avaarms.com" style="color: #f59e0b;">support@avaarms.com</a></p>
                <p style="margin: 0;"><strong>Subject:</strong> "Job Posting Suspension Review"</p>
            </div>

            <p>In your message, please include:</p>
            <ul style="color: #374151; font-size: 15px; line-height: 1.7; margin: 12px 0;">
                <li>Your account email address</li>
                <li>The job posting title that was suspended</li>
                <li>Any clarifications regarding the reported issue</li>
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
