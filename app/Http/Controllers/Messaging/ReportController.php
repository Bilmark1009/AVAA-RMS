<?php

namespace App\Http\Controllers\Messaging;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\User;
use App\Models\Message;
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
                'id'         => $user->id,
                'first_name' => $user->first_name,
                'last_name'  => $user->last_name,
                'avatar'     => $user->avatar,
                'role'       => $user->role,
                'subtitle'   => $user->role === 'job_seeker'
                    ? ($user->jobSeekerProfile?->professional_title
                        ?? $user->jobSeekerProfile?->current_job_title
                        ?? 'Job Seeker')
                    : ($user->employerProfile?->company_name ?? 'Employer'),
            ],
            'conversationId' => $conversation?->id,
        ]);
    }

    /**
     * Store a new user report (full-page form).
     * POST /messages/report/{user}
     */
    public function store(Request $request, User $user): \Illuminate\Http\RedirectResponse
    {
        $current = $request->user();
        abort_if($current->id === $user->id, 403, 'You cannot report yourself.');

        $request->validate([
            'reason'    => 'required|in:inappropriate_behavior,spam,suspicious_job,identity_theft,other',
            'details'   => 'nullable|string|max:1000',
            'evidence'  => 'nullable|array|max:5',
            'evidence.*'=> 'image|max:5120',  // 5 MB per image
        ]);

        // Find conversation for context
        $conversation = \App\Models\Conversation::findDirect($current->id, $user->id);

        // Store evidence images
        $evidencePaths = [];
        if ($request->hasFile('evidence')) {
            foreach ($request->file('evidence') as $file) {
                $evidencePaths[] = $file->store('report-evidence', 'public');
            }
        }

        Report::create([
            'reporter_id'      => $current->id,
            'reported_user_id' => $user->id,
            'conversation_id'  => $conversation?->id,
            'reason'           => $request->reason,
            'details'          => $request->details,
            'evidence'         => $evidencePaths ?: null,
            'status'           => 'pending',
        ]);

        return redirect()->route('messages.index')
            ->with('success', 'Your report has been submitted. Our team will review it within 24 hours.');
    }

    /**
     * Report a specific message (inline modal — JSON response).
     * POST /messages/report/message/{message}
     */
    public function reportMessage(Request $request, Message $message): \Illuminate\Http\JsonResponse
    {
        $current = $request->user();
        abort_if($current->id === $message->sender_id, 403, 'You cannot report your own message.');

        // Check if user is part of the conversation
        $isParticipant = $message->conversation->participants()
            ->where('user_id', $current->id)
            ->exists();
        abort_unless($isParticipant, 403, 'You are not part of this conversation.');

        $request->validate([
            'reason'     => 'required|in:inappropriate_behavior,spam,suspicious_job,identity_theft,other',
            'details'    => 'nullable|string|max:1000',
            'evidence'   => 'nullable|array|max:5',
            'evidence.*' => 'image|max:5120',  // 5 MB per image
        ]);

        // Check if already reported
        $existingReport = Report::where('reporter_id', $current->id)
            ->where('message_id', $message->id)
            ->first();

        if ($existingReport) {
            return response()->json([
                'error' => 'You have already reported this message.',
            ], 422);
        }

        // Store evidence images
        $evidencePaths = [];
        if ($request->hasFile('evidence')) {
            foreach ($request->file('evidence') as $file) {
                $evidencePaths[] = $file->store('report-evidence', 'public');
            }
        }

        Report::create([
            'reporter_id'      => $current->id,
            'reported_user_id' => $message->sender_id,
            'conversation_id'  => $message->conversation_id,
            'message_id'       => $message->id,
            'reason'           => $request->reason,
            'details'          => $request->details,
            'evidence'         => $evidencePaths ?: null,
            'status'           => 'pending',
        ]);

        return response()->json([
            'ok'      => true,
            'message' => 'Message reported successfully. Our team will review it.',
        ]);
    }
}
