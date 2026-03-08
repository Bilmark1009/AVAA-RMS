<?php

namespace App\Http\Controllers\Messaging;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Show the report form for a user.
     * GET /messages/report/{user}
     */
    public function create(Request $request, User $user): Response
    {
        $current = $request->user();
        abort_if($current->id === $user->id, 403, 'You cannot report yourself.');

        // Find the conversation between them (if any) for context
        $conversation = \App\Models\Conversation::findDirect($current->id, $user->id);

        return Inertia::render('Messaging/Report', [
            'reportedUser' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'avatar' => $user->avatar,
                'role' => $user->role,
                'subtitle' => $user->role === 'job_seeker'
                    ? ($user->jobSeekerProfile?->professional_title
                        ?? $user->jobSeekerProfile?->current_job_title
                        ?? 'Job Seeker')
                    : ($user->employerProfile?->company_name ?? 'Employer'),
            ],
            'conversationId' => $conversation?->id,
        ]);
    }

    /**
     * Store a new report.
     * POST /messages/report/{user}
     */
    public function store(Request $request, User $user): \Illuminate\Http\RedirectResponse
    {
        $current = $request->user();
        abort_if($current->id === $user->id, 403, 'You cannot report yourself.');

        $request->validate([
            'reason' => 'required|in:inappropriate_behavior,spam,suspicious_job,identity_theft,other',
            'details' => 'nullable|string|max:1000',
        ]);

        // Find conversation for context
        $conversation = \App\Models\Conversation::findDirect($current->id, $user->id);

        Report::create([
            'reporter_id' => $current->id,
            'reported_user_id' => $user->id,
            'conversation_id' => $conversation?->id,
            'reason' => $request->reason,
            'details' => $request->details,
            'status' => 'pending',
        ]);

        return redirect()->route('messages.index')
            ->with('success', 'Your report has been submitted. Our team will review it within 24 hours.');
    }
}
