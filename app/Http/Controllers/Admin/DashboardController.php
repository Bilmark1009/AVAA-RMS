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
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i)->startOfMonth();
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
            (SELECT COUNT(*) FROM job_applications WHERE job_applications.user_id = users.id) as applications_count')
            ->whereIn('role', ['employer', 'job_seeker'])
            ->with('jobSeekerProfile:user_id,profile_frame')
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
            ]);

        $recentJobSeekers = User::selectRaw('id, first_name, last_name, email, role, status, created_at,
            (SELECT COUNT(*) FROM job_applications WHERE job_applications.user_id = users.id) as applications_count')
            ->where('role', 'job_seeker')
            ->with('jobSeekerProfile:user_id,profile_frame')
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
        ]);
    }
}