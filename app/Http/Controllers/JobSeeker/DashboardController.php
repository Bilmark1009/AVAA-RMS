<?php

namespace App\Http\Controllers\JobSeeker;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user()->load('jobSeekerProfile');

        return Inertia::render('JobSeeker/Dashboard', [
            'user'            => $user,
            'profile'         => $user->jobSeekerProfile,
            'profileComplete' => $user->profile_completed,
        ]);
    }
}