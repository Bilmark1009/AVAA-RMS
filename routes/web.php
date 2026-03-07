<?php

use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Employer\DashboardController as EmployerDashboardController;
use App\Http\Controllers\Employer\JobListingController;
use App\Http\Controllers\JobSeeker\DashboardController as JobSeekerDashboardController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\EmployerVerificationController;
use App\Http\Controllers\Employer\ProfileController as EmployerProfileController;
use App\Http\Controllers\JobSeeker\ProfileController as JobSeekerProfileController;
use App\Http\Controllers\Admin\VerificationsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\JobSeeker\JobBrowseController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Home
Route::get('/', fn() => Inertia::render('Welcome'))->name('home');

// Registration
Route::middleware('guest')->group(function () {
    Route::get('/register', [RegisteredUserController::class, 'showRoleSelection'])->name('register');
    Route::get('/register/employer', [RegisteredUserController::class, 'createEmployer'])->name('register.employer');
    Route::post('/register/employer', [RegisteredUserController::class, 'storeEmployer'])->name('register.employer.store');
    Route::get('/register/job-seeker', [RegisteredUserController::class, 'createJobSeeker'])->name('register.job-seeker');
    Route::post('/register/job-seeker', [RegisteredUserController::class, 'storeJobSeeker'])->name('register.job-seeker.store');
});

// Role-based dashboards
Route::middleware(['auth', 'verified'])->group(function () {

    // ── Breeze profile routes (shared across all roles) ──────────────────────
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    // ─────────────────────────────────────────────────────────────────────────

    // ── Employer ─────────────────────────────────────────────────────────────
    Route::middleware('role:employer')->prefix('employer')->name('employer.')->group(function () {

        // Dashboard
        Route::get('/dashboard', [EmployerDashboardController::class, 'index'])->name('dashboard');

        // Onboarding profile completion
        Route::post('/profile/complete', [EmployerProfileController::class, 'complete'])->name('profile.complete');

        // ── Job Listings ──────────────────────────────────────────────────────
        // GET  /employer/jobs                  → index (Manage Jobs page)
        // POST /employer/jobs                  → store (Create Job modal submits here)
        // PUT  /employer/jobs/{job}            → update (Edit Job modal submits here)
        // DELETE /employer/jobs/{job}          → destroy (three-dot menu → Delete)
        // PATCH /employer/jobs/{job}/status    → updateStatus (inline status dropdown)
        // GET  /employer/jobs/{job}/applications → applications (sub-page)
        Route::get('/jobs', [JobListingController::class, 'index'])->name('jobs.index');
        Route::post('/jobs', [JobListingController::class, 'store'])->name('jobs.store');
        Route::put('/jobs/{job}', [JobListingController::class, 'update'])->name('jobs.update');
        Route::delete('/jobs/{job}', [JobListingController::class, 'destroy'])->name('jobs.destroy');
        Route::patch('/jobs/{job}/status', [JobListingController::class, 'updateStatus'])->name('jobs.status');
        Route::get('/jobs/{job}/applications', [JobListingController::class, 'applications'])->name('jobs.applications');
    });
    // ─────────────────────────────────────────────────────────────────────────

    // ── Job Seeker ───────────────────────────────────────────────────────────
    Route::middleware('role:job_seeker')->prefix('job-seeker')->name('job-seeker.')->group(function () {
        Route::get('/dashboard', [JobSeekerDashboardController::class, 'index'])->name('dashboard');
        Route::post('/profile/complete', [JobSeekerProfileController::class, 'complete'])->name('profile.complete');
        Route::get('/profile', [JobSeekerProfileController::class, 'edit'])->name('profile.edit');
        Route::match(['POST', 'PATCH'], '/profile', [JobSeekerProfileController::class, 'update'])->name('profile.update');
        Route::get('/jobs', [JobBrowseController::class, 'browse'])->name('jobs.browse');
        Route::get('/jobs/saved', [JobBrowseController::class, 'saved'])->name('jobs.saved');
        Route::post('/jobs/{job}/save', [JobBrowseController::class, 'save'])->name('jobs.save');
        Route::delete('/jobs/{job}/unsave', [JobBrowseController::class, 'unsave'])->name('jobs.unsave');
        Route::post('/jobs/{job}/apply', [JobBrowseController::class, 'apply'])->name('jobs.apply');
    });
    // ─────────────────────────────────────────────────────────────────────────

    // ── Admin ─────────────────────────────────────────────────────────────────
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::post('/employers/{user}/verify', [EmployerVerificationController::class, 'verify'])->name('employers.verify');
        Route::post('/employers/{user}/revoke', [EmployerVerificationController::class, 'revoke'])->name('employers.revoke');
        Route::get('/verifications', [EmployerVerificationController::class, 'index'])->name('verifications');
    });
    // ─────────────────────────────────────────────────────────────────────────
});

require __DIR__ . '/auth.php';