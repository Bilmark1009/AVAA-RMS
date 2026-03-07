<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total' => User::count(),
                'employers' => User::where('role', 'employer')->count(),
                'jobSeekers' => User::where('role', 'job_seeker')->count(),
            ],
            'recentUsers' => User::latest()->take(10)->get(['id', 'name', 'email', 'role', 'created_at']),
            'pendingCount' => User::where('role', 'employer')
                ->whereHas('employerProfile', function ($query) {
                    $query->where('is_verified', false);
                })
                ->count(),
        ]);
    }
}