<?php

use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Employer\DashboardController as EmployerDashboardController;
use App\Http\Controllers\Employer\JobListingController;
use App\Http\Controllers\Employer\InterviewController;
use App\Http\Controllers\Employer\EmployeeController;
use App\Http\Controllers\Employer\BlockedUsersController as EmployerBlockedUsersController;

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\EmployerVerificationController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\AdminJobController;
use App\Http\Controllers\Admin\AdminSettingsController;
use App\Http\Controllers\Employer\ProfileController as EmployerProfileController;
use App\Http\Controllers\JobSeeker\ProfileController as JobSeekerProfileController;
use App\Http\Controllers\Admin\VerificationsController;
use App\Http\Controllers\JobSeeker\JobBrowseController;
use App\Http\Controllers\JobSeeker\JobApplicationController;
use App\Http\Controllers\JobSeeker\BlockedUsersController as JobSeekerBlockedUsersController;
use App\Http\Controllers\Settings\AccountController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Settings\NotificationsController;
use App\Http\Controllers\Settings\JobPreferencesController;
use App\Http\Controllers\Settings\DocumentsController;
use App\Http\Controllers\Settings\BlockedUsersController;
use App\Http\Controllers\Messaging\ConversationController;
use App\Http\Controllers\Messaging\MessageController;
use App\Http\Controllers\Messaging\ReportController;
use App\Http\Controllers\Messaging\BlockController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Home — redirect authenticated users to their dashboard; show Welcome to guests
Route::get('/', function () {
    if (Auth::check()) {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        return redirect()->route($user->getDashboardRoute());
    }
    return \Inertia\Inertia::render('Welcome');
})->name('home');

// Registration
Route::middleware('guest')->group(function () {
    Route::get('/register', [RegisteredUserController::class, 'showRoleSelection'])->name('register');
    Route::get('/register/employer', [RegisteredUserController::class, 'createEmployer'])->name('register.employer');
    Route::post('/register/employer', [RegisteredUserController::class, 'storeEmployer'])->name('register.employer.store');
    Route::get('/register/job-seeker', [RegisteredUserController::class, 'createJobSeeker'])->name('register.job-seeker');
    Route::post('/register/job-seeker', [RegisteredUserController::class, 'storeJobSeeker'])->name('register.job-seeker.store');
});

Route::middleware(['auth'])->prefix('messages')->name('messages.')->group(function () {
    Route::get('/debug', [ConversationController::class, 'debug'])->name('debug');

    // ── Pages (Inertia) ───────────────────────────────────────────────────
    Route::get('/', [ConversationController::class, 'index'])->name('index');
    Route::get('/search-users', [ConversationController::class, 'searchUsers'])->name('search-users');
    Route::get('/report/{user}', [ReportController::class, 'create'])->name('report');
    Route::post('/report/{user}', [ReportController::class, 'store'])->name('report.store');
    Route::get('/archived-count', [ConversationController::class, 'archivedCount'])->name('archived-count');

    // ✅ ->missing() redirects to messages index instead of 404
    // when conversation is deleted and user reloads the old URL
    Route::get('/{conversation}', [ConversationController::class, 'show'])
        ->name('show')
        ->missing(fn() => redirect()->route('messages.index'));

    // ── Start a direct conversation ───────────────────────────────────────
    Route::post('/start', [ConversationController::class, 'start'])->name('start');

    // ── Conversation actions (JSON) ───────────────────────────────────────
    Route::post('/{conversation}/archive', [ConversationController::class, 'archive'])->name('archive');
    Route::post('/{conversation}/unarchive', [ConversationController::class, 'unarchive'])->name('unarchive');
    Route::post('/{conversation}/mute', [ConversationController::class, 'toggleMute'])->name('mute');
    Route::delete('/{conversation}', [ConversationController::class, 'destroy'])->name('destroy');

    // ── Group chat (employer only) ────────────────────────────────────────
    Route::post('/start-group', [ConversationController::class, 'startGroup'])->name('start-group');

    // ── Delete group (employer only) — must come before /{conversation} wildcard ──
    Route::delete('/group/{conversation}', [ConversationController::class, 'destroyGroup'])
        ->name('destroy-group')
        ->missing(fn() => redirect()->route('messages.index'));

    // ── Messages (JSON) ───────────────────────────────────────────────────
    // Polling: GET every ~3s with ?after_id=<last known message id>
    Route::get('/{conversation}/poll', [MessageController::class, 'poll'])->name('poll');
    // Send a message (multipart/form-data supports optional attachment)
    Route::post('/{conversation}/send', [MessageController::class, 'send'])->name('send');
    // Soft-delete a message (sender only)
    Route::delete('/{conversation}/messages/{message}', [MessageController::class, 'destroy'])->name('messages.destroy');
    // Download attachment
    Route::get('/{conversation}/messages/{message}/download', [MessageController::class, 'downloadAttachment'])->name('messages.download');
    // Mark all messages as read
    Route::post('/{conversation}/read', [MessageController::class, 'markRead'])->name('read');

    // ── Blocking (JSON) ───────────────────────────────────────────────────
    Route::get('/blocked', [BlockController::class, 'index'])->name('blocked.index');
    Route::post('/block/{user}', [BlockController::class, 'block'])->name('block');
    Route::delete('/block/{user}', [BlockController::class, 'unblock'])->name('unblock');
    Route::get('/block/{user}/check', [BlockController::class, 'check'])->name('block.check');

    // ── Report Message (JSON) ───────────────────────────────────────────
    Route::post('/report/message/{message}', [ReportController::class, 'reportMessage'])->name('report.message');
});

