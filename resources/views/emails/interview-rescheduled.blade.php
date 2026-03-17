<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interview Rescheduled</title>
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
            background: linear-gradient(135deg, #0d6b5e, #10a37f);
            padding: 28px 32px;
        }

        .header h1 {
            color: #fff;
            font-size: 20px;
            margin: 0;
        }

        .body {
            padding: 28px 32px;
            color: #374151;
            font-size: 15px;
            line-height: 1.7;
        }

        .detail-box {
            background: #ecfdf5;
            border-left: 4px solid #10b981;
            border-radius: 8px;
            padding: 16px 20px;
            margin: 20px 0;
        }

        .detail-row {
            display: flex;
            gap: 8px;
            margin-bottom: 8px;
            font-size: 14px;
            color: #065f46;
        }

        .detail-label {
            font-weight: 700;
            min-width: 110px;
        }

        .footer {
            padding: 20px 32px;
            background: #f9fafb;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>Interview Rescheduled</h1>
        </div>
        <div class="body">
            <p>Dear {{ $candidateName }},</p>
            <p>Your interview for <strong>{{ $job->title }}</strong> has been rescheduled. Please find the updated details below.</p>

            <div class="detail-box">
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span>{{ \Carbon\Carbon::parse($interview->interview_date)->format('F j, Y') }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span>{{ \Carbon\Carbon::parse($interview->interview_time)->format('g:i A') }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Type:</span>
                    <span>{{ $interview->interview_type }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Interviewer:</span>
                    <span>{{ $interview->interviewer_name }}</span>
                </div>
                @if($interview->location_or_link)
                    <div class="detail-row">
                        <span class="detail-label">{{ $interview->interview_type === 'Online Interview' ? 'Meeting Link:' : 'Location:' }}</span>
                        <span>
                            @if($interview->interview_type === 'Online Interview')
                                <a href="{{ $interview->location_or_link }}" style="color: #0d6b5e; text-decoration: underline;">{{ $interview->location_or_link }}</a>
                            @else
                                {{ $interview->location_or_link }}
                            @endif
                        </span>
                    </div>
                @endif
                @if($interview->notes)
                    <div class="detail-row" style="margin-top: 12px; border-top: 1px solid #d1fae5; padding-top: 12px;">
                        <span class="detail-label">Notes:</span>
                        <span>{{ $interview->notes }}</span>
                    </div>
                @endif
            </div>

            <p>Please make sure to be available at the updated schedule.</p>
            <p>Best regards,<br>The Hiring Team</p>
        </div>
        <div class="footer">
            This email was sent from AVAA Recruitment Management System
        </div>
    </div>
</body>

</html>
