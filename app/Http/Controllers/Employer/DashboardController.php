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
        $totalVisitsCount = JobApplication::count(); // total applications on platform

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

        // ── Recent posted jobs (latest 6) ────────────────────────────────
        $recentJobs = JobListing::where('employer_id', $user->id)
            ->withCount('applications')
            ->latest()
            ->take(6)
            ->get();

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
            'recentJobs' => $recentJobs,
        ]);
    }
}