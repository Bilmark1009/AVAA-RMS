<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Job Sharing</title>
</head>
<body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1f2937; margin: 0; padding: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background: #f9fafb; padding: 32px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background: #ffffff; border-radius: 16px; overflow: hidden;">
                    <tr>
                        <td style="padding: 32px;">
                            <h1 style="margin: 0 0 16px; font-size: 22px; color: #0f172a;">Check Out This Job!</h1>
                            <p style="margin: 0 0 24px; color: #475569; font-size: 15px; line-height: 1.6;">
                                {{ $senderName }} found a job posting that might interest you.
                            </p>

                            <div style="background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                                <h2 style="margin: 0 0 8px; font-size: 18px; color: #0f172a;">{{ $job->title }}</h2>
                                <p style="margin: 0 0 4px; color: #475569; font-size: 14px;">
                                    {{ $job->employer?->employerProfile?->company_name ?? $job->employer?->first_name ?? 'A Company' }} &bull; {{ $job->location ?? 'Remote' }}
                                </p>

                                @if($job->salary_min || $job->salary_max)
                                    <p style="margin: 8px 0 0; color: #475569; font-size: 14px;">
                                        <strong>Salary:</strong>
                                        @if($job->salary_min && $job->salary_max)
                                            ${{ number_format($job->salary_min) }} - ${{ number_format($job->salary_max) }}
                                        @elseif($job->salary_min)
                                            ${{ number_format($job->salary_min) }}+
                                        @else
                                            Up to ${{ number_format($job->salary_max) }}
                                        @endif
                                    </p>
                                @endif

                                @if($job->employment_type)
                                    <p style="margin: 8px 0 0; color: #475569; font-size: 14px;"><strong>Type:</strong> {{ $job->employment_type }}</p>
                                @endif

                                @if($job->experience_level)
                                    <p style="margin: 8px 0 0; color: #475569; font-size: 14px;"><strong>Experience:</strong> {{ $job->experience_level }}</p>
                                @endif
                            </div>

                            @if($job->description)
                                <div style="margin-bottom: 24px;">
                                    <h3 style="margin: 0 0 8px; font-size: 16px; color: #0f172a;">About the role</h3>
                                    <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">
                                        {{ Str::limit($job->description, 300) }}
                                    </p>
                                </div>
                            @endif

                            @if($personalMessage)
                                <div style="margin-bottom: 24px;">
                                    <h3 style="margin: 0 0 8px; font-size: 16px; color: #0f172a;">Personal message from {{ $senderName }}</h3>
                                    <blockquote style="margin: 0; padding: 12px 16px; background: #f1f5f9; border-left: 4px solid #3b82f6; color: #475569; font-size: 14px; line-height: 1.6;">
                                        {{ $personalMessage }}
                                    </blockquote>
                                </div>
                            @endif

                            <div style="text-align: center; margin-bottom: 32px;">
                                <a href="{{ $jobUrl }}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: #ffffff; border-radius: 10px; text-decoration: none; font-weight: 600;">
                                    View Full Job Details
                                </a>
                            </div>

                            <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
                                Sent by {{ config('app.name') }}
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>

