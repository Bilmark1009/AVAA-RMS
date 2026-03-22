<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; }
        .card { background: white; border-radius: 12px; padding: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 24px; }
        .success-badge { display: inline-block; background: #d1fae5; color: #059669; padding: 8px 12px; border-radius: 6px; font-weight: 600; font-size: 12px; margin-top: 10px; }
        .info-box { background: #f3f4f6; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; border-radius: 6px; }
        .info-label { color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
        .info-value { color: #1f2937; font-weight: 600; font-size: 16px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 15px; }
        .button:hover { background: #059669; }
        .footer { color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <h1>Appeal Approved ✓</h1>
                <div class="success-badge">Your job posting has been restored</div>
            </div>

            <p>Hello {{ $employer->first_name }},</p>

            <p>Great news! Your appeal has been <strong>approved</strong> by our admin team. We have <strong>restored your job posting</strong> to active status.</p>

            <div class="info-box">
                <div class="info-label">Job Posting</div>
                <div class="info-value">{{ $job->title }}</div>
            </div>

            <div class="info-box">
                <div class="info-label">Status</div>
                <div class="info-value">✓ Active & Visible</div>
            </div>

            <p>Your job posting is now live and can be viewed by job seekers. You can manage it from your employer dashboard.</p>

            <a href="{{ route('employer.dashboard') }}" class="button">Go to Dashboard</a>

            <p style="margin-top: 25px; color: #6b7280; font-size: 14px;">
                If you have any questions about this decision, please contact our support team.
            </p>

            <div class="footer">
                <p>© {{ now()->year }} AVAA RMS. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
