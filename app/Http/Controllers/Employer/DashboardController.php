<?php

namespace App\Http\Controllers\Employer;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\JobListing;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user()->load('employerProfile');

        // Mark verification notification as read when they visit dashboard
        $user->unreadNotifications()
            ->where('type', 'App\Notifications\EmployerVerifiedNotification')
            ->update(['read_at' => now()]);

        // ── Dashboard statistics ─────────────────────────────────────────
        $activeUsersCount = DB::table('users')
            ->join('job_applications', 'users.id', '=', 'job_applications.user_id')
            ->join('job_listings', 'job_applications.job_listing_id', '=', 'job_listings.id')
            ->where('users.status', 'active')
            ->where('job_listings.employer_id', $user->id)
            ->where('job_applications.status', 'hired')
            ->distinct('users.id')
            ->count();
        $jobsPostedCount = JobListing::where('employer_id', $user->id)->count();
        $applicationsCount = JobApplication::whereHas('jobListing', fn($q) => $q->where('employer_id', $user->id))->count();
        // Count only applications tied to non-deleted jobs.
        $totalVisitsCount = JobApplication::whereHas('jobListing')->count();

        // ── Monthly applications data for chart ─────────────────────────
        $monthlyApplications = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $count = JobApplication::whereHas('jobListing', fn($q) => $q->where('employer_id', $user->id))
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();
            $monthlyApplications[] = [
                'month' => $date->format('M'),
                'count' => $count
            ];
        }
        // ── Weekly applications data for chart ───────────────────────────────
        $weeklyApplications = [];
        for ($i = 7; $i >= 0; $i--) {
            $startDate = now()->subWeeks($i)->startOfWeek();
            $endDate = now()->subWeeks($i)->endOfWeek();
            $count = JobApplication::whereHas('jobListing', fn($q) => $q->where('employer_id', $user->id))
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count();
            $weeklyApplications[] = [
                'week' => 'Wk ' . (8 - $i),
                'count' => $count
            ];
        }

        // ── Yearly applications data for chart ───────────────────────────────
        $yearlyApplications = [];
        for ($i = 5; $i >= 0; $i--) {
            $year = now()->subYears($i)->year;
            $count = JobApplication::whereHas('jobListing', fn($q) => $q->where('employer_id', $user->id))
                ->whereYear('created_at', $year)
                ->count();
            $yearlyApplications[] = [
                'year' => (string)$year,
                'count' => $count
            ];
        }
        // ── Recent posted jobs (latest 6) ────────────────────────────────
        $profileLogoUrl = $this->resolveLogoUrl($user->employerProfile?->logo_path);

        $recentJobs = JobListing::where('employer_id', $user->id)
            ->withCount('applications')
            ->latest()
            ->take(6)
            ->get()
            ->map(fn (JobListing $job) => [
                'id'                 => $job->id,
                'title'              => $job->title,
                'location'           => $job->location,
                'status'             => $job->status,
                'applications_count' => $job->applications_count,
                'created_at'         => $job->created_at->toISOString(),
                'logo_url'           => $this->resolveLogoUrl($job->logo_path) ?? $profileLogoUrl,
            ]);

        // For suspended users, also show suspended jobs
        $suspendedJobs = [];
        if ($user->status === 'suspended') {
            $suspendedJobs = JobListing::where('employer_id', $user->id)
                ->where('status', 'suspended')
                ->withCount('applications')
                ->latest()
                ->get()
                ->map(fn (JobListing $job) => [
                    'id'                 => $job->id,
                    'title'              => $job->title,
                    'location'           => $job->location,
                    'status'             => $job->status,
                    'applications_count' => $job->applications_count,
                    'created_at'         => $job->created_at->toISOString(),
                    'logo_url'           => $this->resolveLogoUrl($job->logo_path) ?? $profileLogoUrl,
                ]);
        }

        return Inertia::render('Employer/Dashboard', [
            'user' => $user,
            'profile' => $user->employerProfile,
            'profileComplete' => $user->profile_completed,
            'isVerified' => $user->employerProfile?->is_verified ?? false,
            'justVerified' => $user->notifications()
                ->where('type', 'App\Notifications\EmployerVerifiedNotification')
                ->whereNull('read_at')
                ->exists(),
            'needsPhone' => (bool) ($user->google_id && !$user->phone),

            // new dashboard data
            'activeUsersCount' => $activeUsersCount,
            'jobsPostedCount' => $jobsPostedCount,
            'applicationsCount' => $applicationsCount,
            'totalVisitsCount' => $totalVisitsCount,
            'monthlyApplications' => $monthlyApplications,
            'weeklyApplications' => $weeklyApplications,
            'yearlyApplications' => $yearlyApplications,
            'recentJobs' => $recentJobs,
            'suspendedJobs' => $suspendedJobs,
            'isSuspended' => $user->status === 'suspended',
        ]);
    }

    private function resolveLogoUrl(?string $path): ?string
    {
        if (!is_string($path) || trim($path) === '') {
            return null;
        }

        $trimmed = trim($path);

        if (str_starts_with($trimmed, 'http://') || str_starts_with($trimmed, 'https://')) {
            return $trimmed;
        }

        $relative = ltrim(str_replace('/storage/', '', $trimmed), '/');

        return asset('storage/' . $relative);
    }
}