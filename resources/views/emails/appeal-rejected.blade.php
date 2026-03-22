<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; }
        .card { background: white; border-radius: 12px; padding: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 24px; }
        .rejected-badge { display: inline-block; background: #fee2e2; color: #dc2626; padding: 8px 12px; border-radius: 6px; font-weight: 600; font-size: 12px; margin-top: 10px; }
        .info-box { background: #f3f4f6; border-left: 4px solid #ef4444; padding: 15px; margin: 15px 0; border-radius: 6px; }
        .info-label { color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
        .info-value { color: #1f2937; font-weight: 600; font-size: 16px; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 15px; }
        .button:hover { background: #2563eb; }
        .footer { color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <h1>Appeal Decision</h1>
                <div class="rejected-badge">Your appeal has been rejected</div>
            </div>

            <p>Hello {{ $employer->first_name }},</p>

            <p>We have reviewed your appeal regarding your job posting <strong>"{{ $job->title }}"</strong>. Unfortunately, our admin team has decided to <strong>reject your appeal</strong>.</p>

            <div class="info-box">
                <div class="info-label">Job Posting</div>
                <div class="info-value">{{ $job->title }}</div>
            </div>

            <div class="info-box">
                <div class="info-label">Decision</div>
                <div class="info-value">Appeal Rejected</div>
            </div>

            <p>The original suspension/ban remains in effect. This means your job posting will continue to be unavailable.</p>

            <h3 style="color: #1f2937; margin-top: 25px;">What You Can Do</h3>
            <ul style="color: #4b5563;">
                <li>Review the original report reason and ensure your posting complies with our guidelines</li>
                <li>Submit a new appeal if you believe there has been a misunderstanding</li>
                <li>Contact our support team for assistance</li>
            </ul>

            <a href="{{ route('employer.dashboard') }}" class="button">View Dashboard</a>

            <p style="margin-top: 25px; color: #6b7280; font-size: 14px;">
                If you have questions about this decision or would like to discuss further, please contact our support team.
            </p>

            <div class="footer">
                <p>© {{ now()->year }} AVAA RMS. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
