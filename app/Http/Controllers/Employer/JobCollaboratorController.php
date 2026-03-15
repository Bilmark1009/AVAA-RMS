<?php

namespace App\Http\Controllers\Employer;

use App\Http\Controllers\Controller;
use App\Models\JobCollaborator;
use App\Models\JobListing;
use App\Models\User;
use App\Notifications\CollaborationInviteNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

use Inertia\Inertia;
use Inertia\Response;

class JobCollaboratorController extends Controller
{
    /**
     * Search employers who can be invited to collaborate on a job.
     * Excludes the job owner and already-invited users.
     */
    public function search(Request $request, JobListing $job): JsonResponse
    {
        abort_if($job->employer_id !== $request->user()->id, 403);

        $q = $request->input('q', '');

        if (strlen($q) < 2) {
            return response()->json([]);
        }

        $excludeIds = $job->collaborators()->pluck('user_id')->push($job->employer_id)->toArray();

        $users = User::where('role', 'employer')
            ->whereNotIn('id', $excludeIds)
            ->where(function ($query) use ($q) {
                $query->where('first_name', 'LIKE', "%{$q}%")
                      ->orWhere('last_name', 'LIKE', "%{$q}%")
                      ->orWhere('email', 'LIKE', "%{$q}%");
            })
            ->limit(10)
            ->get()
            ->map(fn(User $u) => [
                'id'         => $u->id,
                'first_name' => $u->first_name,
                'last_name'  => $u->last_name,
                'email'      => $u->email,
                'avatar'     => $u->avatar,
                'company'    => $u->employerProfile?->company_name,
            ]);

        return response()->json($users);
    }

    /**
     * Invite an employer to collaborate on a job.
     */
    public function invite(Request $request, JobListing $job): RedirectResponse
    {
        abort_if($job->employer_id !== $request->user()->id, 403);

        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        /** @var User $invitee */
        $invitee = User::findOrFail($request->user_id);
        abort_if($invitee->role !== 'employer', 422, 'Only employers can be invited.');
        abort_if($invitee->id === $request->user()->id, 422, 'You cannot invite yourself.');

        // Prevent duplicate invites
        /** @var JobCollaborator|null $existing */
        $existing = $job->collaborators()->where('user_id', $invitee->id)->first();
        if ($existing) {
            if ($existing->status === 'declined') {
                // Re-invite: reset to pending
                $existing->update(['status' => 'pending', 'accepted_at' => null]);
                $invitee->notify(new CollaborationInviteNotification($existing, $job, $request->user()));
                return back()->with('success', 'Invitation re-sent.');
            }
            return back()->with('info', 'This recruiter has already been invited.');
        }

        $collaborator = JobCollaborator::create([
            'job_listing_id' => $job->id,
            'user_id'        => $invitee->id,
            'invited_by'     => $request->user()->id,
            'role'           => 'Collaborator',
            'status'         => 'pending',
        ]);

        $invitee->notify(new CollaborationInviteNotification($collaborator, $job, $request->user()));

        return back()->with('success', 'Invitation sent successfully.');
    }

    /**
     * Remove a collaborator from a job (owner only).
     */
    public function remove(Request $request, JobListing $job, JobCollaborator $collaborator): RedirectResponse
    {
        abort_if($job->employer_id !== $request->user()->id, 403);
        abort_if($collaborator->job_listing_id !== $job->id, 403);

        $collaborator->delete();

        return back()->with('success', 'Collaborator removed.');
    }

    /**
     * List pending collaboration invitations for the current user.
     */
    public function myInvitations(Request $request): Response
    {
        $user = $request->user()->load('employerProfile');

        $invitations = JobCollaborator::where('user_id', $user->id)
            ->where('status', 'pending')
            ->with(['jobListing', 'inviter.employerProfile'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn(JobCollaborator $c) => [
                'id'         => $c->id,
                'status'     => $c->status,
                'created_at' => $c->created_at->toDateString(),
                'job'        => [
                    'id'    => $c->jobListing->id,
                    'title' => $c->jobListing->title,
                    'company' => $c->jobListing->company_name,
                    'location' => $c->jobListing->location,
                ],
                'inviter'    => [
                    'name'    => "{$c->inviter->first_name} {$c->inviter->last_name}",
                    'email'   => $c->inviter->email,
                    'avatar'  => $c->inviter->avatar,
                    'company' => $c->inviter->employerProfile?->company_name,
                ],
            ]);

        return Inertia::render('Employer/Invitations', [
            'user'        => $user,
            'profile'     => $user->employerProfile,
            'invitations' => $invitations,
        ]);
    }

    /**
     * Accept a collaboration invitation (invitee only).
     */
    public function accept(Request $request, JobCollaborator $collaborator): RedirectResponse
    {
        abort_if($collaborator->user_id !== $request->user()->id, 403);
        abort_if($collaborator->status !== 'pending', 422, 'This invitation is no longer pending.');

        $collaborator->update([
            'status'      => 'accepted',
            'accepted_at' => now(),
        ]);

        return back()->with('success', 'You are now a collaborator on this job.');
    }

    /**
     * Decline a collaboration invitation (invitee only).
     */
    public function decline(Request $request, JobCollaborator $collaborator): RedirectResponse
    {
        abort_if($collaborator->user_id !== $request->user()->id, 403);
        abort_if($collaborator->status !== 'pending', 422, 'This invitation is no longer pending.');

        $collaborator->update(['status' => 'declined']);

        return back()->with('success', 'Invitation declined.');
    }
}

