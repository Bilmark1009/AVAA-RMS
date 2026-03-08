<?php

namespace App\Providers;

use App\Models\JobApplication;
use App\Observers\JobApplicationObserver;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Auto-creates group + direct conversations when an applicant is hired
        JobApplication::observe(JobApplicationObserver::class);
    }
}