// Role-based dashboards
Route::middleware(['auth', 'verified', 'profile.complete'])->group(function () {

    // ── Notifications (shared across all roles) ────────────────────────────
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::get('/fetch', [NotificationController::class, 'fetch'])->name('fetch');
        Route::patch('/{id}/read', [NotificationController::class, 'markAsRead'])->name('read');
        Route::patch('/{id}/unread', [NotificationController::class, 'markAsUnread'])->name('unread');
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
        Route::delete('/destroy-all', [NotificationController::class, 'destroyAll'])->name('destroy-all');
        Route::delete('/{id}', [NotificationController::class, 'destroy'])->name('destroy');
    });

    // ── Settings (shared across all roles) ───────────────────────────────────
    Route::prefix('settings')->name('settings.')->group(function () {

        // Account
        Route::get('/account', [AccountController::class, 'edit'])->name('account');
        Route::patch('/account', [AccountController::class, 'update'])->name('account.update');
        Route::post('/account/avatar', [AccountController::class, 'uploadAvatar'])->name('account.avatar');
        Route::delete('/account/avatar', [AccountController::class, 'removeAvatar'])->name('account.avatar.remove');
        Route::delete('/account', [AccountController::class, 'destroy'])->name('account.destroy');

        // Security & Privacy
        Route::get('/security', [SecurityController::class, 'edit'])->name('security');
        Route::patch('/security', [SecurityController::class, 'update'])->name('security.update');

        // Notifications
        Route::get('/notifications', [NotificationsController::class, 'edit'])->name('notifications');
        Route::patch('/notifications', [NotificationsController::class, 'update'])->name('notifications.update');

        // Job Preferences
        Route::get('/job-preferences', [JobPreferencesController::class, 'edit'])->name('job-preferences');
        Route::patch('/job-preferences', [JobPreferencesController::class, 'update'])->name('job-preferences.update');

        // Documents
        Route::get('/documents', [DocumentsController::class, 'index'])->name('documents');
        Route::post('/documents', [DocumentsController::class, 'store'])->name('documents.store');
        Route::get('/documents/{document}/download', [DocumentsController::class, 'download'])->name('documents.download');
        Route::delete('/documents/{document}', [DocumentsController::class, 'destroy'])->name('documents.destroy');

        // Blocked Users
        Route::get('/blocked-users', [BlockedUsersController::class, 'index'])->name('blocked-users');
        Route::post('/blocked-users/block', [BlockedUsersController::class, 'block'])->name('blocked-users.block');
        Route::delete('/blocked-users/unblock', [BlockedUsersController::class, 'unblock'])->name('blocked-users.unblock');
        Route::get('/blocked-users/search', [BlockedUsersController::class, 'searchUsers'])->name('blocked-users.search');
    });
    // ─────────────────────────────────────────────────────────────────────────

    // ── Employer ─────────────────────────────────────────────────────────────
    Route::middleware('role:employer')->prefix('employer')->name('employer.')->group(function () {

        Route::get('/dashboard', [EmployerDashboardController::class, 'index'])->name('dashboard');
        Route::post('/profile/complete', [EmployerProfileController::class, 'complete'])->name('profile.complete');

        // Employer Profile & Settings
        Route::get('/profile', [EmployerProfileController::class, 'show'])->name('profile.show');
        Route::get('/settings', [EmployerProfileController::class, 'settings'])->name('settings');
        Route::patch('/settings/personal', [EmployerProfileController::class, 'updatePersonal'])->name('settings.personal.update');
        Route::patch('/settings/company', [EmployerProfileController::class, 'updateCompany'])->name('settings.company.update');
        Route::post('/profile/avatar', [EmployerProfileController::class, 'uploadAvatar'])->name('profile.avatar');
        Route::delete('/profile/avatar', [EmployerProfileController::class, 'removeAvatar'])->name('profile.avatar.remove');

        // Blocked Users
        Route::get('/settings/blocked-users', [EmployerBlockedUsersController::class, 'index'])->name('settings.blocked-users');
        Route::post('/settings/blocked-users/block', [EmployerBlockedUsersController::class, 'block'])->name('settings.blocked-users.block');
        Route::delete('/settings/blocked-users/unblock', [EmployerBlockedUsersController::class, 'unblock'])->name('settings.blocked-users.unblock');
        Route::get('/settings/blocked-users/search', [EmployerBlockedUsersController::class, 'searchUsers'])->name('settings.blocked-users.search');

        // ── Job Listings ──────────────────────────────────────────────────
        Route::get('/jobs', [JobListingController::class, 'index'])->name('jobs.index');
        Route::get('/jobs/create', [JobListingController::class, 'create'])->name('jobs.create');
        Route::post('/jobs', [JobListingController::class, 'store'])->name('jobs.store');

        // ⚠️  Static sub-paths (create, etc.) must come BEFORE /{job} wildcard
        Route::get('/jobs/{job}', [JobListingController::class, 'show'])->name('jobs.show');
        Route::get('/jobs/{job}/edit', [JobListingController::class, 'edit'])->name('jobs.edit');
        Route::put('/jobs/{job}', [JobListingController::class, 'update'])->name('jobs.update');
        Route::delete('/jobs/{job}', [JobListingController::class, 'destroy'])->name('jobs.destroy');
        Route::patch('/jobs/{job}/status', [JobListingController::class, 'updateStatus'])->name('jobs.status');

        // Duplicate & Repost
        Route::post('/jobs/{job}/duplicate', [JobListingController::class, 'duplicate'])->name('jobs.duplicate');
        Route::post('/jobs/{job}/repost', [JobListingController::class, 'repost'])->name('jobs.repost');

        // Applications
        Route::get('/jobs/{job}/applications', [JobListingController::class, 'applications'])->name('jobs.applications');
        Route::patch('/jobs/{job}/applications/{application}', [JobListingController::class, 'updateApplicationStatus'])->name('jobs.applications.status');
        Route::post('/jobs/{job}/applications/{application}/reject', [JobListingController::class, 'rejectApplication'])->name('jobs.applications.reject');
        Route::post('/jobs/{job}/applications/{application}/approve', [JobListingController::class, 'approveApplication'])->name('jobs.applications.approve');
        // ─────────────────────────────────────────────────────────────────

        Route::get('/interviews', [InterviewController::class, 'index'])->name('interviews.index');
        Route::put('/interviews/{interview}', [InterviewController::class, 'update'])->name('interviews.update');
        Route::patch('/interviews/{interview}/status', [InterviewController::class, 'updateStatus'])->name('interviews.status');
        Route::post('/interviews/{interview}/pass', [InterviewController::class, 'passInterview'])->name('interviews.pass');
        Route::post('/interviews/{interview}/fail', [InterviewController::class, 'failInterview'])->name('interviews.fail');

        Route::get('/users', [EmployeeController::class, 'index'])->name('users.index');
        Route::post('/users/{application}/end-contract', [EmployeeController::class, 'endContract'])->name('users.end-contract');
    });
    // ─────────────────────────────────────────────────────────────────────────

    // ── Job Seeker ───────────────────────────────────────────────────────────
    Route::middleware('role:job_seeker')->prefix('job-seeker')->name('job-seeker.')->group(function () {
        Route::post('/profile/complete', [JobSeekerProfileController::class, 'complete'])->name('profile.complete');
        Route::get('/profile', [JobSeekerProfileController::class, 'show'])->name('profile.show');
        Route::get('/profile/edit', [JobSeekerProfileController::class, 'edit'])->name('profile.edit');
        Route::match(['POST', 'PATCH'], '/profile', [JobSeekerProfileController::class, 'update'])->name('profile.update');

        // Blocked Users
        Route::get('/settings/blocked-users', [JobSeekerBlockedUsersController::class, 'index'])->name('settings.blocked-users');
        Route::post('/settings/blocked-users/block', [JobSeekerBlockedUsersController::class, 'block'])->name('settings.blocked-users.block');
        Route::delete('/settings/blocked-users/unblock', [JobSeekerBlockedUsersController::class, 'unblock'])->name('settings.blocked-users.unblock');
        Route::get('/settings/blocked-users/search', [JobSeekerBlockedUsersController::class, 'searchUsers'])->name('settings.blocked-users.search');
        Route::get('/jobs', [JobBrowseController::class, 'browse'])->name('jobs.browse');
        Route::get('/jobs/saved', [JobBrowseController::class, 'saved'])->name('jobs.saved');
        Route::post('/jobs/{job}/save', [JobBrowseController::class, 'save'])->name('jobs.save');
        Route::delete('/jobs/{job}/unsave', [JobBrowseController::class, 'unsave'])->name('jobs.unsave');
        Route::get('/jobs/{job}/apply', [JobApplicationController::class, 'create'])->name('jobs.apply.form');
        Route::post('/jobs/{job}/apply', [JobApplicationController::class, 'store'])->name('jobs.apply');
        Route::post('/jobs/{job}/apply/draft', [JobApplicationController::class, 'saveDraft'])->name('jobs.apply.draft');
        Route::get('/jobs/history', [JobBrowseController::class, 'history'])->name('jobs.history');
        Route::get('/jobs/{job}', [JobBrowseController::class, 'show'])->name('jobs.show');

        // Application History
        Route::get('/applications', [JobApplicationController::class, 'index'])->name('applications.index');
        Route::patch('/applications/{application}/withdraw', [JobApplicationController::class, 'withdraw'])->name('applications.withdraw');
    });
    // ─────────────────────────────────────────────────────────────────────────

    // ── Admin ─────────────────────────────────────────────────────────────────
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::post('/employers/{user}/verify', [EmployerVerificationController::class, 'verify'])->name('employers.verify');
        Route::post('/employers/{user}/revoke', [EmployerVerificationController::class, 'revoke'])->name('employers.revoke');
        Route::get('/verifications', [EmployerVerificationController::class, 'index'])->name('verifications');

        // Report Management
        Route::get('/reports', [App\Http\Controllers\Admin\AdminReportController::class, 'index'])->name('reports.index');
        Route::patch('/reports/{report}/approve', [App\Http\Controllers\Admin\AdminReportController::class, 'approve'])->name('reports.approve');
        Route::patch('/reports/{report}/decline', [App\Http\Controllers\Admin\AdminReportController::class, 'decline'])->name('reports.decline');

        // User Management
        Route::get('/users', [UserManagementController::class, 'index'])->name('users.index');
        Route::delete('/users/{user}', [UserManagementController::class, 'destroy'])->name('users.destroy');
        Route::post('/users/{id}/restore', [UserManagementController::class, 'restore'])->name('users.restore');
        Route::patch('/users/{user}/status', [UserManagementController::class, 'updateStatus'])->name('users.status');

        // Job Management
        Route::get('/jobs', [AdminJobController::class, 'index'])->name('jobs.index');
        Route::get('/jobs/{job}', [AdminJobController::class, 'show'])->name('jobs.show');
        Route::get('/jobs/{job}/applications', [AdminJobController::class, 'applications'])->name('jobs.applications');

        // Admin Settings
        Route::get('/settings', [AdminSettingsController::class, 'account'])->name('settings');
        Route::patch('/settings/account', [AdminSettingsController::class, 'updateAccount'])->name('settings.account.update');
        Route::post('/settings/avatar', [AdminSettingsController::class, 'uploadAvatar'])->name('settings.avatar');
        Route::delete('/settings/avatar', [AdminSettingsController::class, 'removeAvatar'])->name('settings.avatar.remove');
        Route::get('/settings/security', [AdminSettingsController::class, 'security'])->name('settings.security');
        Route::patch('/settings/security', [AdminSettingsController::class, 'updateSecurity'])->name('settings.security.update');
        Route::get('/settings/notifications', [AdminSettingsController::class, 'notifications'])->name('settings.notifications');
        Route::patch('/settings/notifications', [AdminSettingsController::class, 'updateNotifications'])->name('settings.notifications.update');
    });
    // ─────────────────────────────────────────────────────────────────────────
});

require __DIR__ . '/auth.php';