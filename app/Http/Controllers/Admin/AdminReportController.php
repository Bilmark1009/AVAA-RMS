<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminReportController extends Controller
{
    public function index(Request $request)
    {
        // For now, we send an empty array so you can test your "Mock Data" logic
        // Later, you can replace this with: $reports = JobReport::with('job')...
        $reports = []; 

        return Inertia::render('Admin/ReportView', [
            'reports' => $reports,
            'filters' => [
                'status' => $request->query('status', 'pending')
            ]
        ]);
    }
}