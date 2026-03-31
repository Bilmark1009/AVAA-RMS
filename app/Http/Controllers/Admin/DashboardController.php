<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\JobListing;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // ── Monthly application trends (last 6 months) ──
        $trends = [];
        $now = Carbon::now();
        for ($i = 5; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i)->startOfMonth();
            $trends[] = [
                'month' => $month->format('M'),
                'count' => JobApplication::whereBetween('created_at', [
                    $month,
                    $month->copy()->endOfMonth(),
                ])->count(),
            ];
        }

        // ── Recent job listings (last 8) ──
        $recentJobs = JobListing::with('employer:id,first_name,last_name')
            ->latest()
            ->take(8)
            ->get(['id', 'employer_id', 'title', 'location', 'status', 'created_at'])
            ->map(fn($job) => [
                'id' => $job->id,
                'title' => $job->title,
                'location' => $job->location,
                'status' => $job->status,
                'created_at' => $job->created_at,
                'employer' => $job->employer
                    ? ($job->employer->first_name . ' ' . $job->employer->last_name)
                    : 'Unknown',
            ]);

        // ── Recent user registrations (last 8) with application count ──
        $recentUsers = User::selectRaw('id, first_name, last_name, email, role, created_at,
            (SELECT COUNT(*) FROM job_applications WHERE job_applications.user_id = users.id) as applications_count,
            (
                EXISTS (
                    SELECT 1 FROM job_applications ja
                    WHERE ja.user_id = users.id
                      AND ja.hired_at IS NOT NULL
                      AND ja.contract_ended_at IS NULL
                )
                OR EXISTS (
                    SELECT 1 FROM work_experiences we
                    WHERE we.user_id = users.id
                      AND we.is_current = 1
                      AND (we.job_title IS NULL OR LOWER(we.job_title) <> \'status update\')
                )
            ) as currently_working')
            ->whereIn('role', ['employer', 'job_seeker'])
            ->with('jobSeekerProfile:user_id,profile_frame,open_to_work')
            ->latest()
            ->take(8)
            ->get()
            ->map(fn($u) => [
                'id' => $u->id,
                'first_name' => $u->first_name,
                'last_name' => $u->last_name,
                'email' => $u->email,
                'role' => $u->role,
                'created_at' => $u->created_at,
                'applications_count' => (int) ($u->applications_count ?? 0),
                'profile_frame' => $u->jobSeekerProfile?->profile_frame ?? 'default',
                'open_to_work' => $u->jobSeekerProfile?->open_to_work,
                'currently_working' => (bool) ($u->currently_working ?? false),
            ]);

        $recentJobSeekers = User::selectRaw('id, first_name, last_name, email, role, status, created_at,
            (SELECT COUNT(*) FROM job_applications WHERE job_applications.user_id = users.id) as applications_count,
            (
                EXISTS (
                    SELECT 1 FROM job_applications ja
                    WHERE ja.user_id = users.id
                      AND ja.hired_at IS NOT NULL
                      AND ja.contract_ended_at IS NULL
                )
                OR EXISTS (
                    SELECT 1 FROM work_experiences we
                    WHERE we.user_id = users.id
                      AND we.is_current = 1
                      AND (we.job_title IS NULL OR LOWER(we.job_title) <> \'status update\')
                )
            ) as currently_working')
            ->where('role', 'job_seeker')
            ->with('jobSeekerProfile:user_id,profile_frame,open_to_work')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn($u) => [
                'id' => $u->id,
                'first_name' => $u->first_name,
                'last_name' => $u->last_name,
                'email' => $u->email,
                'role' => $u->role,
                'status' => $u->status,
                'created_at' => $u->created_at,
                'applications_count' => (int) ($u->applications_count ?? 0),
                'profile_frame' => $u->jobSeekerProfile?->profile_frame ?? 'default',
                'open_to_work' => $u->jobSeekerProfile?->open_to_work,
                'currently_working' => (bool) ($u->currently_working ?? false),
            ]);

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total' => User::whereIn('role', ['employer', 'job_seeker'])->count(),
                'employers' => User::where('role', 'employer')->count(),
                'jobSeekers' => User::where('role', 'job_seeker')->count(),
            ],
            'jobCount' => JobListing::count(),
            'applicationCount' => JobApplication::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'applicationTrends' => $trends,
            'recentJobs' => $recentJobs,
            'recentUsers' => $recentUsers,
            'recentJobSeekers' => $recentJobSeekers,
            'pendingCount' => User::where('role', 'employer')
                ->whereHas('employerProfile', fn($q) => $q->where('is_verified', false))
                ->count(),
            'pendingCountTrend' => $this->calculatePendingTrend(),
        ]);
    }

    /**
     * Calculate the trend percentage for pending verifications
     * by comparing current month with previous month
     */
    private function calculatePendingTrend(): int
    {
        $currentMonth = Carbon::now()->startOfMonth();
        $previousMonth = $currentMonth->copy()->subMonth();

        $currentPending = User::where('role', 'employer')
            ->whereHas('employerProfile', fn($q) => $q->where('is_verified', false)
                ->whereBetween('created_at', [
                    $currentMonth,
                    $currentMonth->copy()->endOfMonth(),
                ]))
            ->count();

        $previousPending = User::where('role', 'employer')
            ->whereHas('employerProfile', fn($q) => $q->where('is_verified', false)
                ->whereBetween('created_at', [
                    $previousMonth,
                    $previousMonth->copy()->endOfMonth(),
                ]))
            ->count();

        if ($previousPending === 0) {
            return $currentPending > 0 ? 100 : 0;
        }

        return (int) round((($currentPending - $previousPending) / $previousPending) * 100);
    }
}