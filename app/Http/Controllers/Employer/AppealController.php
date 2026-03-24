<?php

namespace App\Http\Controllers\Employer;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\JobListing;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use App\Mail\AppealSubmittedNotification;
use App\Notifications\AdminAppealSubmittedNotification;

class AppealController extends Controller
{
    /**
     * Store a new appeal for a suspended/banned job posting
     */
    public function store(Request $request)
    {
        $appealColumnsExist = Schema::hasColumn('reports', 'appeal_message')
            && Schema::hasColumn('reports', 'appealed_at')
            && Schema::hasColumn('reports', 'appeal_status');

        if (!$appealColumnsExist) {
            return redirect()->back()->with('error', 'Appeals are temporarily unavailable. Please run database migrations and try again.');
        }

        // Validate the request
        $validated = $request->validate([
            'report_id' => ['required', 'exists:reports,id'],
            'job_id' => ['required', 'exists:job_listings,id'],
            'message' => ['required', 'string', 'min:20', 'max:500'],
        ], [
            'message.min' => 'Appeal message must be at least 20 characters.',
            'message.max' => 'Appeal message cannot exceed 500 characters.',
        ]);

        // Get the report and verify it exists
        $report = Report::findOrFail($validated['report_id']);

        // Get the job and verify the user owns it
        $job = JobListing::findOrFail($validated['job_id']);
        
        // Verify the authenticated user owns this job posting
        if ($job->employer_id !== Auth::id()) {
            return redirect()->back()->with('error', 'Unauthorized access to this job posting.');
        }

        // Verify the job is suspended (report status is 'resolved')
        if ($report->status !== 'resolved') {
            return redirect()->back()->with('error', 'This job posting is not suspended.');
        }

        // Prevent duplicate submissions while an existing appeal is still pending.
        if ($report->appeal_status === 'pending') {
            return redirect()->back()->with('error', 'Your appeal has been sent. Please wait for a response from the admin team.');
        }

        // Update report with appeal information
        $report->update([
            'appeal_message' => $validated['message'],
            'appealed_at' => now(),
            'appeal_status' => 'pending', // pending review by admin
        ]);

        // Send notification email to admin
        try {
            $admins = User::where('role', 'admin')->get();
            $employer = Auth::user();

            foreach ($admins as $admin) {
                Mail::to($admin->email)->send(new AppealSubmittedNotification(
                    $job,
                    $employer,
                    $report,
                    $validated['message']
                ));

                // In-app admin notification with deep link to appeal review.
                $admin->notify(new AdminAppealSubmittedNotification($job, $employer, $report));
            }
        } catch (\Exception $e) {
            // Log the error but don't fail the request
            Log::error('Failed to send appeal notification email', [
                'exception' => $e->getMessage(),
                'report_id' => $report->id,
            ]);
        }

        return redirect()->back()->with('success', 'Appeal submitted successfully! Our team will review it within 24-48 hours.');
    }
}
